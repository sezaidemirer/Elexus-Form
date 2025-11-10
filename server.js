import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Elexus-Form';
const SUBMISSION_FILE_PATH = process.env.GITHUB_FILE_PATH || 'data/submissions.json';
const GITHUB_API_BASE = 'https://api.github.com';

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.warn(
    'Uyarı: GITHUB_TOKEN, GITHUB_OWNER veya GITHUB_REPO ortam değişkenleri tanımlı değil. GitHub\'a kayıt işlemleri başarısız olur.'
  );
}

app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const githubHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  'User-Agent': 'Elexus-Form-App',
};

async function readSubmissionsFile() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub ortam değişkenleri eksik.');
  }

  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SUBMISSION_FILE_PATH}`;
  const response = await fetch(url, { headers: githubHeaders });

  if (response.status === 404) {
    return { submissions: [], sha: null };
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub dosyası okunamadı: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const decodedContent = Buffer.from(payload.content, 'base64').toString('utf-8');
  const submissions = decodedContent.trim() ? JSON.parse(decodedContent) : [];

  return { submissions, sha: payload.sha };
}

async function writeSubmissionsFile(submissions, sha) {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub ortam değişkenleri eksik.');
  }

  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SUBMISSION_FILE_PATH}`;
  const content = Buffer.from(JSON.stringify(submissions, null, 2)).toString('base64');
  const message = `Yeni form kaydı eklendi (${new Date().toISOString()})`;

  const body = {
    message,
    content,
    branch: process.env.GITHUB_BRANCH || 'main',
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub dosyası güncellenemedi: ${response.status} ${errorBody}`);
  }
}

app.post('/api/submissions', async (req, res) => {
  try {
    const submission = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...req.body,
    };

    const { submissions, sha } = await readSubmissionsFile();
    submissions.push(submission);
    await writeSubmissionsFile(submissions, sha);

    res.status(201).json({ message: 'Form kaydı başarıyla GitHub\'a kaydedildi.', submissionId: submission.id });
  } catch (error) {
    console.error('Form kaydı sırasında hata:', error);
    res.status(500).json({ message: 'Form kaydı sırasında bir hata oluştu.', error: error.message });
  }
});

app.get('/api/submissions', async (_req, res) => {
  try {
    const { submissions } = await readSubmissionsFile();
    res.json({ submissions });
  } catch (error) {
    console.error('Form kayıtları alınırken hata:', error);
    res.status(500).json({ message: 'Form kayıtları alınırken bir hata oluştu.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

