from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # allow all origins

# dictionary to store reports categorized by country and year
report_database = defaultdict(lambda: {
    "infrastructure": defaultdict(lambda: defaultdict(int)),
    "social": defaultdict(lambda: defaultdict(int))
})

# function to get formatted timestamps for different time intervals
def get_time_intervals():
    now = datetime.now()
    return {
        "minute": now.strftime("%Y-%m-%d %H:%M"), # YYYY-MM-DD HH:MM
        "hour": now.strftime("%Y-%m-%d %H"),      # YYYY-MM-DD HH
        "day": now.strftime("%Y-%m-%d"),          # YYYY-MM-DD
        "week": now.strftime("%Y-W%W"),           # YYYY-WEEKNUMBER
        "month": now.strftime("%Y-%m"),           # YYYY-MM
        "year": now.strftime("%Y")                # YYYY
    }

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

@app.route('/submit_report', methods=['POST'])
def submit_report():
    data = request.json

    report_type = data.get("type")  # "infrastructure" or "social"
    category = data.get("category")
    country = data.get("country")

    if not (report_type and category and country):
        return jsonify({"error": "Missing required fields"}), 400

    # Capture different timestamps
    now = datetime.now()
    year = str(now.year)
    month = f"{now.year}-{now.month:02d}"
    week = f"{now.year}-W{now.strftime('%U')}"
    day = now.strftime("%Y-%m-%d")
    hour = now.strftime("%Y-%m-%d %H")
    minute = now.strftime("%Y-%m-%d %H:%M")

    # Ensure country exists in the database
    if country not in report_database:
        report_database[country] = {
            "infrastructure": defaultdict(int),
            "social": defaultdict(int),
            "trends": {
                "infrastructure": defaultdict(lambda: defaultdict(int)),
                "social": defaultdict(lambda: defaultdict(int))
            }
        }

    # Store report data
    if report_type == "infrastructure":
        report_database[country]["infrastructure"][category] += 1

        # Store trends under infrastructure
        trends = report_database[country]["trends"]["infrastructure"]
    elif report_type == "social":
        report_database[country]["social"][category] += 1

        # Store trends under social
        trends = report_database[country]["trends"]["social"]
    else:
        return jsonify({"error": "Invalid report type"}), 400

    # Store issue trends over time
    trends[category][minute] += 1
    trends[category][hour] += 1
    trends[category][day] += 1
    trends[category][week] += 1
    trends[category][month] += 1
    trends[category][year] += 1

    return jsonify({"message": "Report submitted successfully"}), 200

@app.route('/get_reports', methods=['GET'])
def get_reports():
    ranked_reports = []

    for country, issues in report_database.items():
        infra_issues = issues.get("infrastructure", {})
        social_issues = issues.get("social", {})

        # Ensure defaultdict is converted to dictionary & all values are integers
        infra_total = sum(int(value) for value in infra_issues.values() if isinstance(value, int))
        social_total = sum(int(value) for value in social_issues.values() if isinstance(value, int))

        ranked_reports.append({
            "country": country,
            "total_infrastructure_issues": infra_total,
            "total_social_issues": social_total
        })

    # Sort by highest number of total reported issues
    ranked_reports.sort(key=lambda x: (x["total_infrastructure_issues"] + x["total_social_issues"]), reverse=True)

    return jsonify(ranked_reports), 200

@app.route('/get_impact_index', methods=['GET'])
def get_impact_index():
    ranked_data = []

    for country, issues in report_database.items():
        infra_issues = issues.get("infrastructure", {})
        social_issues = issues.get("social", {})

        # Convert defaultdict to regular dictionary
        if isinstance(infra_issues, defaultdict):
            infra_issues = dict(infra_issues)
        if isinstance(social_issues, defaultdict):
            social_issues = dict(social_issues)

        # Ensure all values are integers before summing
        infra_total = sum(int(value) for value in infra_issues.values() if isinstance(value, int))
        social_total = sum(int(value) for value in social_issues.values() if isinstance(value, int))

        # Calculate scores (starting from 100, decrease based on issues)
        infra_score = max(0, 100 - (infra_total * 100 / NORMALIZATION_FACTOR))
        social_score = max(0, 100 - (social_total * 100 / NORMALIZATION_FACTOR))

        impact_index = (infra_score + social_score) / 2

        ranked_data.append({
            "country": country,
            "infrastructure_score": round(infra_score, 2),
            "social_score": round(social_score, 2),
            "impact_index": round(impact_index, 2)
        })

    # Sort by highest impact index score
    ranked_data.sort(key=lambda x: x["impact_index"], reverse=True)

    return jsonify(ranked_data), 200

@app.route('/get_issue_trends', methods=['GET'])
def get_issue_trends():
    country_filter = request.args.get("country")
    category_filter = request.args.get("category")

    filtered_trends = {}

    for country, data in report_database.items():
        if country_filter and country != country_filter:
            continue  # Skip countries that don't match the filter

        filtered_trends[country] = {"infrastructure": {}, "social": {}}

        for trend_type in ["infrastructure", "social"]:
            for category, trend_data in data["trends"][trend_type].items():
                if category_filter and category != category_filter:
                    continue  # Skip categories that don't match the filter
                
                # Convert defaultdict(int) to a normal dictionary
                filtered_trends[country][trend_type][category] = dict(trend_data)

    return jsonify(filtered_trends), 200


if __name__ == '__main__':
    app.run(debug=True)