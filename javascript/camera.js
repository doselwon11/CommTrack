let currentStream = null;
let currentFacingMode = "environment"; // Default: back camera

// function to open the camera and capture an image within the section box
function openCamera(previewId, inputId) {
    let previewContainer = document.getElementById(previewId);
    previewContainer.innerHTML = ""; // clear previous preview

    let video = document.createElement("video");
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    let captureButton = document.createElement("button");
    captureButton.innerText = "Capture";
    captureButton.classList.add("camera-btn");

    let switchButton = document.createElement("button");
    switchButton.innerText = "Switch Camera";
    switchButton.classList.add("camera-btn");

    let closeButton = document.createElement("button");
    closeButton.innerText = "Close Camera";
    closeButton.classList.add("camera-btn");

    let cameraWrapper = document.createElement("div");
    cameraWrapper.classList.add("camera-box");
    cameraWrapper.appendChild(video);
    cameraWrapper.appendChild(captureButton);
    cameraWrapper.appendChild(switchButton);
    cameraWrapper.appendChild(closeButton);

    previewContainer.appendChild(cameraWrapper);

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
    }

    function startCamera() {
        stopCamera(); // Stop any existing stream

        let constraints = {
            video: {
                facingMode: { exact: currentFacingMode } // Forces front or rear camera
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(newStream => {
                currentStream = newStream;
                video.srcObject = newStream;
                video.play();
            })
            .catch(error => {
                console.error("Error accessing camera:", error);
            });
    }

    // start the camera initially
    startCamera();

    // switch camera on button click
    switchButton.addEventListener("click", function () {
        currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
        startCamera();
    });

    // capture image when clicking the button
    captureButton.addEventListener("click", function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL("image/png");

        stopCamera(); // Stop the camera stream

        // display captured image within the section box
        previewContainer.innerHTML = `<img src="${imageData}" class="captured-image">`;

        // save image data in a hidden input
        let inputField = document.getElementById(inputId);
        inputField.value = imageData;
    });

    // close the camera preview
    closeButton.addEventListener("click", function () {
        stopCamera();
        previewContainer.innerHTML = ""; // clear preview
    });
}

// add event listeners for buttons
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("openInfraCamera").addEventListener("click", function () {
        openCamera("infraImagePreview", "infraImageData");
    });

    document.getElementById("openSocialCamera").addEventListener("click", function () {
        openCamera("socialImagePreview", "socialImageData");
    });
});