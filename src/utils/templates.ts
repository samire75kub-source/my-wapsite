export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  files: {
    'index.html': string;
    'style.css': string;
    'script.js': string;
  };
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'cyber_hud',
    name: 'Cyberpunk Quantum HUD',
    category: 'Futuristic / Tech',
    description: 'Neon dark-mode dashboard with real-time reactive metrics, audio visualizer canvas, and glitch text.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Quantum HUD</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hud-box">
    <div class="hud-top">
      <span class="hud-status">● LIVE QUANTUM NODE</span>
      <span class="hud-time" id="clock">00:00:00</span>
    </div>
    <h1 class="hud-title">NEXUS // CORE</h1>
    <div class="metrics">
      <div class="metric-card">
        <label>CPU FLUX</label>
        <div class="val" id="cpuVal">98.4%</div>
      </div>
      <div class="metric-card">
        <label>NEURAL LINK</label>
        <div class="val" id="neuralVal">ACTIVE</div>
      </div>
      <div class="metric-card">
        <label>LATENCY</label>
        <div class="val" id="latVal">2ms</div>
      </div>
    </div>
    <div class="canvas-wrap">
      <canvas id="viz" width="500" height="120"></canvas>
    </div>
    <button id="boostBtn" class="cyber-btn">OVERCLOCK CORES</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
  margin: 0;
  background: #060913;
  color: #00ffcc;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.hud-box {
  background: rgba(10, 16, 32, 0.9);
  border: 1px solid #00ffcc;
  box-shadow: 0 0 30px rgba(0, 255, 204, 0.2);
  padding: 30px;
  border-radius: 8px;
  max-width: 550px;
  width: 90%;
}
.hud-top { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 15px; color: #79ffe1; }
.hud-title { margin: 0 0 20px; font-size: 28px; letter-spacing: 3px; text-shadow: 0 0 10px #00ffcc; }
.metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
.metric-card { background: rgba(0,0,0,0.5); padding: 12px; border: 1px solid rgba(0,255,204,0.3); border-radius: 4px; }
.metric-card label { font-size: 10px; color: #94a3b8; display: block; }
.metric-card .val { font-size: 20px; font-weight: bold; margin-top: 5px; color: #fff; text-shadow: 0 0 8px #00ffcc; }
.canvas-wrap { background: #020409; border: 1px solid rgba(0,255,204,0.2); border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
canvas { display: block; width: 100%; height: 100px; }
.cyber-btn {
  width: 100%;
  background: #00ffcc;
  color: #060913;
  border: none;
  font-family: inherit;
  font-weight: bold;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.cyber-btn:hover { background: #fff; box-shadow: 0 0 20px #00ffcc; }`,
      'script.js': `const clock = document.getElementById('clock');
setInterval(() => { clock.textContent = new Date().toLocaleTimeString(); }, 1000);
clock.textContent = new Date().toLocaleTimeString();

const canvas = document.getElementById('viz');
const ctx = canvas.getContext('2d');
let t = 0;
function draw() {
  ctx.fillStyle = 'rgba(2, 4, 9, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += 5) {
    const y = canvas.height / 2 + Math.sin((x + t) * 0.05) * 20 * Math.sin(t * 0.02);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  t += 2;
  requestAnimationFrame(draw);
}
draw();

document.getElementById('boostBtn').addEventListener('click', () => {
  document.getElementById('cpuVal').textContent = '100% TURBO';
  document.getElementById('latVal').textContent = '0.5ms';
  console.log('Overclock activated on quantum core.');
});`
    }
  },
  {
    id: 'glassmorphism_saas',
    name: 'Modern Glassmorphism Landing',
    category: 'SaaS / Marketing',
    description: 'Sleek frosted glass UI with smooth gradient backdrop, animated badge, and interactive modal.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Cloud - Next Gen Hosting</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="blob blob1"></div>
  <div class="blob blob2"></div>
  <div class="card">
    <div class="tag">✦ THE NEXT DECADE OF CLOUD</div>
    <h1>Build Fast. Host Worldwide.</h1>
    <p>Deploy frontend web apps to 140+ global edge locations in sub-seconds. Zero DevOps required.</p>
    <div class="btn-group">
      <button class="btn-primary" onclick="showLiveAlert()">Start Free Tier</button>
      <button class="btn-secondary" onclick="alert('Documentation ready!')">Read Docs</button>
    </div>
    <div class="stats-row">
      <div class="stat"><strong>99.99%</strong><span>Edge Uptime</span></div>
      <div class="stat"><strong>&lt; 5ms</strong><span>Global TTFB</span></div>
      <div class="stat"><strong>bKash / Nagad</strong><span>Easy Billing</span></div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #030712;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
  position: relative;
}
.blob {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  pointer-events: none;
}
.blob1 { background: #3b82f6; top: -100px; left: -100px; }
.blob2 { background: #8b5cf6; bottom: -100px; right: -100px; }
.card {
  position: relative;
  z-index: 10;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 45px;
  border-radius: 20px;
  max-width: 520px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.tag {
  display: inline-block;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(129, 140, 248, 0.4);
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 20px;
}
h1 { font-size: 34px; margin: 0 0 15px; font-weight: 800; background: linear-gradient(135deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 30px; }
.btn-group { display: flex; gap: 15px; justify-content: center; margin-bottom: 35px; }
.btn-primary { background: linear-gradient(135deg, #6366f1, #3b82f6); color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); }
.btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px; }
.stat strong { display: block; font-size: 20px; color: #38bdf8; }
.stat span { font-size: 11px; color: #64748b; }`,
      'script.js': `function showLiveAlert() {
  alert('Welcome to Aura Cloud! Sandboxed execution active.');
  console.log('User triggered Free Tier action.');
}`
    }
  },
  {
    id: 'retro_arcade_game',
    name: 'Retro Neon Pong & Arcade Canvas',
    category: 'Games / 2D Canvas',
    description: 'Playable paddle and neon ball game with score counter, sound effects simulator, and responsive touch/mouse controls.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Neon Pong</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="game-ui">
    <div class="score">SCORE: <span id="scoreVal">0</span></div>
    <canvas id="gameCanvas" width="480" height="320"></canvas>
    <p>Move mouse or touch screen to steer your paddle!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `body {
  margin: 0;
  background: #070714;
  color: #ff007f;
  font-family: 'Impact', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.game-ui { text-align: center; }
.score { font-size: 24px; letter-spacing: 2px; margin-bottom: 10px; text-shadow: 0 0 10px #ff007f; }
canvas { background: #0e0e24; border: 2px solid #ff007f; box-shadow: 0 0 30px rgba(255, 0, 127, 0.3); border-radius: 8px; cursor: none; }
p { font-family: sans-serif; font-size: 13px; color: #a5b4fc; margin-top: 12px; }`,
      'script.js': `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreVal = document.getElementById('scoreVal');

let score = 0;
let ballX = canvas.width / 2;
let ballY = 50;
let ballVx = 3;
let ballVy = 4;
const ballRadius = 8;

const paddleHeight = 12;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  paddleX = e.clientX - rect.left - paddleWidth / 2;
});

function draw() {
  ctx.fillStyle = '#0e0e24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#00ffcc';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00ffcc';
  ctx.fill();
  ctx.closePath();

  // Paddle
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
  ctx.fillStyle = '#ff007f';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff007f';
  ctx.fill();
  ctx.closePath();

  // Move ball
  ballX += ballVx;
  ballY += ballVy;

  // Wall collisions
  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) ballVx = -ballVx;
  if (ballY - ballRadius < 0) ballVy = -ballVy;

  // Paddle collision
  if (ballY + ballRadius >= canvas.height - paddleHeight - 5) {
    if (ballX >= paddleX && ballX <= paddleX + paddleWidth) {
      ballVy = -Math.abs(ballVy) * 1.05; // speed up
      ballVx += (Math.random() - 0.5) * 2;
      score += 10;
      scoreVal.textContent = score;
      console.log('Paddle hit! Score:', score);
    } else if (ballY > canvas.height) {
      // Reset
      score = 0;
      scoreVal.textContent = score;
      ballX = canvas.width / 2;
      ballY = 50;
      ballVx = 3;
      ballVy = 4;
      console.log('Missed! Resetting game.');
    }
  }

  requestAnimationFrame(draw);
}
draw();`
    }
  }
];
