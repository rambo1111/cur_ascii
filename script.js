// Import the built-in Node.js HTTP module.
const http = require('http');

// --- CONFIGURATION ---
// Use the port provided by the environment (like Render) or default to 8080 for local testing.
const PORT = process.env.PORT || 8080;
// Delay between frames in milliseconds (1000ms = 1s). A shorter delay makes the animation faster.
const FRAME_DELAY = 250;
// Number of confetti particles to draw on the background for each frame.
const CONFETTI_COUNT = 100;

// --- DECORATION: SMOOTH RAINBOW COLOR CODES ---
// We'll cycle through these colors for each frame.
// Using ANSI 256-color codes for a much smoother, more vibrant "parrot.live" style effect.
const colors = [
    196, 202, 208, 214, 220, 226, 190, 154, 118, 82, 46, 47, 48, 49, 50, 51, 45, 39, 33,
    27, 21, 20, 26, 32, 38, 44, 50, 49, 48, 47, 46, 82, 118, 154, 190, 226, 220, 214,
    208, 202, 196, 197, 198, 199, 200, 201, 207, 213, 219, 225, 224, 223, 222, 221, 215,
    209, 203, 197, 160, 161, 162, 168, 174, 180, 186, 192, 193, 194, 195
].map(c => `\x1b[38;5;${c}m`); // Maps the color numbers to their full ANSI escape code.
const resetColor = '\x1b[0m';

// --- DECORATION: CONFETTI CHARACTERS ---
const confettiChars = ['*', '+', '.'];

// --- ANIMATION FRAMES ---
// An array of strings, where each string is a frame of the ASCII animation.
// DECORATION: Frames are now padded to be centered in an 80-column terminal.
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
                                       AAA               
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
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
####################################
`
];

// --- Helper function to draw the background ---
function drawConfettiBackground(res) {
    let background = '';
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const row = Math.floor(Math.random() * 24) + 1; // Terminal height
        const col = Math.floor(Math.random() * 80) + 1; // Terminal width
        const char = confettiChars[Math.floor(Math.random() * confettiChars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // ANSI code to move cursor to a random position, set color, and draw character
        background += `\x1b[${row};${col}H${color}${char}`;
    }
    res.write(background);
}


// Create the HTTP server.
const server = http.createServer((req, res) => {
    
    // Log to the server console when someone connects.
    console.log('Connection received from:', req.socket.remoteAddress);

    // Write the HTTP headers to the response.
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });
    
    // --- DECORATION: Welcome message ---
    // Clear the screen and show a temporary message before the animation starts.
    res.write('\033[2J\033[H'); // Clear screen, move cursor to top-left
    res.write('✨ Connecting to the VIBHAW experience... ✨');

    let frameIndex = 0;
    let colorIndex = 0;
    
    // Delay the start of the animation to show the welcome message
    setTimeout(() => {
        const animationInterval = setInterval(() => {
            // Get the current frame from the array.
            const frame = animationFrames[frameIndex];
            // Get the color for the current frame, cycling through the rainbow.
            const color = colors[colorIndex];

            // --- DRAWING LOGIC ---
            // 1. Clear the entire screen and move cursor to the top-left corner.
            const clearScreenCode = '\033[2J\033[H';
            res.write(clearScreenCode);

            // 2. Draw the dynamic, colorful confetti background.
            drawConfettiBackground(res);
            
            // 3. Draw the main ASCII art frame on top of the background.
            // We need to move the cursor back to the top-left before drawing the frame.
            const moveCursorHome = '\033[H';
            res.write(moveCursorHome + color + frame + resetColor);

            // Move to the next frame, looping back to the start.
            frameIndex = (frameIndex + 1) % animationFrames.length;
            // Move to the next color, looping back to the start.
            colorIndex = (colorIndex + 1) % colors.length;

        }, FRAME_DELAY);

        // --- CLEANUP ---
        // Stop the interval when the user disconnects (e.g., by pressing Ctrl+C in curl).
        res.on('close', () => {
            console.log('Connection closed. Stopping animation stream.');
            clearInterval(animationInterval); // Stop sending frames.
        });

    }, 1500); // 1.5 second delay before animation starts.
});

// Start the server.
server.listen(PORT, () => {
    console.log(`Server is running!`);
    console.log(`Try it out in your terminal with: curl localhost:${PORT}`);
});
