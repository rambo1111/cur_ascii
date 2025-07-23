// Import the built-in Node.js HTTP module.
const http = require('http');

// --- CONFIGURATION ---
// Use the port provided by the environment (like Render) or default to 8080 for local testing.
const PORT = process.env.PORT || 8080; 
// Delay between frames in milliseconds (1000ms = 1s).
const FRAME_DELAY = 300; 

// --- ANIMATION FRAMES ---
// An array of strings, where each string is a frame of the ASCII animation.
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
`
];

// Create the HTTP server.
const server = http.createServer((req, res) => {
    
    // Log to the server console when someone connects.
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
    
    // Use setInterval to repeatedly send frames to the client.
    const animationInterval = setInterval(() => {
        // Get the current frame from the array.
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
        clearInterval(animationInterval); // Stop sending frames to prevent memory leaks.
    });
});

// Start the server and listen for connections on the specified port.
server.listen(PORT, () => {
    console.log(`Server is running and waiting for connections...`);
});
