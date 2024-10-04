// script.js

let mediaRecorder; // MediaRecorder instance
let recordedChunks = []; // Array to store recorded video chunks
const videoList = document.getElementById('videoList'); // Element to display recorded videos
const toast = document.getElementById('toast'); // Toast notification element

// Function to start recording
async function startRecording() {
    try {
        // Request audio from the microphone
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Request screen media (browser will ask for selection)
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always" // Record the cursor
            },
            audio: true // Include audio from the screen
        });

        // Combine the audio streams (screen audio and microphone audio)
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(), // Add video track from screen
            ...audioStream.getAudioTracks()   // Add audio track from microphone
        ]);

        // Create a new MediaRecorder instance
        mediaRecorder = new MediaRecorder(combinedStream);

        // Add event listeners to the MediaRecorder
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;

        // Stop recording when screen sharing stops
        screenStream.getVideoTracks()[0].addEventListener('ended', stopRecording);

        // Start recording
        mediaRecorder.start();
        
        // Show toast notification
        toast.innerText = 'Recording... Audio is being recorded.';
        toast.style.display = 'block';

        // Enable stop button and disable start button
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } catch (err) {
        console.error("Error: " + err);
        alert("Could not start recording: " + err.message);
    }
}

// Function to handle data available event
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data); // Push recorded data to array
    }
}

// Function to handle stop event
function handleStop() {
    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunks, {
        type: 'video/webm' // Specify video format
    });
    recordedChunks = []; // Reset the recorded chunks array

    // Create a URL for the recorded video
    const videoURL = URL.createObjectURL(blob);

    // Create a new video element to display the recorded video
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    const videoElement = document.createElement('video');
    videoElement.src = videoURL;
    videoElement.controls = true;
    videoElement.width = 320;

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = videoURL;
    downloadLink.download = 'recording.webm'; // Filename for download
    downloadLink.innerText = 'Download Video';

    // Create an input to rename the video
    const renameInput = document.createElement('input');
    renameInput.placeholder = 'Enter new name';
    renameInput.addEventListener('change', function() {
        videoElement.setAttribute('data-name', renameInput.value);
    });

    videoItem.appendChild(videoElement);
    videoItem.appendChild(downloadLink);
    videoItem.appendChild(renameInput);
    videoList.appendChild(videoItem);

    // Hide toast notification
    toast.style.display = 'none';

    // Enable start button and disable stop button
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

// Function to stop recording
function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop(); // Stop the recording
    }
}

// Event listeners for buttons
document.getElementById('startBtn').addEventListener('click', startRecording);
document.getElementById('stopBtn').addEventListener('click', stopRecording);

