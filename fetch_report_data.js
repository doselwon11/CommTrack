const API_URL = "http://127.0.0.1:5000";

// function to send a report to the backend
function sendReport(reportType, category, country) {
    fetch(`${API_URL}/submit_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, category: category, country: country })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Report submitted:", data);
        fetchReports(); // refresh rankings
    })
    .catch(error => console.error("Error submitting report:", error));
}

// function to fetch and display ranked reports
function fetchReports() {
    fetch(`${API_URL}/get_reports`)
    .then(response => response.json())
    .then(data => {
        let reportList = document.getElementById("reportRankings");

        // check if reportRankings element exists before modifying it
        if (!reportList) {
            console.error("Error: reportRankings element not found.");
            return;
        }

        reportList.innerHTML = "<h2>Report Rankings</h2>";

        data.forEach(report => {
            let item = document.createElement("p");
            item.innerHTML = `<strong>${report.country}</strong>: 
                ${report.total_infrastructure_issues} Infrastructure Issues, 
                ${report.total_social_issues} Social Issues`;
            reportList.appendChild(item);
        });
    })
    .catch(error => console.error("Error fetching reports:", error));
}

// attach event listeners to form submissions
document.getElementById("infraForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let category = document.getElementById("infraCategory").value;
    let country = document.getElementById("country").value;
    sendReport("infrastructure", category, country);
});

document.getElementById("socialForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let category = document.getElementById("socialCategory").value;
    let country = document.getElementById("country").value;
    sendReport("social", category, country);
});

// load reports when the page loads
document.addEventListener("DOMContentLoaded", fetchReports);