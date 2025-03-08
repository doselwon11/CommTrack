// check if the browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    console.log("Speech recognition is supported");

    function startVoiceInput(inputFieldId) {
        let recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // default language, will change dynamically later
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            console.log("Voice recognition has started...");
        };

        recognition.onspeechend = function () {
            recognition.stop();
            console.log("Voice recognition has stopped.");
        };

        recognition.onresult = function (event) {
            let transcript = event.results[0][0].transcript;
            document.getElementById(inputFieldId).value = transcript; // insert text into input field
            console.log("Recognized speech:", transcript);
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
        };

        recognition.start();
    }

    // attach event listeners to buttons for voice input
    document.addEventListener("DOMContentLoaded", function () {
        let infraVoiceBtn = document.getElementById("infraVoiceBtn");
        let socialVoiceBtn = document.getElementById("socialVoiceBtn");

        if (infraVoiceBtn) {
            infraVoiceBtn.addEventListener("click", function () {
                startVoiceInput("infraDescription");
            });
        }
        if (socialVoiceBtn) {
            socialVoiceBtn.addEventListener("click", function () {
                startVoiceInput("socialDescription");
            });
        }
    });
} 
else {
    console.warn("Speech recognition is not supported in this browser.");
}
