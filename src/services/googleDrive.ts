import { GoogleDriveFile } from '../types';
import { getAccessToken } from './firebase';

export interface DriveFetchResult {
  files: GoogleDriveFile[];
  nextPageToken?: string;
  error?: string;
}

export const fetchDriveFiles = async (
  searchQuery = '',
  mimeFilter = 'all'
): Promise<DriveFetchResult> => {
  const token = await getAccessToken();
  if (!token) {
    return {
      files: [],
      error: 'Google Drive authentication required. Please sign in.',
    };
  }

  try {
    let q = 'trashed = false';

    if (searchQuery.trim()) {
      const escaped = searchQuery.replace(/'/g, "\\'");
      q += ` and (name contains '${escaped}' or fullText contains '${escaped}')`;
    }

    if (mimeFilter === 'docs') {
      q += ` and mimeType = 'application/vnd.google-apps.document'`;
    } else if (mimeFilter === 'sheets') {
      q += ` and mimeType = 'application/vnd.google-apps.spreadsheet'`;
    } else if (mimeFilter === 'slides') {
      q += ` and mimeType = 'application/vnd.google-apps.presentation'`;
    } else if (mimeFilter === 'folders') {
      q += ` and mimeType = 'application/vnd.google-apps.folder'`;
    } else if (mimeFilter === 'pdf') {
      q += ` and mimeType = 'application/pdf'`;
    } else if (mimeFilter === 'media') {
      q += ` and (mimeType contains 'image/' or mimeType contains 'video/' or mimeType contains 'audio/')`;
    }

    const params = new URLSearchParams({
      pageSize: '100',
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink,starred,owners,description,shared)',
      orderBy: 'modifiedTime desc',
      q,
    });

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (err: any) {
    console.error('Error fetching Google Drive files:', err);
    return {
      files: [],
      error: err.message || 'Failed to fetch Google Drive files',
    };
  }
};

export const getDriveFileType = (mimeType: string) => {
  if (mimeType.includes('document')) return { label: 'Document', color: 'text-blue-500 bg-blue-500/10' };
  if (mimeType.includes('spreadsheet')) return { label: 'Spreadsheet', color: 'text-emerald-500 bg-emerald-500/10' };
  if (mimeType.includes('presentation')) return { label: 'Presentation', color: 'text-amber-500 bg-amber-500/10' };
  if (mimeType.includes('folder')) return { label: 'Folder', color: 'text-slate-400 bg-slate-500/10' };
  if (mimeType.includes('pdf')) return { label: 'PDF', color: 'text-red-500 bg-red-500/10' };
  if (mimeType.includes('image')) return { label: 'Image', color: 'text-purple-500 bg-purple-500/10' };
  if (mimeType.includes('video')) return { label: 'Video', color: 'text-rose-500 bg-rose-500/10' };
  if (mimeType.includes('audio')) return { label: 'Audio', color: 'text-pink-500 bg-pink-500/10' };
  return { label: 'File', color: 'text-gray-400 bg-gray-500/10' };
};

export const formatFileSize = (bytes?: string | number): string => {
  if (!bytes) return '--';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '--';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${(num / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
