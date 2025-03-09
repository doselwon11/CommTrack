from transformers import pipeline

# load the pre-trained summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarise_text(issue_description):
    """
    Summarize a user's issue report using transformers ai with correct grammar rules.
    Make the issue description clear, concise, and convincing.
    
    :param issue_description: string, full issue description from user input
    :return: string, summarized issue
    """
    if not issue_description or len(issue_description.strip()) == 0:
        return "No description provided."

    # transformers pipeline requires a minimum length
    min_length = max(20, len(issue_description) // 4)
    max_length = min(100, len(issue_description) // 2)

    summary = summarizer(issue_description, max_length=max_length, min_length=min_length, do_sample=False)
    return summary[0]["summary_text"]
