import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  Sparkles,
  Send,
  RefreshCw,
  Plus,
  Bot,
  User as UserIcon,
  Globe,
  MapPin,
  Mic,
  MicOff,
  Image as ImageIcon,
  Video,
  Music,
  Upload,
  Download,
  ExternalLink,
  KeyRound,
  Volume2,
  FileAudio,
  CheckCircle2,
} from 'lucide-react';
import { GoogleDriveFile, GitHubRepo, GitHubIssue, WorkspaceTask, WorkspaceNote } from '../types';

interface AICopilotViewProps {
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  githubIssues: GitHubIssue[];
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onAddNote?: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

type StudioTab =
  | 'chat'
  | 'grounding'
  | 'voice_audio'
  | 'image_studio'
  | 'video_studio'
  | 'music_studio';

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  driveFiles,
  githubRepos,
  githubIssues,
  tasks,
  notes,
  onAddTask,
  onAddNote,
}) => {
  const [activeStudio, setActiveStudio] = useState<StudioTab>('chat');

  // 1. Chat & Synthesis State
  const [selectedChatModel, setSelectedChatModel] = useState<'gemini-4-calcium' | 'gemini-4-argon'>(
    'gemini-4-calcium'
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your OmniSync Multi-Modal AI Studio & Workspace Copilot. Switch between **Workspace Chat (Gemini 4 Argon / Calcium)**, **Google Search & Maps Grounding**, **Gemini Live Voice & Audio Transcription**, **Nano Banana 2.1 Image Studio**, **Omni Flash Video Studio**, and **Lyria 3 Music Generator** using the tabs above.`,
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: 'gemini-4-calcium',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [synthesisData, setSynthesisData] = useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // 2. Search & Maps Grounding State
  const [groundingMode, setGroundingMode] = useState<'search' | 'maps'>('search');
  const [groundingQuery, setGroundingQuery] = useState('');
  const [groundingResult, setGroundingResult] = useState<{
    text: string;
    sources: Array<{ type: string; title: string; uri: string }>;
    model: string;
  } | null>(null);
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);

  // 3. Voice Live API & Audio Transcription State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Ready to connect to Gemini Live Voice');
  const [liveTranscripts, setLiveTranscripts] = useState<string[]>([]);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // 4. Nano Banana 2.1 Image Studio State
  const [imagePrompt, setImagePrompt] = useState(
    'A futuristic cybernetic command center floating above a bioluminescent ocean at twilight, ultra-detailed architectural photography'
  );
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [editSourceImage, setEditSourceImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 5. Omni Flash Video Studio State
  const [videoPrompt, setVideoPrompt] = useState(
    'Smooth cinematic drone flight through a neon holographic data nexus with glowing emerald particles'
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoSourceImage, setVideoSourceImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatusText, setVideoStatusText] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // 6. Lyria 3 Music Studio State
  const [musicPrompt, setMusicPrompt] = useState(
    'Upbeat synthwave electronic track at 118 BPM with warm analog arpeggios, deep bassline, and ethereal pads'
  );
  const [musicMode, setMusicMode] = useState<'clip' | 'pro'>('clip');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState<string>('');
  const [musicError, setMusicError] = useState<string | null>(null);

  const handleOpenPaidKeySelector = async () => {
    const win = window as any;
    if (win.aistudio?.openSelectKey) {
      await win.aistudio.openSelectKey();
    }
  };

  // --- 1. CHAT & SYNTHESIS HANDLERS ---
  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveFiles,
          githubRepos,
          githubIssues,
          tasks,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSynthesisData(json.data);
      }
    } catch (err) {
      console.error('Synthesis failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          model: selectedChatModel,
          history: messages,
          context: {
            driveFiles,
            githubRepos,
            githubIssues,
            notes,
            tasks,
          },
        }),
      });

      const json = await res.json();
      const botMsg: ChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: json.answer || json.error || 'Could not retrieve an answer.',
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: json.modelUsed || selectedChatModel,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: 'Failed to process your request.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. SEARCH & MAPS GROUNDING HANDLER ---
  const handleRunGrounding = async (overrideQuery?: string) => {
    const q = (overrideQuery || groundingQuery).trim();
    if (!q || isGroundingLoading) return;
    setIsGroundingLoading(true);

    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (groundingMode === 'maps' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Proceed without geolocation if denied
        }
      }

      const res = await fetch('/api/ai/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          mode: groundingMode,
          lat,
          lng,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGroundingResult({
          text: json.text,
          sources: json.sources || [],
          model: json.model,
        });
      } else {
        setGroundingResult({
          text: json.error || 'Grounding query failed.',
          sources: [],
          model: groundingMode === 'maps' ? 'gemini-2.5-flash' : 'gemini-4-calcium',
        });
      }
    } catch (err: any) {
      setGroundingResult({
        text: err.message || 'Network error running grounded search.',
        sources: [],
        model: 'gemini-4-calcium',
      });
    } finally {
      setIsGroundingLoading(false);
    }
  };

  // --- 3. GEMINI LIVE VOICE & AUDIO TRANSCRIPTION ---
  const startLiveVoiceSession = async () => {
    try {
      setLiveStatus('Initializing Gemini Live WebSocket...');
      const cfgRes = await fetch('/api/ai/live-config');
      const cfg = await cfgRes.json();
      if (!cfg.apiKey) {
        setLiveStatus('API Key not found in environment.');
        return;
      }

      const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
      });
      mediaStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are the real-time voice copilot for OmniSync Hub. Keep responses natural, concise, and helpful.',
        },
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);
            setLiveStatus('Live Voice Active — Speak into your microphone');
            setLiveTranscripts((prev) => [
              ...prev,
              '[Connected to Gemini 2.5 Native Audio Live Session]',
            ]);

            // Stream 16kHz PCM audio from microphone
            const micCtx = new AudioContext({ sampleRate: 16000 });
            const source = micCtx.createMediaStreamSource(stream);
            const processor = micCtx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              const float32Data = e.inputBuffer.getChannelData(0);
              const int16Data = new Int16Array(float32Data.length);
              for (let i = 0; i < float32Data.length; i++) {
                const s = Math.max(-1, Math.min(1, float32Data[i]));
                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              const bytes = new Uint8Array(int16Data.buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64Audio = btoa(binary);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' },
                });
              });
            };

            source.connect(processor);
            processor.connect(micCtx.destination);
          },
          onmessage: async (message: any) => {
            const part = message.serverContent?.modelTurn?.parts?.[0];
            if (part?.text) {
              setLiveTranscripts((prev) => [...prev, `AI: ${part.text}`]);
            }
            const base64Audio = part?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const binaryStr = atob(base64Audio);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
              }
              const int16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(int16.length);
              for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768;
              }
              const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
              audioBuffer.getChannelData(0).set(float32);
              const sourceNode = audioContextRef.current.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(audioContextRef.current.destination);
              sourceNode.start();
            }
          },
          onclose: () => {
            setIsLiveConnected(false);
            setLiveStatus('Live session disconnected');
          },
          onerror: (err: any) => {
            console.error('Live API error:', err);
            setLiveStatus('Live connection encountered an error');
          },
        },
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err: any) {
      setLiveStatus(`Could not start Live Voice: ${err.message}`);
    }
  };

  const stopLiveVoiceSession = () => {
    try {
      liveSessionRef.current?.close?.();
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    } catch {
      // Ignore cleanup errors
    }
    setIsLiveConnected(false);
    setLiveStatus('Disconnected');
  };

  // Microphone recording for Gemini 4 Calcium Audio Transcription
  const startAudioRecordingForTranscription = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          await transcribeBase64Audio(base64, 'audio/webm');
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch (err: any) {
      setTranscriptionResult(`Microphone access error: ${err.message}`);
    }
  };

  const stopAudioRecordingForTranscription = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingAudio(false);
  };

  const transcribeBase64Audio = async (base64: string, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64, mimeType }),
      });
      const json = await res.json();
      setTranscriptionResult(json.transcript || json.error || 'No transcription returned.');
    } catch (err: any) {
      setTranscriptionResult(`Error transcribing audio: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // --- 4. NANO BANANA 2.1 IMAGE GENERATION & EDITING ---
  const handleGenerateOrEditImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          imageSize,
          sourceImageBase64: editSourceImage?.base64,
          sourceImageMimeType: editSourceImage?.mimeType,
        }),
      });
      const json = await res.json();
      if (json.success && json.imageUrl) {
        setGeneratedImageUrl(json.imageUrl);
      } else {
        setImageError(json.error || 'Failed to generate image.');
      }
    } catch (err: any) {
      setImageError(err.message || 'Image request failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- 5. OMNI FLASH VIDEO GENERATION & PHOTO ANIMATION ---
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setVideoStatusText('Starting Omni Flash 1.1 video interaction...');

    try {
      const startRes = await fetch('/api/ai/video/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
          resolution: videoResolution,
          duration: 8,
          sourceImageBase64: videoSourceImage?.base64,
          sourceImageMimeType: videoSourceImage?.mimeType,
        }),
      });
      const startJson = await startRes.json();
      if (!startJson.success || !startJson.interactionId) {
        throw new Error(startJson.error || 'Could not start video generation.');
      }

      const interactionId = startJson.interactionId;
      setVideoStatusText(`Rendering video (ID: ${interactionId.slice(0, 10)}...) — polling every 5s...`);

      for (let attempt = 0; attempt < 36; attempt++) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(`/api/ai/video/status/${interactionId}`);
        const pollJson = await pollRes.json();

        if (pollJson.status === 'completed') {
          setGeneratedVideoUrl(pollJson.videoDataUrl || pollJson.videoUri);
          setVideoStatusText('Video generation complete!');
          setIsGeneratingVideo(false);
          return;
        } else if (pollJson.status === 'failed' || pollJson.status === 'cancelled') {
          throw new Error(pollJson.error || `Video generation ${pollJson.status}`);
        } else {
          setVideoStatusText(`Rendering video... (${(attempt + 1) * 5}s elapsed)`);
        }
      }
      throw new Error('Video generation timed out.');
    } catch (err: any) {
      setVideoError(err.message || 'Video generation failed.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- 6. LYRIA 3 MUSIC STUDIO ---
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isGeneratingMusic) return;
    setIsGeneratingMusic(true);
    setMusicError(null);
    setGeneratedMusicUrl(null);

    try {
      const res = await fetch('/api/ai/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          mode: musicMode,
        }),
      });
      const json = await res.json();
      if (json.success && json.audioDataUrl) {
        setGeneratedMusicUrl(json.audioDataUrl);
        setGeneratedLyrics(json.lyrics || '');
      } else {
        setMusicError(json.error || 'Music generation failed.');
      }
    } catch (err: any) {
      setMusicError(err.message || 'Music generation request failed.');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleFileToBase64 = (
    file: File,
    cb: (data: { base64: string; mimeType: string; name: string }) => void
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      cb({
        base64: reader.result as string,
        mimeType: file.type || 'image/png',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>OmniSync Multi-Modal Gemini AI Creative &amp; Intelligence Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by Gemini 4 Argon &amp; Calcium, Google Search &amp; Maps Grounding, Gemini Live Native Audio, Nano Banana 2.1 Image, Omni Flash Video, and Lyria 3 Music.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenPaidKeySelector}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Optional: Configure a paid Gemini API key for 4K Nano Banana images, Omni Flash video, and Lyria 3 Pro music"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            API Key Options
          </button>
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Workspace Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Modal Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'chat', label: 'AI Chat (Argon / Calcium)', icon: Bot },
          { id: 'grounding', label: 'Search & Maps Grounding', icon: Globe },
          { id: 'voice_audio', label: 'Live Voice & Transcribe', icon: Mic },
          { id: 'image_studio', label: 'Nano Banana 2.1 Images', icon: ImageIcon },
          { id: 'video_studio', label: 'Omni Flash Video', icon: Video },
          { id: 'music_studio', label: 'Lyria 3 Music', icon: Music },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeStudio === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudio(tab.id as StudioTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Executive Synthesis Card */}
      {synthesisData && (
        <div className="bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Workspace Executive Briefing (Gemini 4 Calcium)</span>
            </h3>
            <button
              onClick={() => setSynthesisData(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          {synthesisData.executiveSummary && (
            <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              {synthesisData.executiveSummary}
            </div>
          )}

          {synthesisData.recommendedActionItems?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {synthesisData.recommendedActionItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="truncate min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.estimatedMinutes || 30}m • {item.priority}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onAddTask({
                        title: item.title,
                        description: 'Generated by OmniSync AI Copilot',
                        status: 'todo',
                        priority: (item.priority?.toLowerCase() as any) || 'medium',
                        source: 'ai',
                        tags: ['AI', 'Copilot'],
                      })
                    }
                    className="px-2 py-1 text-[10px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded shrink-0"
                  >
                    + Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1. MULTI-TURN CHAT STUDIO */}
      {activeStudio === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
          <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Workspace-Aware Conversational Assistant
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedChatModel('gemini-4-calcium')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                  selectedChatModel === 'gemini-4-calcium'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                gemini-4-calcium (Fast)
              </button>
              <button
                onClick={() => setSelectedChatModel('gemini-4-argon')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                  selectedChatModel === 'gemini-4-argon'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                gemini-4-argon (Deep Reasoning)
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="text-[9px] mt-1 font-mono opacity-60">
                    {msg.timestamp} {msg.modelUsed ? `• ${msg.modelUsed}` : ''}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Reasoning with {selectedChatModel}...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your repositories, Google Drive files, code architecture, or tasks..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* 2. SEARCH & MAPS GROUNDING STUDIO */}
      {activeStudio === 'grounding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Live Google Search &amp; Google Maps Grounding
              </h3>
              <p className="text-xs text-slate-400">
                Search Grounding uses <code className="text-cyan-300">gemini-4-calcium</code> with live web citations; Maps Grounding uses <code className="text-emerald-300">gemini-2.5-flash</code> with Google Maps places.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGroundingMode('search')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  groundingMode === 'search'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                Google Search Grounding
              </button>
              <button
                onClick={() => setGroundingMode('maps')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  groundingMode === 'maps'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Google Maps Grounding
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunGrounding();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={groundingQuery}
              onChange={(e) => setGroundingQuery(e.target.value)}
              placeholder={
                groundingMode === 'search'
                  ? 'Ask about breaking tech news, live release notes, or factual web data...'
                  : 'Find top-rated coworking spaces, coffee shops, or tech hubs near me...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              disabled={isGroundingLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
            >
              {isGroundingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Run Grounded Query
            </button>
          </form>

          {groundingResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {groundingResult.text}
              </div>

              {groundingResult.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Verified Grounding Sources &amp; Places ({groundingResult.sources.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-cyan-300"
                      >
                        <span className="truncate font-medium">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. GEMINI LIVE VOICE & AUDIO TRANSCRIPTION STUDIO */}
      {activeStudio === 'voice_audio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Gemini Live Native Audio Voice Assistant */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Gemini Live Real-Time Voice Assistant
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  gemini-2.5-flash-native-audio-preview-12-2025
                </p>
              </div>
              {isLiveConnected ? (
                <button
                  onClick={stopLiveVoiceSession}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  End Live Call
                </button>
              ) : (
                <button
                  onClick={startLiveVoiceSession}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Start Live Voice Session
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
              Status: {liveStatus}
            </div>

            <div className="h-48 overflow-y-auto p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              {liveTranscripts.length === 0 ? (
                <span className="text-slate-500">
                  Click &ldquo;Start Live Voice Session&rdquo; to converse with low-latency bidirectional PCM audio.
                </span>
              ) : (
                liveTranscripts.map((line, i) => <div key={i}>{line}</div>)
              )}
            </div>
          </div>

          {/* Right: Audio Transcription (Gemini 4 Calcium) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-purple-400" />
                  Audio Note Transcriber
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Powered by gemini-4-calcium
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isRecordingAudio ? (
                  <button
                    onClick={stopAudioRecordingForTranscription}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    Stop &amp; Transcribe
                  </button>
                ) : (
                  <button
                    onClick={startAudioRecordingForTranscription}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Record Mic Note
                  </button>
                )}

                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        handleFileToBase64(f, ({ base64, mimeType }) =>
                          transcribeBase64Audio(base64, mimeType)
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="min-h-[210px] p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {isTranscribing ? (
                <span className="text-purple-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Transcribing audio with Gemini 4 Calcium...
                </span>
              ) : (
                transcriptionResult || 'Record your microphone or upload an audio file (.mp3, .wav, .webm) to transcribe and extract action items.'
              )}
            </div>

            {transcriptionResult && onAddNote && (
              <button
                onClick={() =>
                  onAddNote({
                    title: `Voice Transcript — ${new Date().toLocaleTimeString()}`,
                    content: transcriptionResult,
                    tags: ['VoiceNote', 'Transcript'],
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save Transcript to Workspace Notes
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. NANO BANANA 2.1 IMAGE GENERATION & EDITING STUDIO */}
      {activeStudio === 'image_studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                Nano Banana 2.1 Image Generation &amp; Image Editing Studio
              </h3>
              <p className="text-xs text-slate-400">
                Model: <code className="text-amber-300">gemini-nano-banana-2.1</code> • Supports ultra-wide aspect ratios, up to 4K resolution, and image-to-image prompt editing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Prompt (Generation or Edit Instruction)
                </label>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  placeholder="Describe the image to generate, or how to edit the uploaded reference image..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    {['1:1', '16:9', '9:16', '4:3', '3:4', '4:1', '1:4', '8:1', '1:8'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Resolution Size</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    {['512px', '1K', '2K', '4K'].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Reference Image for Image Editing */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Optional: Upload Image to Edit
                  </span>
                  {editSourceImage && (
                    <button
                      onClick={() => setEditSourceImage(null)}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <label className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  {editSourceImage ? editSourceImage.name : 'Choose Reference Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileToBase64(f, setEditSourceImage);
                    }}
                  />
                </label>
              </div>

              <button
                onClick={handleGenerateOrEditImage}
                disabled={isGeneratingImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                {isGeneratingImage ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                {isGeneratingImage
                  ? 'Rendering with Nano Banana 2.1...'
                  : editSourceImage
                  ? 'Edit Uploaded Image'
                  : 'Generate Image'}
              </button>
            </div>

            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[340px]">
              {imageError && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 max-w-md text-center space-y-2">
                  <div>{imageError}</div>
                  <button
                    onClick={handleOpenPaidKeySelector}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Select Paid API Key
                  </button>
                </div>
              )}

              {generatedImageUrl ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <img
                    src={generatedImageUrl}
                    alt="Generated by Nano Banana 2.1"
                    className="max-h-[380px] rounded-xl object-contain border border-slate-800"
                  />
                  <a
                    href={generatedImageUrl}
                    download={`omnisync-nanobanana-${Date.now()}.png`}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PNG
                  </a>
                </div>
              ) : (
                !imageError && (
                  <div className="text-xs text-slate-500 text-center">
                    Generated or edited artwork will appear here.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. OMNI FLASH VIDEO GENERATION & PHOTO ANIMATION STUDIO */}
      {activeStudio === 'video_studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">
              Omni Flash Video Generator &amp; Photo Animator
            </h3>
            <p className="text-xs text-slate-400">
              Model: <code className="text-cyan-300">gemini-omni-1.1-flash</code> via Interactions API • Generate 16:9 or 9:16 videos from text or animate an uploaded photo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <textarea
                rows={4}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                placeholder="Describe the video scene or camera motion..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Aspect Ratio</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait (Reels)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Resolution</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value as '720p' | '1080p')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Optional: Upload Photo to Animate
                  </span>
                  {videoSourceImage && (
                    <button
                      onClick={() => setVideoSourceImage(null)}
                      className="text-[11px] text-rose-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <label className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  {videoSourceImage ? videoSourceImage.name : 'Upload Starting Frame Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileToBase64(f, setVideoSourceImage);
                    }}
                  />
                </label>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {isGeneratingVideo ? 'Rendering Video...' : 'Generate Omni Flash Video'}
              </button>
            </div>

            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[340px]">
              {videoStatusText && (
                <div className="text-xs text-cyan-300 font-mono mb-3">{videoStatusText}</div>
              )}
              {videoError && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 max-w-md text-center space-y-2">
                  <div>{videoError}</div>
                  <button
                    onClick={handleOpenPaidKeySelector}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Select Paid API Key
                  </button>
                </div>
              )}
              {generatedVideoUrl && (
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-[360px] rounded-xl border border-slate-800"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. LYRIA 3 MUSIC GENERATOR STUDIO */}
      {activeStudio === 'music_studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Lyria 3 AI Music &amp; Song Generator</h3>
              <p className="text-xs text-slate-400">
                Models: <code className="text-purple-300">lyria-3-clip-preview</code> (30s clip) &amp; <code className="text-pink-300">lyria-3-pro-preview</code> (Full-length structured track).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMusicMode('clip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  musicMode === 'clip'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                30s Clip (lyria-3-clip-preview)
              </button>
              <button
                onClick={() => setMusicMode('pro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  musicMode === 'pro'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Full Song (lyria-3-pro-preview)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <textarea
                rows={4}
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                placeholder="Describe genre, tempo (BPM), instruments, mood, or include [Verse] and [Chorus] lyrics..."
              />
              <button
                onClick={handleGenerateMusic}
                disabled={isGeneratingMusic}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                {isGeneratingMusic ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Music className="w-4 h-4" />
                )}
                {isGeneratingMusic ? 'Composing with Lyria 3...' : 'Generate Music Track'}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center space-y-4">
              {musicError && (
                <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/40 p-3 rounded-xl">
                  {musicError}
                </div>
              )}
              {generatedMusicUrl ? (
                <div className="space-y-3">
                  <audio src={generatedMusicUrl} controls className="w-full" />
                  {generatedLyrics && (
                    <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {generatedLyrics}
                    </pre>
                  )}
                </div>
              ) : (
                !musicError && (
                  <div className="text-xs text-slate-500 text-center">
                    Generated Lyria 3 audio stream and lyrics will appear here.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
