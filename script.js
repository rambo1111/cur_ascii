// Import the built-in Node.js HTTP module.
const http = require('http');

// --- CONFIGURATION ---
const PORT = 8080; // The port the server will listen on.
const FRAME_DELAY = 200; // Delay between frames in milliseconds (1000ms = 1s).

// --- ANIMATION FRAMES ---
// Store your ASCII art frames inside backticks (`).
// Each string in the array is a separate frame.
const animationFrames = [
    `
    '   .   '
      .   .
' .  _  . '
   . / \\ .
  . /   \\ .
'  '     '  '
`,
    `
       '
    ' . '
' .  * . '
   ' \\ / '
  .   V   .
'  .  '  .  '
`
];

// Create the HTTP server.
const server = http.createServer((req, res) => {
    
    // Log to the console when someone connects.
    console.log('Connection received from:', req.socket.remoteAddress);

    // --- STREAMING LOGIC ---

    // Write the HTTP headers to the response.
    // 'Content-Type': 'text/plain' tells the client (curl) to treat the response as plain text.
    // 'Connection': 'keep-alive' is important for streaming.
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    let frameIndex = 0;
    
    // Use setInterval to repeatedly send frames.
    const animationInterval = setInterval(() => {
        // Get the current frame.
        const frame = animationFrames[frameIndex];

        // ANSI escape codes are special commands for the terminal.
        // '\033[2J' clears the entire screen.
        // '\033[H' moves the cursor to the top-left corner (home).
        const clearScreenCode = '\033[2J\033[H';

        // Write the clear code and the frame to the response stream.
        res.write(clearScreenCode + frame);

        // Move to the next frame, looping back to the start if we're at the end.
        frameIndex = (frameIndex + 1) % animationFrames.length;

    }, FRAME_DELAY);

    // --- CLEANUP ---
    // It's crucial to stop the interval when the user disconnects.
    // The 'close' event is fired when the user's `curl` command is terminated (e.g., with Ctrl+C).
    res.on('close', () => {
        console.log('Connection closed. Stopping animation stream.');
        clearInterval(animationInterval); // Stop sending frames.
    });
});

// Start the server and listen for connections on the specified port.
server.listen(PORT, () => {
    console.log(`Server is running and waiting for connections...`);
});
