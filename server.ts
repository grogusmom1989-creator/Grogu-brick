import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

function getAIClient() {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

// Dynamic in-memory override for Digital Asset Links so user changes in Play Store Studio take effect immediately
let dynamicAssetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'app.omnisync.hub',
      sha256_cert_fingerprints: [
        'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
      ],
    },
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health & Sync Ping
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'OmniSync Hub Engine',
      geminiConfigured: Boolean(process.env.API_KEY || process.env.GEMINI_API_KEY),
    });
  });

  // Live Digital Asset Links endpoint for Google Play Store TWA verification
  app.get('/.well-known/assetlinks.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(dynamicAssetLinks);
  });

  // Update Digital Asset Links dynamically from Play Store Studio
  app.post('/api/playstore/assetlinks', (req, res) => {
    const { packageName, sha256Fingerprints } = req.body;
    if (!packageName) {
      return res.status(400).json({ error: 'packageName is required' });
    }
    const prints = Array.isArray(sha256Fingerprints)
      ? sha256Fingerprints.filter(Boolean)
      : [String(sha256Fingerprints || '').trim()].filter(Boolean);

    dynamicAssetLinks = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName.trim(),
          sha256_cert_fingerprints:
            prints.length > 0
              ? prints
              : ['FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'],
        },
      },
    ];

    try {
      const publicWellKnown = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
      fs.writeFileSync(publicWellKnown, JSON.stringify(dynamicAssetLinks, null, 2), 'utf-8');
    } catch {
      // Ignore write error in read-only containers; in-memory route still serves updated JSON
    }

    res.json({ success: true, assetLinks: dynamicAssetLinks });
  });

  // 1. AI Workspace Synthesis (gemini-4-calcium)
  app.post('/api/ai/synthesize', async (req, res) => {
    try {
      const { driveFiles = [], githubRepos = [], githubIssues = [], tasks = [] } = req.body;
      const ai = getAIClient();

      const prompt = `You are the OmniSync Workspace Intelligence Engine.
Analyze the user's current connected workspace items across Google Drive, GitHub, and their Task list, and provide a concise, high-impact executive synthesis.

Google Drive Files (${driveFiles.length} total, showing recent):
${driveFiles.slice(0, 12).map((f: any) => `- ${f.name} (${f.mimeType}, modified: ${f.modifiedTime})`).join('\n') || 'None'}

GitHub Repositories (${githubRepos.length} total):
${githubRepos.slice(0, 10).map((r: any) => `- ${r.full_name}: ${r.description || 'No description'} (Stars: ${r.stargazers_count}, Issues: ${r.open_issues_count}, Lang: ${r.language})`).join('\n') || 'None'}

GitHub Issues/PRs (${githubIssues.length} total):
${githubIssues.slice(0, 10).map((i: any) => `- [#${i.number}] ${i.title} (${i.state}) in ${i.repo_name || 'repo'}`).join('\n') || 'None'}

Current Workspace Tasks (${tasks.length} total):
${tasks.slice(0, 10).map((t: any) => `- [${t.status}] ${t.title} (Priority: ${t.priority}, Source: ${t.source})`).join('\n') || 'None'}

Return a structured JSON object with:
1. "executiveSummary": A 2-3 sentence overview of current workspace momentum and focus areas.
2. "crossServiceInsights": Array of 3 specific connections or observations across their Drive files, GitHub code, and tasks.
3. "recommendedActionItems": Array of 3 concrete next actions with { "title", "priority", "source", "estimatedMinutes" }.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-calcium',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              crossServiceInsights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActionItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    source: { type: Type.STRING },
                    estimatedMinutes: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      });

      const text = response.text || '{}';
      res.json({ success: true, data: JSON.parse(text) });
    } catch (error: any) {
      console.error('AI Synthesize Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to synthesize workspace data',
      });
    }
  });

  // 2. AI Natural Language Query / Multi-Turn Chat (gemini-4-argon with fallback to gemini-4-calcium)
  app.post('/api/ai/query', async (req, res) => {
    try {
      const { question, context = {}, model = 'gemini-4-calcium', history = [] } = req.body;
      const ai = getAIClient();

      const systemContext = `You are the OmniSync Hub AI Assistant. Answer the user's question using their live synced workspace data from Google Drive, GitHub, Notes, and Tasks, as well as your general engineering, scientific, and creative intelligence.

Workspace Context:
- Drive Files: ${JSON.stringify((context.driveFiles || []).slice(0, 20).map((f: any) => ({ name: f.name, type: f.mimeType, modified: f.modifiedTime, link: f.webViewLink })))}
- GitHub Repos: ${JSON.stringify((context.githubRepos || []).slice(0, 20).map((r: any) => ({ name: r.full_name, desc: r.description, lang: r.language, stars: r.stargazers_count, url: r.html_url })))}
- GitHub Issues: ${JSON.stringify((context.githubIssues || []).slice(0, 15).map((i: any) => ({ number: i.number, title: i.title, state: i.state, url: i.html_url })))}
- Notes: ${JSON.stringify((context.notes || []).slice(0, 10).map((n: any) => ({ title: n.title, content: n.content })))}
- Tasks: ${JSON.stringify((context.tasks || []).slice(0, 15).map((t: any) => ({ title: t.title, status: t.status, priority: t.priority })))}

History:
${history.slice(-6).map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')}

User Question: ${question}`;

      let usedModel = model === 'gemini-4-argon' ? 'gemini-4-argon' : 'gemini-4-calcium';
      let response;
      try {
        response = await ai.models.generateContent({
          model: usedModel,
          contents: systemContext,
        });
      } catch (err) {
        if (usedModel === 'gemini-4-argon') {
          usedModel = 'gemini-4-calcium';
          response = await ai.models.generateContent({
            model: usedModel,
            contents: systemContext,
          });
        } else {
          throw err;
        }
      }

      res.json({ success: true, answer: response.text, modelUsed: usedModel });
    } catch (error: any) {
      console.error('AI Query Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process AI query',
      });
    }
  });

  // 3. AI Sub-task Generator (gemini-4-calcium)
  app.post('/api/ai/generate-tasks', async (req, res) => {
    try {
      const { itemTitle, itemDescription, itemSource } = req.body;
      const ai = getAIClient();

      const response = await ai.models.generateContent({
        model: 'gemini-4-calcium',
        contents: `Break down this ${itemSource || 'workspace'} item into 3 actionable engineering or productivity tasks:
Title: ${itemTitle}
Details: ${itemDescription || 'No extra details'}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING },
                tag: { type: Type.STRING },
              },
            },
          },
        },
      });

      res.json({ success: true, tasks: JSON.parse(response.text || '[]') });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 4. Search & Maps Grounding Endpoint
  // Search uses gemini-4-calcium + googleSearch; Maps uses gemini-2.5-flash + googleMaps
  app.post('/api/ai/grounding', async (req, res) => {
    try {
      const { query, mode = 'search', lat, lng } = req.body;
      const ai = getAIClient();

      if (mode === 'maps') {
        const config: any = {
          tools: [{ googleMaps: {} }],
        };
        if (typeof lat === 'number' && typeof lng === 'number') {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng,
              },
            },
          };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: query,
          config,
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks
          .map((chunk: any) => {
            if (chunk.maps) {
              return {
                type: 'maps',
                title: chunk.maps.title || 'Google Maps Place',
                uri: chunk.maps.uri,
                placeId: chunk.maps.placeId,
              };
            }
            if (chunk.web) {
              return {
                type: 'web',
                title: chunk.web.title || 'Web Source',
                uri: chunk.web.uri,
              };
            }
            return null;
          })
          .filter(Boolean);

        return res.json({
          success: true,
          mode: 'maps',
          model: 'gemini-2.5-flash',
          text: response.text || '',
          sources,
        });
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-4-calcium',
          contents: query,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks
          .map((chunk: any) => {
            if (chunk.web) {
              return {
                type: 'web',
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
              };
            }
            return null;
          })
          .filter(Boolean);

        return res.json({
          success: true,
          mode: 'search',
          model: 'gemini-4-calcium',
          text: response.text || '',
          sources,
        });
      }
    } catch (error: any) {
      console.error('Grounding Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Grounding request failed',
      });
    }
  });

  // 5. Audio Transcription Endpoint (gemini-4-calcium)
  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm', prompt = 'Transcribe this audio accurately and provide a concise summary and action items if applicable.' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ success: false, error: 'Missing audioBase64 payload' });
      }
      const ai = getAIClient();
      const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;

      const response = await ai.models.generateContent({
        model: 'gemini-4-calcium',
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      });

      res.json({
        success: true,
        model: 'gemini-4-calcium',
        transcript: response.text || '',
      });
    } catch (error: any) {
      console.error('Audio Transcription Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to transcribe audio',
      });
    }
  });

  // 6. Nano Banana 2.1 Image Generation & Editing (gemini-nano-banana-2.1)
  app.post('/api/ai/image', async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = '1:1',
        imageSize = '1K',
        sourceImageBase64,
        sourceImageMimeType = 'image/png',
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Prompt is required' });
      }

      const ai = getAIClient();
      const parts: any[] = [];

      if (sourceImageBase64) {
        const cleanData = sourceImageBase64.includes(',')
          ? sourceImageBase64.split(',')[1]
          : sourceImageBase64;
        parts.push({
          inlineData: {
            data: cleanData,
            mimeType: sourceImageMimeType,
          },
        });
      }
      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      });

      let imageUrl: string | null = null;
      let textCaption = '';

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textCaption += part.text;
        }
      }

      if (!imageUrl) {
        return res.status(422).json({
          success: false,
          error: textCaption || 'No image returned by gemini-nano-banana-2.1. A paid API key may be required for this resolution/model.',
        });
      }

      res.json({
        success: true,
        model: 'gemini-nano-banana-2.1',
        imageUrl,
        caption: textCaption,
      });
    } catch (error: any) {
      console.error('Nano Banana Image Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Image generation failed. You may need to select a paid Gemini API key.',
      });
    }
  });

  // 7. Omni Flash Video Generation & Photo Animation (gemini-omni-1.1-flash via Interactions API)
  app.post('/api/ai/video/start', async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = '16:9',
        resolution = '720p',
        duration = 8,
        sourceImageBase64,
        sourceImageMimeType = 'image/png',
      } = req.body;

      const ai = getAIClient();

      let inputPayload: any = prompt || 'Cinematic futuristic workspace visualization';
      if (sourceImageBase64) {
        const cleanData = sourceImageBase64.includes(',')
          ? sourceImageBase64.split(',')[1]
          : sourceImageBase64;
        inputPayload = [
          { type: 'text', text: prompt || 'Animate this image with smooth cinematic motion' },
          {
            type: 'image',
            data: cleanData,
            mime_type: sourceImageMimeType,
          },
        ];
      }

      const interaction = await (ai as any).interactions.create({
        model: 'gemini-omni-1.1-flash',
        input: inputPayload,
        response_modalities: ['video'],
        generation_config: {
          video_config: {
            aspect_ratio: aspectRatio,
            resolution,
            duration: Number(duration) || 8,
          },
        },
      });

      res.json({
        success: true,
        interactionId: interaction.id,
        status: interaction.status || 'in_progress',
      });
    } catch (error: any) {
      console.error('Omni Flash Video Start Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start Omni Flash video generation. Ensure a paid API key is configured.',
      });
    }
  });

  app.get('/api/ai/video/status/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const ai = getAIClient();
      const statusResponse = await (ai as any).interactions.get(id);

      let videoDataUrl: string | null = null;
      let videoUri: string | null = null;

      if (statusResponse.status === 'completed' && Array.isArray(statusResponse.outputs)) {
        for (const output of statusResponse.outputs) {
          if (output.type === 'video') {
            if (output.data) {
              const mime = output.mime_type || 'video/mp4';
              videoDataUrl = `data:${mime};base64,${output.data}`;
            } else if (output.uri) {
              videoUri = output.uri;
            }
          }
        }
      }

      res.json({
        success: true,
        id,
        status: statusResponse.status,
        videoDataUrl,
        videoUri,
        error: statusResponse.error || null,
      });
    } catch (error: any) {
      console.error('Omni Flash Video Status Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check video interaction status',
      });
    }
  });

  // 8. Lyria 3 Music Generation (lyria-3-clip-preview / lyria-3-pro-preview)
  app.post('/api/ai/music', async (req, res) => {
    try {
      const { prompt, mode = 'clip' } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Music prompt is required' });
      }

      const ai = getAIClient();
      const modelName = mode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
      });

      let audioBase64 = '';
      let audioMimeType = 'audio/wav';
      let lyricsOrText = '';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            audioBase64 += part.inlineData.data;
            if (part.inlineData.mimeType) {
              audioMimeType = part.inlineData.mimeType;
            }
          }
          if (part.text) {
            lyricsOrText += part.text;
          }
        }
      }

      if (!audioBase64) {
        return res.status(422).json({
          success: false,
          error: lyricsOrText || 'No audio stream returned by Lyria 3. A paid API key may be required.',
        });
      }

      res.json({
        success: true,
        model: modelName,
        audioDataUrl: `data:${audioMimeType};base64,${audioBase64}`,
        lyrics: lyricsOrText,
      });
    } catch (error: any) {
      console.error('Lyria Music Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Music generation failed.',
      });
    }
  });

  // 9. Gemini Live API Client Key Config
  app.get('/api/ai/live-config', (_req, res) => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    res.json({
      configured: Boolean(apiKey),
      apiKey,
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OmniSync Hub Server running on http://localhost:${PORT}`);
  });
}

startServer();
