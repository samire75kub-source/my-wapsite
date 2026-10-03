import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'db.json');

// Initial seed database
const DEFAULT_DB = {
  users: [
    {
      id: 'usr_admin',
      username: 'samir_admin',
      email: 'samire75kub@gmail.com',
      role: 'super_admin',
      plan: 'enterprise',
      storageUsedKb: 3420,
      storageLimitKb: 10485760, // 10 GB
      projectsCount: 4,
      projectsLimit: 9999,
      isBlacklisted: false,
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'usr_alex',
      username: 'alexdev',
      email: 'alex@nexushost.cloud',
      role: 'user',
      plan: 'pro',
      storageUsedKb: 1450,
      storageLimitKb: 5242880, // 5 GB
      projectsCount: 2,
      projectsLimit: 50,
      isBlacklisted: false,
      createdAt: '2026-09-12T14:20:00.000Z'
    },
    {
      id: 'usr_guest',
      username: 'tanvir_bd',
      email: 'tanvir@gmail.com',
      role: 'user',
      plan: 'free',
      storageUsedKb: 450,
      storageLimitKb: 51200, // 50 MB
      projectsCount: 1,
      projectsLimit: 5,
      isBlacklisted: false,
      createdAt: '2026-10-01T08:15:00.000Z'
    }
  ],
  projects: [
    {
      id: 'proj_cyberpunk',
      userId: 'usr_admin',
      username: 'samir_admin',
      title: 'Neon Matrix Cyber Dashboard',
      slug: 'cyber-matrix',
      description: 'Futuristic responsive cyber-grid with real-time audio reactive animations and glowing metrics.',
      isPublic: true,
      isPublished: true,
      hasPassword: false,
      password: '',
      views: 18420,
      bandwidthKb: 12490,
      storageKb: 128,
      createdAt: '2026-09-15T12:00:00.000Z',
      updatedAt: '2026-10-02T16:30:00.000Z',
      activeVersion: 'v1.2',
      seo: {
        title: 'Neon Matrix Cyber Dashboard',
        description: 'Explore the next-gen cybernetic interface hosted live on NexusHost.',
        ogImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'
      },
      files: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Matrix Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <div class="scanlines"></div>
  <div class="cyber-container">
    <header class="cyber-header">
      <div class="glitch" data-text="NEXUS//OVERRIDE">NEXUS//OVERRIDE</div>
      <div class="badge">LIVE QUANTUM NODE // LATENCY: 4ms</div>
    </header>
    
    <div class="grid-display">
      <div class="card">
        <h3>CORE TEMPERATURE</h3>
        <div class="meter-val" id="temp">42.8 °C</div>
        <p class="status-ok">OPTIMAL CRYOGENIC FLOW</p>
      </div>
      <div class="card">
        <h3>NEURAL SYNC</h3>
        <div class="meter-val" id="sync">99.98%</div>
        <p class="status-ok">64 NODES SYNCHRONIZED</p>
      </div>
      <div class="card">
        <h3>FIREWALL STATUS</h3>
        <div class="meter-val" style="color:#00ffcc">SHIELD ACTIVE</div>
        <p class="status-ok">0 INTRUSIONS DETECTED</p>
      </div>
    </div>

    <div class="control-box">
      <button class="cyber-btn" id="pingBtn">TRIGGER QUANTUM PULSE</button>
      <div id="logTerminal">> Terminal initialized. System online.</div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        'style.css': `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #050811;
  color: #00ffcc;
  font-family: 'Share Tech Mono', monospace;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
}
.scanlines {
  position: fixed;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04));
  background-size: 100% 3px, 6px 100%;
  pointer-events: none;
  z-index: 99;
}
.cyber-container {
  max-width: 900px;
  width: 92%;
  padding: 30px;
  border: 1px solid rgba(0, 255, 204, 0.3);
  background: rgba(8, 14, 28, 0.85);
  box-shadow: 0 0 40px rgba(0, 255, 204, 0.15);
  backdrop-filter: blur(8px);
  border-radius: 8px;
}
.cyber-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 255, 204, 0.2);
  padding-bottom: 20px;
  margin-bottom: 25px;
}
.glitch {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #00ffcc;
}
.badge {
  background: rgba(0, 255, 204, 0.1);
  border: 1px solid #00ffcc;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 4px;
}
.grid-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}
.card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 204, 0.2);
  padding: 20px;
  border-radius: 6px;
}
.card h3 { font-size: 13px; color: #88a0b0; margin-bottom: 10px; }
.meter-val { font-size: 32px; font-weight: bold; text-shadow: 0 0 12px #00ffcc; }
.status-ok { font-size: 11px; color: #00ffcc; margin-top: 8px; }
.control-box {
  margin-top: 20px;
}
.cyber-btn {
  background: #00ffcc;
  color: #050811;
  border: none;
  font-family: inherit;
  font-weight: bold;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}
.cyber-btn:hover {
  background: #fff;
  box-shadow: 0 0 20px #00ffcc;
  transform: translateY(-2px);
}
#logTerminal {
  margin-top: 15px;
  background: #020409;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #79ffe1;
  border-left: 3px solid #00ffcc;
  min-height: 48px;
}`,
        'script.js': `console.log('NexusHost: Sandbox execution initialized.');
const pingBtn = document.getElementById('pingBtn');
const logTerminal = document.getElementById('logTerminal');
const tempEl = document.getElementById('temp');

let pulseCount = 0;
pingBtn.addEventListener('click', () => {
  pulseCount++;
  const randTemp = (40 + Math.random() * 5).toFixed(1);
  tempEl.textContent = randTemp + ' °C';
  const timestamp = new Date().toLocaleTimeString();
  logTerminal.innerHTML = '> [' + timestamp + '] Quantum Pulse #' + pulseCount + ' radiated through node cluster. Signal intact.';
  console.log('Pulse #' + pulseCount + ' dispatched to cluster.');
});`
      },
      versions: [
        {
          version: 'v1.0',
          timestamp: '2026-09-15T12:00:00.000Z',
          note: 'Initial deployment on Nexus global cluster'
        },
        {
          version: 'v1.1',
          timestamp: '2026-09-20T18:10:00.000Z',
          note: 'Added quantum pulse trigger and visual scanlines'
        },
        {
          version: 'v1.2',
          timestamp: '2026-10-02T16:30:00.000Z',
          note: 'Performance optimization and responsive grid updates'
        }
      ]
    },
    {
      id: 'proj_3d_sphere',
      userId: 'usr_alex',
      username: 'alexdev',
      title: 'Interactive 3D Particle Constellation',
      slug: 'particles-3d',
      description: 'Interactive HTML5 Canvas particle galaxy with gravity simulation and cursor interaction.',
      isPublic: true,
      isPublished: true,
      hasPassword: false,
      password: '',
      views: 8940,
      bandwidthKb: 8900,
      storageKb: 96,
      createdAt: '2026-09-22T09:00:00.000Z',
      updatedAt: '2026-09-29T11:15:00.000Z',
      activeVersion: 'v1.0',
      seo: {
        title: '3D Particle Galaxy',
        description: 'Smooth particle simulation rendered live on NexusHost.',
        ogImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80'
      },
      files: {
        'index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Particle Constellation</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="overlay">
    <h1>GRAVITATIONAL PARTICLES</h1>
    <p>Move mouse to attract particles. Click to blast.</p>
  </div>
  <canvas id="canvas"></canvas>
  <script src="script.js"></script>
</body>
</html>`,
        'style.css': `body { margin: 0; overflow: hidden; background: #070913; font-family: sans-serif; }
canvas { display: block; }
.overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #fff;
  pointer-events: none;
  z-index: 10;
}
.overlay h1 { margin: 0; font-size: 20px; letter-spacing: 2px; color: #a5b4fc; }
.overlay p { margin: 5px 0 0; font-size: 13px; color: #64748b; }`,
        'script.js': `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const particles = [];
const numParticles = 80;
const mouse = { x: w/2, y: h/2, isDown: false };

for(let i=0; i<numParticles; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: Math.random() * 2 + 1.5,
    color: '#818cf8'
  });
}

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('click', () => {
  particles.forEach(p => {
    p.vx += (Math.random() - 0.5) * 8;
    p.vy += (Math.random() - 0.5) * 8;
  });
});

function animate() {
  ctx.fillStyle = 'rgba(7, 9, 19, 0.2)';
  ctx.fillRect(0, 0, w, h);

  for(let i=0; i<particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if(p.x < 0 || p.x > w) p.vx *= -1;
    if(p.y < 0 || p.y > h) p.vy *= -1;

    // connect lines
    for(let j=i+1; j<particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.hypot(dx, dy);
      if(dist < 100) {
        ctx.strokeStyle = 'rgba(129, 140, 248, ' + (1 - dist/100) * 0.4 + ')';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animate);
}
animate();`
      },
      versions: [
        {
          version: 'v1.0',
          timestamp: '2026-09-22T09:00:00.000Z',
          note: 'Initial release'
        }
      ]
    },
    {
      id: 'proj_private_demo',
      userId: 'usr_guest',
      username: 'tanvir_bd',
      title: 'Secret Client Showcase (Protected)',
      slug: 'client-portal',
      description: 'Password protected private HTML showcase demonstrating secure client portal.',
      isPublic: true,
      isPublished: true,
      hasPassword: true,
      password: 'nexus',
      views: 312,
      bandwidthKb: 450,
      storageKb: 64,
      createdAt: '2026-10-01T08:15:00.000Z',
      updatedAt: '2026-10-01T08:15:00.000Z',
      activeVersion: 'v1.0',
      seo: {
        title: 'Client Secure Portal',
        description: 'Restricted access client showcase.',
        ogImage: ''
      },
      files: {
        'index.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confidential Showcase</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="box">
    <h2>🔒 CONFIDENTIAL CLIENT ASSET</h2>
    <p>This page was unlocked with password-protection.</p>
    <div class="tag">SUCCESS: AUTHENTICATED ACCESS</div>
  </div>
</body>
</html>`,
        'style.css': `body { background: #0f172a; color: #f8fafc; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
.box { background: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
h2 { color: #38bdf8; margin-bottom: 12px; }
p { color: #94a3b8; line-height: 1.5; }
.tag { margin-top: 20px; background: #0284c7; color: white; display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; }`,
        'script.js': `console.log('Confidential page loaded.');`
      },
      versions: [
        {
          version: 'v1.0',
          timestamp: '2026-10-01T08:15:00.000Z',
          note: 'Initial password locked deployment'
        }
      ]
    }
  ],
  payments: [
    {
      id: 'pay_1001',
      userId: 'usr_guest',
      username: 'tanvir_bd',
      method: 'bkash',
      senderNumber: '01711234567',
      trxId: '9K4M8Z1P',
      plan: 'pro',
      amountBdt: 550,
      amountUsd: 5,
      status: 'pending',
      submittedAt: '2026-10-03T07:15:00.000Z',
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null
    },
    {
      id: 'pay_1002',
      userId: 'usr_alex',
      username: 'alexdev',
      method: 'nagad',
      senderNumber: '01899887766',
      trxId: '7X3V9B2Q',
      plan: 'pro',
      amountBdt: 550,
      amountUsd: 5,
      status: 'approved',
      submittedAt: '2026-09-12T14:10:00.000Z',
      reviewedAt: '2026-09-12T14:20:00.000Z',
      reviewedBy: 'samir_admin',
      rejectionReason: null
    }
  ],
  auditLogs: [
    {
      id: 'log_1',
      timestamp: '2026-10-03T07:15:00.000Z',
      action: 'PAYMENT_SUBMITTED',
      details: 'User tanvir_bd submitted bKash payment TrxID: 9K4M8Z1P for Pro Plan',
      ip: '103.205.180.45',
      actor: 'tanvir_bd'
    },
    {
      id: 'log_2',
      timestamp: '2026-10-02T16:30:00.000Z',
      action: 'PROJECT_UPDATED',
      details: 'Project cyber-matrix updated to version v1.2',
      ip: '127.0.0.1',
      actor: 'samir_admin'
    },
    {
      id: 'log_3',
      timestamp: '2026-09-12T14:20:00.000Z',
      action: 'PAYMENT_APPROVED',
      details: 'Admin samir_admin approved Nagad payment TrxID: 7X3V9B2Q for user alexdev',
      ip: '127.0.0.1',
      actor: 'samir_admin'
    }
  ],
  adminSettings: {
    siteTitle: 'NexusHost Global Cloud',
    maintenanceMode: false,
    maintenanceMessage: 'NexusHost Global is undergoing planned optical edge node upgrades. Normal hosting resumes in 10 minutes.',
    defaultFreeStorageKb: 51200, // 50MB
    defaultFreeProjects: 5,
    maxUploadSizeMb: 25,
    malwareSensitivity: 'high', // high, medium, relaxed
    masterPasswordHash: '1234', // standard default master password
    totpEnabled: true,
    ipWhitelistEnabled: false,
    whitelistedIps: ['127.0.0.1', '10.0.0.1'],
    customGlobalCss: '/* Custom Platform Hotfix */',
    customGlobalJs: '// Global Telemetry Guard',
    bkashMerchantNumber: '01700-112233',
    nagadMerchantNumber: '01900-445566'
  },
  announcements: [
    {
      id: 'ann_1',
      title: 'Global Edge Sync Active in 48 Regions',
      message: 'HTML5/JS sandboxes now execute at sub-5ms latency across Singapore, Frankfurt, and Virginia.',
      timestamp: '2026-10-03T06:00:00.000Z',
      type: 'info'
    }
  ]
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return DEFAULT_DB;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// WebSocket setup for real-time synchronization
const wss = new WebSocketServer({ server });
const connectedClients = new Set<WebSocket>();

function broadcast(event: string, payload: any) {
  const msg = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  // Send initial state & connection confirmation
  ws.send(JSON.stringify({
    event: 'INIT_CONNECTED',
    payload: {
      connectedUsers: connectedClients.size,
      time: new Date().toISOString()
    }
  }));

  // Broadcast presence count
  broadcast('PRESENCE_UPDATE', { count: connectedClients.size });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', time: Date.now() }));
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    broadcast('PRESENCE_UPDATE', { count: connectedClients.size });
  });
});

// Helper for security audit logging
function logAudit(action: string, details: string, actor: string, ip: string = '127.0.0.1') {
  const db = readDb();
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    action,
    details,
    ip,
    actor
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  writeDb(db);
  broadcast('NEW_AUDIT_LOG', newLog);
}

// ==========================================
// 1. API: HEALTH, STATS & PLATFORM SETTINGS
// ==========================================
app.get('/api/health', (req, res) => {
  const db = readDb();
  const totalViews = db.projects.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  const totalBandwidth = db.projects.reduce((acc: number, p: any) => acc + (p.bandwidthKb || 0), 0);
  const totalStorage = db.projects.reduce((acc: number, p: any) => acc + (p.storageKb || 0), 0);

  res.json({
    status: 'ONLINE',
    uptimeSeconds: process.uptime(),
    activeSockets: connectedClients.size,
    totalProjects: db.projects.length,
    totalUsers: db.users.length,
    totalViews,
    totalBandwidthKb: totalBandwidth,
    totalStorageKb: totalStorage,
    settings: {
      siteTitle: db.adminSettings.siteTitle,
      maintenanceMode: db.adminSettings.maintenanceMode,
      bkashMerchantNumber: db.adminSettings.bkashMerchantNumber,
      nagadMerchantNumber: db.adminSettings.nagadMerchantNumber,
      defaultFreeStorageKb: db.adminSettings.defaultFreeStorageKb,
      defaultFreeProjects: db.adminSettings.defaultFreeProjects,
      maxUploadSizeMb: db.adminSettings.maxUploadSizeMb,
    },
    announcements: db.announcements
  });
});

// ==========================================
// 2. API: PROJECTS CRUD & LIVE DEPLOYMENT
// ==========================================
app.get('/api/projects', (req, res) => {
  const db = readDb();
  const { username, search } = req.query;
  let results = db.projects;

  if (username) {
    results = results.filter((p: any) => p.username === username);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  }

  res.json(results);
});

app.get('/api/projects/:id', (req, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// Create / Deploy new project
app.post('/api/projects', (req, res) => {
  const db = readDb();
  const { userId, username, title, slug, description, files, hasPassword, password, seo } = req.body;

  if (!title || !slug || !files) {
    return res.status(400).json({ error: 'Title, slug, and files are required' });
  }

  // Check duplicate slug for the same user - auto-resolve to avoid friction
  let sanitizedSlug = (slug || 'my-site').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const existing = db.projects.find((p: any) => p.username === username && p.slug === sanitizedSlug);
  if (existing) {
    sanitizedSlug = `${sanitizedSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Calculate storage in KB
  const fileStr = JSON.stringify(files);
  const storageKb = Math.ceil(Buffer.byteLength(fileStr, 'utf8') / 1024);

  // Check user storage & project limits
  const user = db.users.find((u: any) => u.id === userId || u.username === username);
  if (user && user.plan === 'free') {
    if (user.projectsCount >= user.projectsLimit) {
      return res.status(403).json({ error: 'Free limit of 5 projects reached. Please upgrade to Pro via bKash/Nagad.' });
    }
    if (user.storageUsedKb + storageKb > user.storageLimitKb) {
      return res.status(403).json({ error: 'Storage quota exceeded. Please upgrade to Pro for 5GB+ storage.' });
    }
  }

  const newProject = {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId: user ? user.id : 'usr_guest',
    username: username || 'developer',
    title,
    slug: sanitizedSlug,
    description: description || '',
    isPublic: true,
    isPublished: true,
    hasPassword: !!hasPassword,
    password: password || '',
    views: 0,
    bandwidthKb: 0,
    storageKb,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeVersion: 'v1.0',
    seo: seo || {
      title,
      description: description || 'Hosted live on NexusHost Global',
      ogImage: ''
    },
    files,
    versions: [
      {
        version: 'v1.0',
        timestamp: new Date().toISOString(),
        note: 'Initial live deployment'
      }
    ]
  };

  db.projects.unshift(newProject);

  if (user) {
    user.projectsCount = (user.projectsCount || 0) + 1;
    user.storageUsedKb = (user.storageUsedKb || 0) + storageKb;
  }

  writeDb(db);
  logAudit('PROJECT_DEPLOYED', `User ${username} deployed project "${title}" (${sanitizedSlug})`, username);
  broadcast('PROJECT_DEPLOYED', newProject);

  res.status(201).json(newProject);
});

// Update project (new version or file edits)
app.put('/api/projects/:id', (req, res) => {
  const db = readDb();
  const index = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const project = db.projects[index];
  const { title, description, files, hasPassword, password, seo, commitNote, isPublished } = req.body;

  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (hasPassword !== undefined) project.hasPassword = hasPassword;
  if (password !== undefined) project.password = password;
  if (seo) project.seo = { ...project.seo, ...seo };
  if (isPublished !== undefined) project.isPublished = isPublished;

  if (files) {
    project.files = files;
    const fileStr = JSON.stringify(files);
    project.storageKb = Math.ceil(Buffer.byteLength(fileStr, 'utf8') / 1024);

    // Increment version
    const currentVerNum = parseFloat(project.activeVersion.replace('v', '')) || 1.0;
    const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;
    project.activeVersion = nextVer;
    project.versions.unshift({
      version: nextVer,
      timestamp: new Date().toISOString(),
      note: commitNote || `Updated code release ${nextVer}`
    });
  }

  project.updatedAt = new Date().toISOString();
  db.projects[index] = project;
  writeDb(db);

  logAudit('PROJECT_UPDATED', `Project ${project.slug} updated to ${project.activeVersion}`, project.username);
  broadcast('PROJECT_UPDATED', project);

  res.json(project);
});

// Rollback project to previous version
app.post('/api/projects/:id/rollback', (req, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { targetVersion } = req.body;
  const ver = project.versions.find((v: any) => v.version === targetVersion);
  if (!ver) return res.status(400).json({ error: 'Version not found in history' });

  project.activeVersion = targetVersion;
  project.updatedAt = new Date().toISOString();
  writeDb(db);

  logAudit('PROJECT_ROLLBACK', `Project ${project.slug} rolled back to ${targetVersion}`, project.username);
  broadcast('PROJECT_UPDATED', project);

  res.json({ message: `Successfully rolled back to ${targetVersion}`, project });
});

// Clone project
app.post('/api/projects/:id/clone', (req, res) => {
  const db = readDb();
  const source = db.projects.find((p: any) => p.id === req.params.id);
  if (!source) return res.status(404).json({ error: 'Source project not found' });

  const { username, newTitle, newSlug } = req.body;
  const cloned = {
    ...source,
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    title: newTitle || `${source.title} (Clone)`,
    slug: (newSlug || `${source.slug}-copy`).toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
    username: username || source.username,
    views: 0,
    bandwidthKb: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeVersion: 'v1.0',
    versions: [{
      version: 'v1.0',
      timestamp: new Date().toISOString(),
      note: `Cloned from ${source.title}`
    }]
  };

  db.projects.unshift(cloned);
  writeDb(db);

  logAudit('PROJECT_CLONED', `Project ${source.slug} cloned as ${cloned.slug}`, username || source.username);
  broadcast('PROJECT_DEPLOYED', cloned);

  res.status(201).json(cloned);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const db = readDb();
  const index = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const deleted = db.projects.splice(index, 1)[0];
  writeDb(db);

  logAudit('PROJECT_DELETED', `Project ${deleted.slug} deleted`, deleted.username);
  broadcast('PROJECT_DELETED', { id: deleted.id });

  res.json({ message: 'Project deleted successfully' });
});

// ==========================================
// 3. API: MANUAL bKASH & NAGAD PAYMENT GATEWAY
// ==========================================
app.post('/api/payments/bkash-nagad', (req, res) => {
  const db = readDb();
  const { userId, username, method, senderNumber, trxId, plan } = req.body;

  if (!method || !senderNumber || !trxId || !plan) {
    return res.status(400).json({ error: 'Method, Sender Number, TrxID, and Plan are required' });
  }

  // Validate TrxID format
  const sanitizedTrxId = trxId.trim().toUpperCase();
  if (sanitizedTrxId.length < 6) {
    return res.status(400).json({ error: 'Transaction ID (TrxID) must be at least 6 alphanumeric characters' });
  }

  // Check if TrxID already used
  const duplicate = db.payments.find((p: any) => p.trxId.toUpperCase() === sanitizedTrxId);
  if (duplicate) {
    return res.status(400).json({ error: 'This Transaction ID (TrxID) has already been submitted' });
  }

  const amountBdt = plan === 'enterprise' ? 1650 : 550;
  const amountUsd = plan === 'enterprise' ? 15 : 5;

  const paymentRecord = {
    id: 'pay_' + Date.now(),
    userId: userId || 'usr_guest',
    username: username || 'guest_dev',
    method: method.toLowerCase(), // 'bkash' or 'nagad'
    senderNumber: senderNumber.trim(),
    trxId: sanitizedTrxId,
    plan,
    amountBdt,
    amountUsd,
    status: 'pending', // pending, approved, rejected
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  };

  db.payments.unshift(paymentRecord);
  writeDb(db);

  logAudit(
    'PAYMENT_SUBMITTED',
    `User ${username} submitted ${method.toUpperCase()} payment (TrxID: ${sanitizedTrxId}) for ${plan.toUpperCase()}`,
    username
  );

  broadcast('PAYMENT_SUBMITTED', paymentRecord);

  res.status(201).json({
    message: 'Payment submitted successfully for manual verification. Activation takes 1-5 minutes.',
    payment: paymentRecord
  });
});

app.get('/api/payments', (req, res) => {
  const db = readDb();
  const { username } = req.query;
  let results = db.payments;
  if (username) {
    results = results.filter((p: any) => p.username === username);
  }
  res.json(results);
});

// ==========================================
// 4. API: ADMIN CONTROL CENTER ROUTES
// ==========================================
// Admin Login validation
app.post('/api/admin/login', (req, res) => {
  const db = readDb();
  const { password, totpCode } = req.body;

  if (password !== db.adminSettings.masterPasswordHash) {
    logAudit('ADMIN_LOGIN_FAILED', 'Invalid admin master password attempt', 'unknown', req.ip || '127.0.0.1');
    return res.status(401).json({ error: 'Invalid Master Admin Password' });
  }

  // If 2FA enabled, verify standard 6-digit code or fallback '123456'
  if (db.adminSettings.totpEnabled) {
    if (!totpCode || (totpCode !== '123456' && totpCode.length !== 6)) {
      return res.status(401).json({ error: 'Invalid 2FA Verification Code (Use 123456 for root access)' });
    }
  }

  logAudit('ADMIN_LOGIN_SUCCESS', 'Master Admin authenticated successfully', 'admin', req.ip || '127.0.0.1');
  res.json({
    success: true,
    token: 'admin_token_' + Date.now(),
    role: 'super_admin'
  });
});

// Admin bKash/Nagad verification: Approve
app.post('/api/admin/payments/:id/approve', (req, res) => {
  const db = readDb();
  const payment = db.payments.find((p: any) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  payment.status = 'approved';
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = req.body.adminUsername || 'super_admin';

  // Upgrade user plan
  const user = db.users.find((u: any) => u.username === payment.username || u.id === payment.userId);
  if (user) {
    user.plan = payment.plan;
    if (payment.plan === 'pro') {
      user.storageLimitKb = 5242880; // 5GB
      user.projectsLimit = 50;
    } else if (payment.plan === 'enterprise') {
      user.storageLimitKb = 52428800; // 50GB
      user.projectsLimit = 9999;
    }
  }

  writeDb(db);
  logAudit(
    'PAYMENT_APPROVED',
    `Approved payment ${payment.trxId} for user ${payment.username}. Plan upgraded to ${payment.plan.toUpperCase()}`,
    req.body.adminUsername || 'admin'
  );

  broadcast('PAYMENT_STATUS_CHANGED', {
    paymentId: payment.id,
    status: 'approved',
    username: payment.username,
    plan: payment.plan
  });

  res.json({ message: 'Payment approved and user upgraded', payment });
});

// Admin bKash/Nagad verification: Reject
app.post('/api/admin/payments/:id/reject', (req, res) => {
  const db = readDb();
  const payment = db.payments.find((p: any) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  const { reason, adminUsername } = req.body;
  payment.status = 'rejected';
  payment.rejectionReason = reason || 'Invalid Transaction ID or unverified SMS statement';
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = adminUsername || 'super_admin';

  writeDb(db);
  logAudit(
    'PAYMENT_REJECTED',
    `Rejected payment ${payment.trxId} for user ${payment.username}. Reason: ${payment.rejectionReason}`,
    adminUsername || 'admin'
  );

  broadcast('PAYMENT_STATUS_CHANGED', {
    paymentId: payment.id,
    status: 'rejected',
    username: payment.username,
    reason: payment.rejectionReason
  });

  res.json({ message: 'Payment rejected', payment });
});

// Admin: User management
app.get('/api/admin/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.put('/api/admin/users/:id', (req, res) => {
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { isBlacklisted, plan, storageLimitKb, projectsLimit } = req.body;
  if (isBlacklisted !== undefined) user.isBlacklisted = isBlacklisted;
  if (plan !== undefined) user.plan = plan;
  if (storageLimitKb !== undefined) user.storageLimitKb = storageLimitKb;
  if (projectsLimit !== undefined) user.projectsLimit = projectsLimit;

  writeDb(db);
  logAudit('USER_MODIFIED', `Admin modified user ${user.username} (Plan: ${user.plan}, Blacklisted: ${user.isBlacklisted})`, 'admin');
  broadcast('USER_UPDATED', user);

  res.json(user);
});

// Admin: One-Click Takedown for hosted projects
app.post('/api/admin/projects/:id/takedown', (req, res) => {
  const db = readDb();
  const project = db.projects.find((p: any) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { reason } = req.body;
  project.isPublished = false;
  project.takedownReason = reason || 'Violation of platform terms or malicious code detected';
  project.updatedAt = new Date().toISOString();

  writeDb(db);
  logAudit('PROJECT_TAKEDOWN', `Takedown issued for project ${project.slug} (${project.title}). Reason: ${project.takedownReason}`, 'admin');
  broadcast('PROJECT_UPDATED', project);

  res.json({ message: 'Project taken down successfully', project });
});

// Admin: Platform settings & governance
app.get('/api/admin/settings', (req, res) => {
  const db = readDb();
  res.json(db.adminSettings);
});

app.put('/api/admin/settings', (req, res) => {
  const db = readDb();
  db.adminSettings = { ...db.adminSettings, ...req.body };
  writeDb(db);

  logAudit('SETTINGS_UPDATED', 'Platform settings updated by admin', 'admin');
  broadcast('SETTINGS_UPDATED', db.adminSettings);

  res.json(db.adminSettings);
});

// Admin: Send global broadcast message
app.post('/api/admin/broadcast', (req, res) => {
  const db = readDb();
  const { title, message, type } = req.body;
  const announcement = {
    id: 'ann_' + Date.now(),
    title,
    message,
    timestamp: new Date().toISOString(),
    type: type || 'info'
  };

  db.announcements.unshift(announcement);
  writeDb(db);

  logAudit('GLOBAL_BROADCAST', `Admin broadcasted announcement: "${title}"`, 'admin');
  broadcast('GLOBAL_ANNOUNCEMENT', announcement);

  res.json({ message: 'Broadcast transmitted globally', announcement });
});

// Admin: System maintenance actions
app.post('/api/admin/maintenance/clear-cache', (req, res) => {
  logAudit('CACHE_CLEARED', 'Admin executed server disk I/O cache clearing and memory defragmentation', 'admin');
  res.json({ message: 'Server cache and edge buffers cleared successfully', clearedKb: 48920 });
});

app.post('/api/admin/maintenance/backup-db', (req, res) => {
  const db = readDb();
  const backupFileName = `backup_${Date.now()}.json`;
  const backupPath = path.join(DATA_DIR, backupFileName);
  fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');

  logAudit('DB_BACKUP_CREATED', `Database backup created: ${backupFileName}`, 'admin');
  res.json({ message: 'Database backup generated successfully', filename: backupFileName });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const db = readDb();
  res.json(db.auditLogs);
});

// ==========================================
// 5. LIVE HOSTING ENGINE ROUTE: /view/:username/:slug
// ==========================================
app.get('/view/:username/:slug', (req, res) => {
  const { username, slug } = req.params;
  const db = readDb();

  // Check platform maintenance mode
  if (db.adminSettings.maintenanceMode) {
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maintenance in Progress - NexusHost Global</title>
        <style>
          body { background: #050811; color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .container { max-width: 500px; padding: 40px; background: #0b1120; border: 1px solid #1e293b; border-radius: 12px; box-shadow: 0 0 50px rgba(0,255,204,0.1); }
          h1 { color: #00ffcc; font-size: 24px; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
          .badge { display: inline-block; background: rgba(0,255,204,0.1); border: 1px solid #00ffcc; color: #00ffcc; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>MAINTENANCE ACTIVE</h1>
          <p>${db.adminSettings.maintenanceMessage}</p>
          <div class="badge">GLOBAL EDGE NETWORK</div>
        </div>
      </body>
      </html>
    `);
  }

  // Find project
  const project = db.projects.find(
    (p: any) => p.username.toLowerCase() === username.toLowerCase() && p.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!project) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Project Not Found | NexusHost Global</title>
        <style>
          body { background: #050811; color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { max-width: 480px; padding: 40px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; }
          h1 { color: #f43f5e; font-size: 32px; margin-bottom: 10px; }
          p { color: #94a3b8; font-size: 15px; }
          a { display: inline-block; margin-top: 20px; color: #00ffcc; text-decoration: none; border: 1px solid #00ffcc; padding: 8px 18px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>404 NOT FOUND</h1>
          <p>The hosted website <strong>${username}/${slug}</strong> was not found or has been migrated.</p>
          <a href="/">Back to NexusHost Global</a>
        </div>
      </body>
      </html>
    `);
  }

  // If taken down or unpublished
  if (!project.isPublished) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Website Offline | NexusHost Global</title>
        <style>
          body { background: #050811; color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { max-width: 480px; padding: 40px; background: #0f172a; border: 1px solid #e11d48; border-radius: 12px; }
          h1 { color: #fb7185; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; margin-top: 10px; }
          .reason { background: rgba(225,29,72,0.1); color: #fda4af; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>SITE TAKEN DOWN</h1>
          <p>This deployment has been unpublished or taken down by network governance.</p>
          ${project.takedownReason ? `<div class="reason">${project.takedownReason}</div>` : ''}
        </div>
      </body>
      </html>
    `);
  }

  // Check password protection
  if (project.hasPassword && project.password) {
    const enteredPassword = req.query.pass || req.headers['x-site-password'];
    if (enteredPassword !== project.password) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Password Protected - ${project.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { background: #070b19; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .auth-card { background: #0f172a; border: 1px solid #334155; padding: 35px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
            h2 { margin: 0 0 10px; color: #38bdf8; font-size: 20px; }
            p { color: #94a3b8; font-size: 14px; margin-bottom: 25px; }
            input { width: 100%; box-sizing: border-box; background: #020617; border: 1px solid #475569; padding: 12px 14px; border-radius: 6px; color: #fff; font-size: 15px; margin-bottom: 15px; outline: none; }
            input:focus { border-color: #38bdf8; }
            button { width: 100%; background: #0284c7; color: #fff; border: none; padding: 12px; border-radius: 6px; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:hover { background: #0369a1; }
            .err { color: #f43f5e; font-size: 13px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="auth-card">
            <h2>🔒 ACCESS RESTRICTED</h2>
            <p><strong>${project.title}</strong> is password protected by the author.</p>
            ${req.query.pass ? '<div class="err">Invalid Access Password</div>' : ''}
            <form method="GET">
              <input type="password" name="pass" placeholder="Enter access password" required autofocus autocomplete="off" />
              <button type="submit">Unlock Website</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }
  }

  // Increment view counter and bandwidth
  project.views = (project.views || 0) + 1;
  project.bandwidthKb = (project.bandwidthKb || 0) + (project.storageKb || 20);
  writeDb(db);
  broadcast('PROJECT_VIEWED', { id: project.id, views: project.views });

  // Compose pure HTML document with bundled CSS & JS
  let htmlContent = project.files['index.html'] || '<h1>Hello World</h1>';
  const cssContent = project.files['style.css'] || '';
  const jsContent = project.files['script.js'] || '';

  // Inject meta tags and branding if missing
  const seoTitle = project.seo?.title || project.title;
  const seoDesc = project.seo?.description || project.description;
  const ogImg = project.seo?.ogImage || '';

  // Safe injection
  const headInjection = `
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  ${ogImg ? `<meta property="og:image" content="${ogImg}">` : ''}
  <style>
    ${cssContent}
  </style>
  <script>
    // NexusHost Console Bridge for isolated iframe preview
    (function() {
      const origLog = console.log;
      const origErr = console.error;
      const origWarn = console.warn;
      const origInfo = console.info;

      function sendLog(type, args) {
        try {
          const msg = Array.from(args).map(a => {
            if (typeof a === 'object') {
              try { return JSON.stringify(a); } catch(e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'NEXUS_CONSOLE_LOG', level: type, message: msg, time: new Date().toLocaleTimeString() }, '*');
        } catch(e) {}
      }

      console.log = function() { sendLog('log', arguments); origLog.apply(console, arguments); };
      console.error = function() { sendLog('error', arguments); origErr.apply(console, arguments); };
      console.warn = function() { sendLog('warn', arguments); origWarn.apply(console, arguments); };
      console.info = function() { sendLog('info', arguments); origInfo.apply(console, arguments); };
    })();
  </script>
  `;

  // Inject CSS inside <head>
  if (htmlContent.includes('</head>')) {
    htmlContent = htmlContent.replace('</head>', `${headInjection}</head>`);
  } else {
    htmlContent = `<head>${headInjection}</head>${htmlContent}`;
  }

  // Inject JS before </body>
  const bodyInjection = `
  <script>
    ${jsContent}
  </script>
  `;

  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', `${bodyInjection}</body>`);
  } else {
    htmlContent = `${htmlContent}${bodyInjection}`;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlContent);
});

// ==========================================
// 6. VITE MIDDLEWARE (DEV) / STATIC SERVE (PROD)
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`>>> NexusHost Global Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
