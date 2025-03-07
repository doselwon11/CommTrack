from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # allow all origins

# dictionary to store reports categorized by country and year
report_database = defaultdict(lambda: {
    "infrastructure": defaultdict(int),
    "social": defaultdict(int)
})

# normalization factor (adjust for scaling)
NORMALIZATION_FACTOR = 1000  # prevents drastic score drops for small countries

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

@app.route('/submit_report', methods=['OPTIONS', 'POST'])
def submit_report():
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

    data = request.json
    if not data:
        return jsonify({"error": "No data received"}), 400

    # extract report details
    report_type = data.get("type")  # infrastructure or social
    category = data.get("category")
    country = data.get("country")
    year = str(datetime.now().year)  # current year

    if not (report_type and category and country):
        return jsonify({"error": "Missing required fields"}), 400

    # map category to broader classifications
    if report_type == "infrastructure":
        report_database[country]["infrastructure"][category] += 1
    elif report_type == "social":
        report_database[country]["social"][category] += 1
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

@app.route('/get_impact_index', methods=['GET'])
def get_impact_index():
    ranked_data = []

    for country, issues in report_database.items():
        infra_total = sum(issues["infrastructure"].values())
        social_total = sum(issues["social"].values())

        # calculate scores with maximum starting point (100)
        infra_score = max(0, 100 - (infra_total * 100 / NORMALIZATION_FACTOR))
        social_score = max(0, 100 - (social_total * 100 / NORMALIZATION_FACTOR))

        # final impact index score
        impact_index = (infra_score + social_score) / 2

        ranked_data.append({
            "country": country,
            "infrastructure_score": round(infra_score, 2),
            "social_score": round(social_score, 2),
            "impact_index": round(impact_index, 2)
        })

    # sort by highest impact index score
    ranked_data.sort(key=lambda x: x["impact_index"], reverse=True)

    return jsonify(ranked_data), 200

@app.route('/get_issue_trends', methods=['GET'])
def get_issue_trends():
    country = request.args.get("country")
    category = request.args.get("category")
    
    filtered_data = {}

    for c, data in report_database.items():
        if country and c != country:
            continue  # Skip if country does not match

        filtered_data[c] = {
            "infrastructure": [],
            "social": []
        }

        # Convert raw numbers into iterable lists
        for cat, count in data["infrastructure"].items():
            if isinstance(count, int):
                filtered_data[c]["infrastructure"].append([str(datetime.now().year), count])
            else:
                filtered_data[c]["infrastructure"].append(count)

        for cat, count in data["social"].items():
            if isinstance(count, int):
                filtered_data[c]["social"].append([str(datetime.now().year), count])
            else:
                filtered_data[c]["social"].append(count)

    return jsonify(filtered_data), 200

if __name__ == '__main__':
    app.run(debug=True)