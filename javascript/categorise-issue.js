const infrastructureKeywords = {
    "roads": ["pothole", "bridge", "tunnel", "road damage", "crack", "highway", "corrugations", "rut", "ravel", "frost", "upheaval", "fatigue"],
    "dataloss": ["server", "data loss", "malfunction", "outage", "cyber", "hardware", "software", "corruption", "cyberthreats", "cybersecurity", "AI"],
    "electricity": ["blackout", "power outage", "transformer", "electrical", "circuit", "buzzing", "warm outlets", "burning", "loose outlet", "power", "electricity", "energy", "gas"],
    "water": ["water leak", "pipe burst", "contamination", "drought", "water pollution", "flood", "oil spillages", "contamination", "wastewater", "poor water"],
    "transport": ["bus stop", "train delay", "traffic jam", "subway", "traffic congestion", "transport environment", "inadequate transport"],
    "wifi": ["internet down", "no signal", "network issue", "wifi broken", "wi-fi", "dns", "slow internet", "internet loss", "vpn", "dns"],
    "maintenance": ["building damage", "structural issue", "falling debris", "ageing", "deterioration", "damage", "compromised communication"],
    "weather": ["droughts", "floods", "thunderstorms", "tornado", "storm", "thunder", "hail", "blizzard", "wind", "cyclone", "heat", "rainfall", "snow", "freezing", "rain", "wildfire", "fire"],
    "others": []
};

const socialKeywords = {
    "racism": ["discrimination", "hate speech", "racial", "ethnicity", "black", "native american", "asian", "hispanic", "pacific islander", "biracial"],
    "unemployment": ["job loss", "laid off", "no work", "jobless"],
    "crime": ["robbery", "assault", "theft", "shooting", "rape", "sexual assault"],
    "education": ["school", "schools", "teacher", "teachers", "education issue", "learning", "faculty", "student", "class", "classes"],
    "corruption": ["bribe", "fraud", "bribery", "embezzlement", "embezzle", "peddling", "influence", "theft"],
    "economic-inequality": ["wage gap", "poverty", "low income", "inequality", "poor"],
    "healthcare": ["hospital", "medical issue", "no healthcare", "doctor", "insurance"],
    "child-labour": ["child work", "exploitation", "abuse"],
    "environmental": ["pollution", "climate", "carbon",  "pollution", "contamination", "waste", "depletion", "tree", "forest", "mountain"],
    "gender-inequality": ["women", "men", "women rights", "gender gap", "feminism", "gender inequality", "patriarchy"],
    "lgbtq+": ["LGBT", "gay rights", "discrimination", "queer", "lesbian", "bisexual", "pansexual"],
    "homelessness": ["homeless", "no shelter"],
    "addiction": ["drug abuse", "alcoholic", "rehab", "heroine", "drug", "cocaine"],
    "animal-rights": ["animal abuse", "poaching", "animal killing", "dog", "cat", "pet", "wild animal"],
    "violence": ["assault", "murder", "domestic violence", "kill", "suicide", "bombing", "shooting", "shoot", "bomb", "assasination"],
    "human-rights": ["torture", "freedom", "abuse", "humans"],
    "political": ["protest", "election issue", "corruption"],
    "climate": ["droughts", "floods", "thunderstorms", "tornado", "storm", "thunder", "hail", "blizzard", "wind", "cyclone", "heat", "rainfall", "snow", "freezing", "rain", "wildfire", "fire"],
    "others": []
};

// function to classify issue
function classifyIssue(description, type) {
    let keywords = type === "infrastructure" ? infrastructureKeywords : socialKeywords;
    let matchedCategory = "others"; // default
    Object.keys(keywords).forEach(category => {
        keywords[category].forEach(keyword => {
            if (description.toLowerCase().includes(keyword)) {
                matchedCategory = category;
            }
        });
    });
    return matchedCategory;
}

// function to handle description input and auto-suggest category
function suggestCategory(event, type) {
    let description = event.target.value;
    let suggestedCategory = classifyIssue(description, type);
    if (type === "infrastructure") {
        document.getElementById("infraCategory").value = suggestedCategory;
    } 
    else {
        document.getElementById("socialCategory").value = suggestedCategory;
    }
}

// attach event listeners
document.getElementById("infraDescription").addEventListener("input", (event) => suggestCategory(event, "infrastructure"));
document.getElementById("socialDescription").addEventListener("input", (event) => suggestCategory(event, "social"));