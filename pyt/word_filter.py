import re
from transformers import pipeline

# load a pre-trained transformer model for text classification (can fine-tune later)
spam_classifier = pipeline("text-classification", model="facebook/bart-large-mnli")

# define spam and bad keywords (words that are offensive and vulgar) indicators
BAD_KEYWORDS = ["buy now", "free money", "click this", 
                 "subscribe", "win big", "lottery", 
                 "bitcoin", "gamble", "click here",
                 "limited time offer", "get rich",
                 "earn extra cash", "make money fast",
                 "guaranteed", "additional income", 
                 "best price", "big bucks", "cash bonus",
                 "extra income", "free access", "free consultation",
                 "free gift", "free hosting", "free info",
                 "free investment", "free membership", "free preview",
                 "horny", "free quote", "free trial", "full refund",
                 "giveaway", "incredible deal", "lowest price", "money back",
                 "prize", "satisfaction", "save big money", "save up to",
                 "special promotion", "arsehole", "asshole", "bastard", "bitch",
                 "blowjob", "bollocks", "bullshit", "cock", "cornhole", "crap",
                 "cunt", "dick", "dumbass", "faggot", "fuck", "fuckery", "fucking",
                 "fucked", "motherfucker", "nigga", "nigger", "paki", "pussy",
                 "retard", "shit", "shitty", "slut", "piss", "whore"]

def detect_bad(text):
    """Check if text contains spam-like and offensive behavior"""
    text_lower = text.lower()

    # keyword-based filtering
    if any(keyword in text_lower for keyword in BAD_KEYWORDS):
        return True, "Your description contains one or more bad keywords, which are not allowed."

    # regex-based spam detection (URLs, repeated words, etc.)
    if re.search(r"(http|www|\.com|bit\.ly|tinyurl)", text_lower):
        return True, "Your description suspicious links, which are not allowed."
    
    # AI Model-Based Filtering
    prediction = spam_classifier(text)[0]
    if prediction['label'] == 'contradiction' and prediction['score'] > 0.8:
        return True, "Text seems contradictory or unreliable."

    return False, "Text is valid."

