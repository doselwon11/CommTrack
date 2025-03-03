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
        let reportDiv = document.getElementById("reportRankings");

        // check if the div exists
        if (!reportDiv) {
            console.error("Error: reportRankings element not found.");
            return;
        }

        // create the table
        let tableHTML = `
            <table border="1" cellspacing="0" cellpadding="5">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Country</th>
                        <th>Infrastructure Issues</th>
                        <th>Social Issues</th>
                        <th>Total Issues</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // sort and add data rows
        data.forEach((report, index) => {
            let totalIssues = report.total_infrastructure_issues + report.total_social_issues;
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${report.country}</td>
                    <td>${report.total_infrastructure_issues}</td>
                    <td>${report.total_social_issues}</td>
                    <td>${totalIssues}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        // insert the table into the div
        reportDiv.innerHTML = tableHTML;
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