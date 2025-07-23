const http = require('http');

// --- CONFIGURATION ---
const PORT = process.env.PORT || 8080;
const FRAME_DELAY = 100; // Faster frame rate for smoother animation
const TERMINAL_WIDTH = 80;
const TERMINAL_HEIGHT = 24;

// --- "MATRIX RAIN" CONFIGURATION ---
const RAIN_DENSITY = 70; // Number of raindrops

// --- COLOR & STYLE CONSTANTS ---
const colors = [
    196, 202, 208, 214, 220, 226, 190, 154, 118, 82, 46, 47, 48, 49, 50, 51, 45, 39, 33,
    27, 21, 20, 26, 32, 38, 44, 50, 49, 48, 47, 46, 82, 118, 154, 190, 226, 220, 214,
    208, 202, 196, 197, 198, 199, 200, 201, 207, 213, 219, 225, 224, 223, 222, 221, 215,
    209, 203, 197, 160, 161, 162, 168, 174, 180, 186, 192, 193, 194, 195
].map(c => `\x1b[38;5;${c}m`);
const resetColor = '\x1b[0m';
const matrixHeadColor = '\x1b[38;5;155m'; // Bright Green
const matrixTrailColor = '\x1b[38;5;22m'; // Dark Green
const infoColor = '\x1b[38;5;246m'; // Grey

// --- ANIMATION FRAMES ---
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
// Final "Vibhaw!" frame for the flashing intro. This will NOT be part of the bounce animation.
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


// --- HELPER FUNCTIONS ---

// Draws ASCII art at a specific location
function drawArtAtPosition(res, art, x, y, color) {
    let artString = '';
    art.lines.forEach((line, index) => {
        artString += `\x1b[${y + index};${x}H${color}${line}`;
    });
    res.write(artString);
}

// Draws the live info bar
function drawInfoBar(res, frameCount) {
    const time = new Date().toUTCString();
    const info = `[ ${time} ] - [ Frames: ${frameCount} ]`;
    const pos = TERMINAL_WIDTH - info.length;
    res.write(`\x1b[1;${pos}H${infoColor}${info}`);
}

// Updates and draws the matrix rain
function updateAndDrawMatrixRain(res, raindrops) {
    let rainString = '';
    for (const drop of raindrops) {
        const trailY = drop.y - 1;
        // Move cursor and draw the darker trail character
        if (trailY > 0) {
            rainString += `\x1b[${trailY};${drop.x}H${matrixTrailColor}${drop.char}`;
        }
        // Move cursor and draw the bright head character
        rainString += `\x1b[${drop.y};${drop.x}H${matrixHeadColor}${drop.char}`;

        drop.y++;
        if (drop.y > TERMINAL_HEIGHT) {
            drop.y = 1;
            drop.x = Math.floor(Math.random() * TERMINAL_WIDTH) + 1;
        }
    }
    res.write(rainString);
}

// --- SERVER LOGIC ---
const server = http.createServer((req, res) => {
    console.log('Connection received!');
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    // --- STATE INITIALIZATION FOR THIS CONNECTION ---
    const state = {
        mode: 'spelling', // modes: spelling -> finale -> bouncing
        modeCounter: 0,
        frameCount: 0,
        frameIndex: 0,
        colorIndex: 0,
        art: { x: 5, y: 5, dx: 1, dy: 1 },
        raindrops: Array.from({ length: RAIN_DENSITY }, () => ({
            x: Math.floor(Math.random() * TERMINAL_WIDTH) + 1,
            y: Math.floor(Math.random() * TERMINAL_HEIGHT) + 1,
            char: String.fromCharCode(0x30A0 + Math.random() * 96) // Katakana characters
        }))
    };

    const animationInterval = setInterval(() => {
        state.frameCount++;
        let output = '\x1b[2J\x1b[H'; // Clear screen and move home
        res.write(output);

        // 1. DRAW BACKGROUND AND INFO
        updateAndDrawMatrixRain(res, state.raindrops);
        drawInfoBar(res, state.frameCount);

        // 2. STATE-BASED ANIMATION LOGIC
        const currentArt = animationFrames[state.frameIndex];
        const currentColor = colors[state.colorIndex];

        switch (state.mode) {
            case 'spelling':
                const centeredX = Math.floor((TERMINAL_WIDTH - currentArt.width) / 2);
                const centeredY = Math.floor((TERMINAL_HEIGHT - currentArt.height) / 2);
                drawArtAtPosition(res, currentArt, centeredX, centeredY, currentColor);
                state.modeCounter++;
                if (state.modeCounter > 10) { // Show each letter for ~1 second
                    state.modeCounter = 0;
                    state.frameIndex++;
                    if (state.frameIndex >= animationFrames.length - 1) {
                        state.mode = 'finale'; // Move to finale mode
                    }
                }
                break;

            case 'finale':
                // Flash the final frame
                if (state.modeCounter % 2 === 0) {
                    const cx = Math.floor((TERMINAL_WIDTH - currentArt.width) / 2);
                    const cy = Math.floor((TERMINAL_HEIGHT - currentArt.height) / 2);
                    drawArtAtPosition(res, currentArt, cx, cy, currentColor);
                }
                state.modeCounter++;
                if (state.modeCounter > 20) { // Flash for ~2 seconds
                    state.mode = 'bouncing';
                    state.frameIndex = 0; // Start bouncing from the first letter
                }
                break;

            case 'bouncing':
                // Update position
                state.art.x += state.art.dx;
                state.art.y += state.art.dy;

                // Bounce off walls and change color
                let bounced = false;
                if (state.art.x <= 1 || state.art.x + currentArt.width >= TERMINAL_WIDTH) {
                    state.art.dx *= -1;
                    bounced = true;
                }
                if (state.art.y <= 1 || state.art.y + currentArt.height >= TERMINAL_HEIGHT) {
                    state.art.dy *= -1;
                    bounced = true;
                }
                if (bounced) {
                    state.colorIndex = (state.colorIndex + 10) % colors.length;
                    // FIX: Loop only through the letter frames (length - 1), excluding the final party frame.
                    state.frameIndex = (state.frameIndex + 1) % (animationFrames.length - 1);
                }
                drawArtAtPosition(res, currentArt, state.art.x, state.art.y, colors[state.colorIndex]);
                break;
        }

        res.write(resetColor); // Reset color at the end of the frame
        state.colorIndex = (state.colorIndex + 1) % colors.length;

    }, FRAME_DELAY);

    res.on('close', () => {
        console.log('Connection closed.');
        clearInterval(animationInterval);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`To view, run: curl localhost:${PORT}`);
});
