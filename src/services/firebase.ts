/**
 * Firebase Client Authentication & Firestore Cloud Sync Service.
 * Follows least privilege guidelines, persistent Hub authentication,
 * and Zero-Trust Firestore security rules.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  WorkspaceTask,
  WorkspaceNote,
  WorkspaceProject,
  ProjectBridge,
} from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Ensure user stays signed in across browser restarts, tab reloads, and installed Play Store / PWA sessions
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Auth persistence setup warning:', err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();
// Required Google Drive scope
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Token cached in memory ONLY (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Always keep the user signed into the Hub even across page reloads when in-memory OAuth token is null
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } finally {
    cachedAccessToken = null;
  }
};

// ============================================================================
// Firestore Cloud Persistence Helpers (Zero-Trust Schema Compliant)
// ============================================================================

const truncate = (str: string | undefined | null, max: number): string => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) : str;
};

export async function syncUserProfileToFirestore(user: User, githubUsername?: string) {
  if (!auth.currentUser || auth.currentUser.uid !== user.uid) return;
  const path = `users/${user.uid}`;
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        uid: truncate(user.uid, 128),
        email: truncate(user.email || 'grogusmom1989@gmail.com', 256),
        displayName: truncate(user.displayName || 'OmniSync Creator', 120),
        photoURL: truncate(user.photoURL || '', 1024),
        githubUsername: truncate(githubUsername || 'grogusmom1989', 100),
        paypalHandle: 'grogusmom1989',
        updatedAt: new Date().toISOString().slice(0, 64),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTaskToFirestore(uid: string, task: WorkspaceTask) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/tasks/${task.id}`;
  try {
    const payload: Record<string, any> = {
      id: truncate(task.id, 120),
      title: truncate(task.title || 'Untitled Task', 300),
      status: task.status,
      priority: task.priority,
      source: task.source,
      createdAt: truncate(task.createdAt || new Date().toISOString(), 64),
    };
    if (task.description) payload.description = truncate(task.description, 5000);
    if (task.dueDate) payload.dueDate = truncate(task.dueDate, 64);
    if (task.sourceUrl) payload.sourceUrl = truncate(task.sourceUrl, 1024);
    if (task.sourceTitle) payload.sourceTitle = truncate(task.sourceTitle, 300);
    if (task.tags) payload.tags = task.tags.slice(0, 20);
    await setDoc(doc(db, 'users', uid, 'tasks', task.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTaskFromFirestore(uid: string, taskId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveNoteToFirestore(uid: string, note: WorkspaceNote) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/notes/${note.id}`;
  try {
    const payload: Record<string, any> = {
      id: truncate(note.id, 120),
      title: truncate(note.title || 'Untitled Note', 300),
      content: truncate(note.content || '', 50000),
      tags: (note.tags || []).slice(0, 20),
      updatedAt: truncate(note.updatedAt || new Date().toISOString(), 64),
      pinned: Boolean(note.pinned),
    };
    if (note.linkedDriveId) payload.linkedDriveFileId = truncate(note.linkedDriveId, 200);
    if (note.linkedRepoName) payload.linkedGithubRepo = truncate(note.linkedRepoName, 200);
    await setDoc(doc(db, 'users', uid, 'notes', note.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteNoteFromFirestore(uid: string, noteId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProjectToFirestore(uid: string, project: WorkspaceProject) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/projects/${project.id}`;
  try {
    const payload: Record<string, any> = {
      id: truncate(project.id, 120),
      name: truncate(project.name || 'Untitled Project', 200),
      description: truncate(project.description || '', 2000),
      source: project.source,
      status: project.status,
      tags: (project.tags || []).slice(0, 25),
      techStack: (project.techStack || []).slice(0, 25),
      updatedAt: truncate(project.updatedAt || new Date().toISOString(), 64),
      createdAt: truncate(project.createdAt || new Date().toISOString(), 64),
      isPinned: Boolean(project.isPinned),
    };
    if (project.url) payload.url = truncate(project.url, 1024);
    if (project.previewUrl) payload.homepageUrl = truncate(project.previewUrl, 1024);
    if (project.repoFullName) payload.repoFullName = truncate(project.repoFullName, 200);
    if (project.driveFolderId) payload.driveFolderId = truncate(project.driveFolderId, 200);
    if (project.version) payload.version = truncate(project.version, 50);
    if (project.notes) payload.notes = truncate(project.notes, 5000);
    await setDoc(doc(db, 'users', uid, 'projects', project.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromFirestore(uid: string, projectId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveBridgeToFirestore(uid: string, bridge: ProjectBridge) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/bridges/${bridge.id}`;
  try {
    const payload: Record<string, any> = {
      id: truncate(bridge.id, 120),
      name: truncate(bridge.name || 'bridge', 200),
      sourceModule: truncate(bridge.sourceModule, 100),
      targetModule: truncate(bridge.targetModule, 100),
      title: truncate(bridge.title || 'Bridge', 200),
      description: truncate(bridge.description || '', 1500),
      status: bridge.status,
      syncMode: bridge.syncMode,
      latencyMs: Number(bridge.latencyMs || 10),
      packetsCount: Number(bridge.packetsCount || 0),
      lastEventAt: truncate(bridge.lastEventAt || new Date().toISOString(), 64),
      enabled: Boolean(bridge.enabled),
      category: bridge.category,
    };
    await setDoc(doc(db, 'users', uid, 'bridges', bridge.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBridgeFromFirestore(uid: string, bridgeId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `users/${uid}/bridges/${bridgeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'bridges', bridgeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function pullAllFromFirestore(uid: string): Promise<{
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  projects: WorkspaceProject[];
  bridges: ProjectBridge[];
}> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return { tasks: [], notes: [], projects: [], bridges: [] };
  }

  const tasks: WorkspaceTask[] = [];
  const notes: WorkspaceNote[] = [];
  const projects: WorkspaceProject[] = [];
  const bridges: ProjectBridge[] = [];

  try {
    const tasksSnap = await getDocs(collection(db, 'users', uid, 'tasks'));
    tasksSnap.forEach((d) => tasks.push(d.data() as WorkspaceTask));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/tasks`);
  }

  try {
    const notesSnap = await getDocs(collection(db, 'users', uid, 'notes'));
    notesSnap.forEach((d) => notes.push(d.data() as WorkspaceNote));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/notes`);
  }

  try {
    const projectsSnap = await getDocs(collection(db, 'users', uid, 'projects'));
    projectsSnap.forEach((d) => projects.push(d.data() as WorkspaceProject));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/projects`);
  }

  try {
    const bridgesSnap = await getDocs(collection(db, 'users', uid, 'bridges'));
    bridgesSnap.forEach((d) => bridges.push(d.data() as ProjectBridge));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/bridges`);
  }

  return { tasks, notes, projects, bridges };
}
