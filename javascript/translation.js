// function to send text to the backend for translation
async function translateText(text, targetLang, inputFieldId) {
    let response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text,
            target_lang: targetLang
        })
    });

    let result = await response.json();

    if (result.translated_text) {
        document.getElementById(inputFieldId).value = result.translated_text;
    } 
    else {
        console.error("Translation failed:", result.error);
    }
}

// event listeners for translation buttons
document.addEventListener("DOMContentLoaded", function () {
    let infraTranslateBtn = document.getElementById("infraTranslateBtn");
    let socialTranslateBtn = document.getElementById("socialTranslateBtn");
    let infraLangSelect = document.getElementById("infraLangSelect");
    let socialLangSelect = document.getElementById("socialLangSelect");

    if (infraTranslateBtn) {
        infraTranslateBtn.addEventListener("click", function () {
            event.preventDefault();
            let text = document.getElementById("infraDescription").value;
            let targetLang = infraLangSelect.value; // get selected language
            translateText(text, targetLang, "infraDescription");
        });
    }

    if (socialTranslateBtn) {
        socialTranslateBtn.addEventListener("click", function () {
            event.preventDefault();
            let text = document.getElementById("socialDescription").value;
            let targetLang = socialLangSelect.value; // get selected language
            translateText(text, targetLang, "socialDescription");
        });
    }
});