const http = require('http');

// --- CONFIGURATION (Your settings remain the same) ---
const PORT = process.env.PORT || 10000;
const FRAME_DELAY = 100;
const TERMINAL_WIDTH = 80;
const TERMINAL_HEIGHT = 24;
const BACKGROUND_MODE = 'matrix';
const ENABLE_GLITCH_EFFECT = true;
const GLITCH_PROBABILITY = 0.05;
const ENABLE_PULSING_EFFECT = true;
const ENABLE_PARTICLE_EXPLOSION = true;
const ENABLE_FADING_TRAILS = true;
const PARTICLE_COUNT = 30;
const TRAIL_LENGTH = 15;
const RAIN_DENSITY = 70;

// --- COLOR & STYLE CONSTANTS (Your settings remain the same) ---
const colors = [
    196, 202, 208, 214, 220, 226, 190, 154, 118, 82, 46, 47, 48, 49, 50, 51, 45, 39, 33,
    27, 21, 20, 26, 32, 38, 44, 50, 49, 48, 47, 46, 82, 118, 154, 190, 226, 220, 214,
    208, 202, 196, 197, 198, 199, 200, 201, 207, 213, 219, 225, 224, 223, 222, 221, 215,
    209, 203, 197, 160, 161, 162, 168, 174, 180, 186, 192, 193, 194, 195
].map(c => `\x1b[38;5;${c}m`);
const resetColor = '\x1b[0m';
const matrixHeadColor = '\x1b[38;5;155m';
const matrixTrailColor = '\x1b[38;5;22m';
const infoColor = '\x1b[38;5;246m';
const starColor = '\x1b[38;5;252m';
const particleColors = [40, 41, 42, 43, 44, 45, 34, 35, 36];

// --- ANIMATION FRAMES & BOOT SEQUENCE (Your settings remain the same) ---
const animationFrames = [
`
VVVVVVVV           VVVVVVVV
V::::::V           V::::::V
V::::::V           V::::::V
V::::::V           V::::::V
 V:::::V           V:::::V
  V:::::V         V:::::V
   V:::::V       V:::::V
    V:::::V     V:::::V
     V:::::V   V:::::V
      V:::::V V:::::V
       V:::::V:::::V
        V:::::::::V
         V:::::::V
          V:::::V
           V:::V
            VVV
`,
`
IIIIIIIIII
I::::::::I
I::::::::I
II::::::II
  I::::I
  I::::I
  I::::I
  I::::I
  I::::I
  I::::I
  I::::I
  I::::I
II::::::II
I::::::::I
I::::::::I
IIIIIIIIII
`,
`
BBBBBBBBBBBBBBBBB
B::::::::::::::::B
B::::::BBBBBB:::::B
BB:::::B     B:::::B
  B::::B     B:::::B
  B::::B     B:::::B
  B::::BBBBBB:::::B
  B:::::::::::::BB
  B::::BBBBBB:::::B
  B::::B     B:::::B
  B::::B     B:::::B
  B::::B     B:::::B
BB:::::BBBBBB::::::B
B:::::::::::::::::B
B::::::::::::::::B
BBBBBBBBBBBBBBBBB
`,
`
HHHHHHHHH     HHHHHHHHH
H:::::::H     H:::::::H
H:::::::H     H:::::::H
HH::::::H     H::::::HH
  H:::::H     H:::::H
  H:::::H     H:::::H
  H::::::HHHHH::::::H
  H:::::::::::::::::H
  H:::::::::::::::::H
  H::::::HHHHH::::::H
  H:::::H     H:::::H
  H:::::H     H:::::H
HH::::::H     H::::::HH
H:::::::H     H:::::::H
H:::::::H     H:::::::H
HHHHHHHHH     HHHHHHHHH
`,
`
A
A:A
A:::A
A:::::A
A:::::::A
A:::::::::A
A:::::A:::::A
A:::::A A:::::A
A:::::A   A:::::A
A:::::A     A:::::A
A:::::AAAAAAAAA:::::A
A:::::::::::::::::::::A
A:::::AAAAAAAAAAAAA:::::A
A:::::A             A:::::A
A:::::A               A:::::A
A:::::A                 A:::::A
AAAAAAA                   AAAAAAA
`,
`
WWWWWWWW                           WWWWWWWW
W::::::W                           W::::::W
W::::::W                           W::::::W
W::::::W                           W::::::W
 W:::::W           WWWWW           W:::::W
  W:::::W         W:::::W         W:::::W
   W:::::W       W:::::::W       W:::::W
    W:::::W     W:::::::::W     W:::::W
     W:::::W   W:::::W:::::W   W:::::W
      W:::::W W:::::W W:::::W W:::::W
       W:::::W:::::W   W:::::W:::::W
        W:::::::::W     W:::::::::W
         W:::::::W       W:::::::W
          W:::::W         W:::::W
           W:::W           W:::W
            WWW             WWW
`,
`
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
 ░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
 ░▒▓█▓▒▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
  ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
  ░▒▓█▓▓█▓▒░ ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░
   ░▒▓██▓▒░  ░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░░▒▓█████████████▓▒░
`
].map(frame => {
    const lines = frame.trim().split('\n');
    const height = lines.length;
    const width = Math.max(...lines.map(l => l.length));
    return { lines, width, height };
});
const bootSequence = ["Connection established...", "VIBHAW BIOS v2.5a", "Initializing terminal...", "Memory check: 65536 KB OK", "Loading animation modules...", "  - Particle engine... OK", "  - Trail renderer... OK", "  - Background... OK", "Starting render loop.", ""];

// --- HELPER FUNCTIONS (Your functions remain the same) ---
function drawArtAtPosition(res, art, x, y, color, frameCount) { let artString = ''; const isGlitching = ENABLE_GLITCH_EFFECT && Math.random() < GLITCH_PROBABILITY; art.lines.forEach((line, index) => { let processedLine = line; if (isGlitching) { const lineChars = line.split(''); if(Math.random() < 0.5 && line.trim().length > 0) { const glitchIndex = Math.floor(Math.random() * line.length); lineChars[glitchIndex] = ['#', '*', '%', '$'][Math.floor(Math.random() * 4)]; processedLine = lineChars.join(''); } } artString += `\x1b[${y + index};${x}H${color}${processedLine}`; }); res.write(artString); }
function drawArtWithRainbowWave(res, art, x, y, frameCount) { let artString = ''; art.lines.forEach((line, lineIndex) => { let lineContent = `\x1b[${y + lineIndex};${x}H`; line.split('').forEach((char, charIndex) => { const colorIndex = (x + charIndex + frameCount) % colors.length; lineContent += `${colors[colorIndex]}${char}`; }); artString += lineContent; }); res.write(artString); }
function drawInfoBar(res, frameCount) { const time = new Date().toUTCString(); const info = `[ ${time} ]`; const pos = TERMINAL_WIDTH - info.length; res.write(`\x1b[1;${pos}H${infoColor}${info}`); }
function updateAndDrawMatrixRain(res, raindrops) { let rainString = ''; for (const drop of raindrops) { const trailY = drop.y - 1; if (trailY > 0) { rainString += `\x1b[${trailY};${drop.x}H${matrixTrailColor}${drop.char}`; } rainString += `\x1b[${drop.y};${drop.x}H${matrixHeadColor}${drop.char}`; drop.y++; if (drop.y > TERMINAL_HEIGHT) { drop.y = 1; drop.x = Math.floor(Math.random() * TERMINAL_WIDTH) + 1; } } res.write(rainString); }
function updateAndDrawStarfield(res, stars, frameCount) { let starString = ''; for (const star of stars) { if (Math.sin(frameCount / star.twinkleSpeed) > 0.6) { starString += `\x1b[${star.y};${star.x}H${starColor}${star.char}`; } } res.write(starString); }
function updateAndDrawParticles(res, particles) { let particleString = ''; particles.forEach((p, index) => { const color = `\x1b[38;5;${p.color}m`; particleString += `\x1b[${Math.round(p.y)};${Math.round(p.x)}H${color}${p.char}`; p.x += p.dx; p.y += p.dy; p.lifespan--; if (p.lifespan <= 0) { particles.splice(index, 1); } }); res.write(particleString); }
function drawTrails(res, trails) { let trailString = ''; trails.forEach((trail, index) => { const fadeColor = `\x1b[38;5;${22 + (trail.lifespan)}m`; trail.art.lines.forEach((line, lineIndex) => { trailString += `\x1b[${trail.y + lineIndex};${trail.x}H${fadeColor}${line}`; }); trail.lifespan--; if (trail.lifespan <= 0) { trails.splice(index, 1); } }); res.write(trailString); }

// --- SERVER LOGIC ---
const server = http.createServer((req, res) => {
    // Check the User-Agent header
    const userAgent = req.headers['user-agent'] || '';

    // If User-Agent contains 'curl', show the animation. Otherwise, redirect.
    if (userAgent.toLowerCase().includes('curl')) {
        console.log('Connection received from curl!');
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        });

        // --- STATE INITIALIZATION FOR THIS CONNECTION ---
        const state = {
            mode: 'booting', // modes: booting -> spelling -> finale -> bouncing
            modeCounter: 0,
            frameCount: 0,
            frameIndex: 0,
            colorIndex: 0,
            art: { x: 5, y: 5, dx: 1, dy: 1 },
            raindrops: Array.from({ length: RAIN_DENSITY }, () => ({ x: Math.floor(Math.random() * TERMINAL_WIDTH) + 1, y: Math.floor(Math.random() * TERMINAL_HEIGHT) + 1, char: String.fromCharCode(0x30A0 + Math.random() * 96) })),
            stars: Array.from({ length: 100 }, () => ({ x: Math.floor(Math.random() * TERMINAL_WIDTH) + 1, y: Math.floor(Math.random() * TERMINAL_HEIGHT) + 1, char: ['.', '*'][Math.floor(Math.random() * 2)], twinkleSpeed: 10 + Math.random() * 40 })),
            particles: [],
            trails: [],
        };

        const animationInterval = setInterval(() => {
            state.frameCount++;
            res.write('\x1b[2J\x1b[H'); // Clear screen and move home

            // 1. DRAW BACKGROUND AND INFO
            if (BACKGROUND_MODE === 'matrix') {
                updateAndDrawMatrixRain(res, state.raindrops);
            } else {
                updateAndDrawStarfield(res, state.stars, state.frameCount);
            }
            drawInfoBar(res, state.frameCount);

            // 2. DRAW EFFECTS
            if(ENABLE_FADING_TRAILS) drawTrails(res, state.trails);
            if(ENABLE_PARTICLE_EXPLOSION) updateAndDrawParticles(res, state.particles);

            // 3. STATE-BASED ANIMATION LOGIC
            const currentArt = animationFrames[state.frameIndex];
            let currentColor = colors[state.colorIndex];

            switch (state.mode) {
                 case 'booting':
                    let bootText = '';
                    const linesToShow = Math.floor(state.modeCounter / 5);
                    for(let i=0; i < linesToShow && i < bootSequence.length; i++) {
                        bootText += `\x1b[${i+2};4H${infoColor}${bootSequence[i]}`;
                    }
                    res.write(bootText);
                    if (linesToShow >= bootSequence.length) {
                        state.mode = 'spelling';
                        state.modeCounter = 0;
                    }
                    state.modeCounter++;
                    break;

                case 'spelling':
                    const centeredX = Math.floor((TERMINAL_WIDTH - currentArt.width) / 2);
                    const centeredY = Math.floor((TERMINAL_HEIGHT - currentArt.height) / 2);
                    if (ENABLE_PULSING_EFFECT) {
                        const pulse = Math.sin(state.frameCount / 10) * 5;
                        const pulseColorIndex = (state.colorIndex + Math.floor(pulse) + colors.length) % colors.length;
                        currentColor = colors[pulseColorIndex];
                    }
                    drawArtAtPosition(res, currentArt, centeredX, centeredY, currentColor, state.frameCount);
                    state.modeCounter++;
                    if (state.modeCounter > 10) {
                        state.modeCounter = 0;
                        state.frameIndex++;
                        if (state.frameIndex >= animationFrames.length - 1) {
                            state.mode = 'finale';
                        }
                    }
                    break;

                case 'finale':
                    const cx = Math.floor((TERMINAL_WIDTH - currentArt.width) / 2);
                    const cy = Math.floor((TERMINAL_HEIGHT - currentArt.height) / 2);
                    drawArtWithRainbowWave(res, currentArt, cx, cy, state.frameCount);
                    state.modeCounter++;
                    if (state.modeCounter > 40) {
                        state.mode = 'bouncing';
                        state.frameIndex = 0;
                    }
                    break;

                case 'bouncing':
                    if (ENABLE_FADING_TRAILS && state.frameCount % 2 === 0) {
                         state.trails.unshift({ x: state.art.x, y: state.art.y, art: currentArt, lifespan: TRAIL_LENGTH });
                         if (state.trails.length > TRAIL_LENGTH) state.trails.pop();
                    }
                    state.art.x += state.art.dx;
                    state.art.y += state.art.dy;
                    let bounced = false; let bounceX, bounceY;
                    if (state.art.x <= 1) { state.art.dx *= -1; state.art.x = 1; bounced = true; bounceX = state.art.x + currentArt.width/2; bounceY = state.art.y + currentArt.height/2; }
                    if (state.art.x + currentArt.width >= TERMINAL_WIDTH) { state.art.dx *= -1; state.art.x = TERMINAL_WIDTH - currentArt.width; bounced = true; bounceX = state.art.x + currentArt.width/2; bounceY = state.art.y + currentArt.height/2; }
                    if (state.art.y <= 1) { state.art.dy *= -1; state.art.y = 1; bounced = true; bounceX = state.art.x + currentArt.width/2; bounceY = state.art.y + currentArt.height/2; }
                    if (state.art.y + currentArt.height >= TERMINAL_HEIGHT) { state.art.dy *= -1; state.art.y = TERMINAL_HEIGHT - currentArt.height; bounced = true; bounceX = state.art.x + currentArt.width/2; bounceY = state.art.y + currentArt.height/2; }
                    if (bounced) {
                        state.colorIndex = (state.colorIndex + 10) % colors.length;
                        state.frameIndex = (state.frameIndex + 1) % (animationFrames.length - 1);
                        if (ENABLE_PARTICLE_EXPLOSION) {
                            for(let i=0; i < PARTICLE_COUNT; i++) {
                                const angle = Math.random() * Math.PI * 2; const speed = 0.5 + Math.random() * 1.5;
                                state.particles.push({ x: bounceX, y: bounceY, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed * 0.5, char: '*', color: particleColors[Math.floor(Math.random() * particleColors.length)], lifespan: 10 + Math.random() * 10 });
                            }
                        }
                    }
                    drawArtAtPosition(res, currentArt, state.art.x, state.art.y, colors[state.colorIndex], state.frameCount);
                    break;
            }

            res.write(resetColor);
            state.colorIndex = (state.colorIndex + 1) % colors.length;

        }, FRAME_DELAY);

        res.on('close', () => {
            console.log('Connection closed.');
            clearInterval(animationInterval);
        });

    } else {
        // This is not a curl request, so we redirect to GitHub
        console.log('Connection received from browser, redirecting...');
        res.writeHead(302, {
          'Location': 'https://github.com/rambo1111/curl_vibhaw'
        });
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}. Waiting for connections...`);
});