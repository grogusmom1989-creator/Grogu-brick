import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client on the server side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Workspace Synthesis & Daily Briefing
  app.post('/api/ai/synthesize', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'AI capability is unavailable. Please verify GEMINI_API_KEY is configured.',
        });
      }

      const { driveFiles, githubRepos, githubIssues, tasks } = req.body;

      const prompt = `You are OmniSync AI, an executive workspace assistant that bridges Google Drive, GitHub, and daily workflows.
Analyze the user's connected workspace items and provide a comprehensive, sharp, high-value Daily Briefing & Action Synthesis.

Workspace Data:
- Google Drive Files (${driveFiles?.length || 0}): ${JSON.stringify(
        (driveFiles || []).slice(0, 15).map((f: any) => ({ name: f.name, type: f.mimeType, modified: f.modifiedTime }))
      )}
- GitHub Repositories (${githubRepos?.length || 0}): ${JSON.stringify(
        (githubRepos || []).slice(0, 10).map((r: any) => ({ name: r.name, stars: r.stargazers_count, issues: r.open_issues_count, updated: r.updated_at }))
      )}
- GitHub Issues & PRs (${githubIssues?.length || 0}): ${JSON.stringify(
        (githubIssues || []).slice(0, 8).map((i: any) => ({ title: i.title, state: i.state, repo: i.repo_name }))
      )}
- Current Tasks (${tasks?.length || 0}): ${JSON.stringify(
        (tasks || []).map((t: any) => ({ title: t.title, status: t.status, priority: t.priority }))
      )}

Please output a structured JSON response with:
1. "executiveSummary": A concise 2-3 sentence pulse check on active work.
2. "crossServiceInsights": 3-4 bullet-point connections between Drive files, GitHub repos, and tasks.
3. "recommendedActionItems": An array of 3-5 specific, high-priority tasks to tackle today with title, estimatedMinutes, and priority (high/medium/low).
4. "syncHealthAssessment": A brief note on work currency and sync freshness.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an intelligent executive assistant summarizing digital workspace assets across Google Drive and GitHub.',
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        res.json({ success: true, data: parsed });
      } catch {
        res.json({ success: true, raw: responseText });
      }
    } catch (error: any) {
      console.error('AI synthesize error:', error);
      res.status(500).json({ error: error.message || 'Failed to synthesize workspace' });
    }
  });

  // AI Workspace Query & Chat
  app.post('/api/ai/query', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'AI capability is unavailable. Please verify GEMINI_API_KEY is configured.',
        });
      }

      const { question, context } = req.body;

      const prompt = `User Question: "${question}"

Current Workspace Context:
- Google Drive Files (${context?.driveFiles?.length || 0}): ${JSON.stringify(
        (context?.driveFiles || []).slice(0, 25).map((f: any) => ({ id: f.id, name: f.name, modified: f.modifiedTime, link: f.webViewLink }))
      )}
- GitHub Repos (${context?.githubRepos?.length || 0}): ${JSON.stringify(
        (context?.githubRepos || []).slice(0, 15).map((r: any) => ({ name: r.name, url: r.html_url, issues: r.open_issues_count }))
      )}
- GitHub Issues (${context?.githubIssues?.length || 0}): ${JSON.stringify(
        (context?.githubIssues || []).slice(0, 15).map((i: any) => ({ title: i.title, url: i.html_url, state: i.state }))
      )}
- Workspace Notes & Tasks: ${JSON.stringify(
        (context?.notes || []).slice(0, 10).map((n: any) => ({ title: n.title, content: n.content?.slice(0, 100) }))
      )}

Provide a clear, helpful, and direct answer referencing specific files, repositories, or tasks when relevant. Keep markdown formatting crisp.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ answer: response.text || 'No response generated.' });
    } catch (error: any) {
      console.error('AI query error:', error);
      res.status(500).json({ error: error.message || 'Failed to process workspace query' });
    }
  });

  // AI Smart Task Generator from Item
  app.post('/api/ai/generate-tasks', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'AI capability is unavailable.',
        });
      }

      const { itemTitle, itemType, itemDetails } = req.body;
      const prompt = `Item Title: ${itemTitle}
Item Type: ${itemType}
Details: ${itemDetails}

Generate 3-5 concrete, actionable tasks that should be done regarding this item. Format as JSON with array of objects containing: "title", "description", "priority" ('high'|'medium'|'low'), and "suggestedTags" (array of strings).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '[]';
      try {
        const parsed = JSON.parse(responseText);
        res.json({ tasks: parsed });
      } catch {
        res.json({ tasks: [] });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Task generation failed' });
    }
  });

  // Mount Vite or serve static assets
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`OmniSync server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
