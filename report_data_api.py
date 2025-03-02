from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)
CORS(app)  # enable CORS

# dictionary to store reports categorized by country and year
report_database = defaultdict(lambda: {"infrastructure": defaultdict(int), "social": defaultdict(int)})

# categories mapping for infrastructure issues
infrastructure_categories = {
    "roads": "Damaged roads, bridges, tunnels, and infrastructure",
    "dataloss": "Technological issues",
    "electricity": "Gas/electricity/energy issues",
    "water": "Water supply issues",
    "transport": "Transportation issues",
    "wifi": "No Internet access",
    "maintenance": "Maintenance issues",
    "others": "Others"
}

# categories mapping for social issues
social_categories = {
    "racism": "Racism",
    "unemployment": "Unemployment",
    "crime": "Crime",
    "education": "Education issues",
    "corruption": "Corruption",
    "economic-inequality": "Economic inequality",
    "healthcare": "Healthcare",
    "child-labour": "Child labour",
    "environmental": "Environmental issues",
    "gender-inequality": "Gender inequality",
    "lgbtq+": "LGBTQ+ rights",
    "homelessness": "Homelessness",
    "addiction": "Addiction",
    "animal-rights": "Animal rights",
    "violence": "Violence",
    "human-rights": "Human rights",
    "political": "Political issues",
    "others": "Others"
}

@app.route('/submit_report', methods=['POST'])
def submit_report():
    data = request.json

    # extract report details
    report_type = data.get("type")  # infrastructure or social
    category = data.get("category")
    country = data.get("country")
    year = str(datetime.now().year)  # current year

    if not (report_type and category and country):
        return jsonify({"error": "Missing required fields"}), 400

    # map category to broader classifications
    if report_type == "infrastructure":
        category_name = infrastructure_categories.get(category, "Others")
        report_database[country]["infrastructure"][category_name] += 1
    elif report_type == "social":
        category_name = social_categories.get(category, "Others")
        report_database[country]["social"][category_name] += 1
    else:
        return jsonify({"error": "Invalid report type"}), 400

    return jsonify({"message": "Report submitted successfully"}), 200

@app.route('/get_reports', methods=['GET'])
def get_reports():
    ranked_reports = []

    for country, issues in report_database.items():
        infra_total = sum(issues["infrastructure"].values())
        social_total = sum(issues["social"].values())

        ranked_reports.append({
            "country": country,
            "total_infrastructure_issues": infra_total,
            "total_social_issues": social_total
        })

    # sort by the total number of reported issues
    ranked_reports.sort(key=lambda x: (x["total_infrastructure_issues"], x["total_social_issues"]), reverse=True)

    return jsonify(ranked_reports), 200

if __name__ == '__main__':
    app.run(debug=True)