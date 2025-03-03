// function to fetch and display community infrastructure impact index
function fetchImpactIndex() {
    fetch(`${API_URL}/get_impact_index`)
    .then(response => response.json())
    .then(data => {
        let impactDiv = document.getElementById("indexRankings");

        // check if the div exists
        if (!impactDiv) {
            console.error("Error: impactRankings element not found.");
            return;
        }

        // create the table
        let tableHTML = `
            <table border="1" cellspacing="0" cellpadding="5">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Country</th>
                        <th>Infrastructure Score</th>
                        <th>Social Score</th>
                        <th>Average Impact Index</th>
                    </tr>
                </thead>
                <tbody>
        `;
        // sort and add data rows
        data.forEach((report, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${report.country}</td>
                    <td>${report.infrastructure_score}</td>
                    <td>${report.social_score}</td>
                    <td>${report.impact_index}</td>
                </tr>
            `;
        });
        tableHTML += `
                </tbody>
            </table>
        `;
        // insert the table into the div
        impactDiv.innerHTML = tableHTML;
    })
    .catch(error => console.error("Error fetching impact index:", error));
}

// load impact rankings when the page loads
document.addEventListener("DOMContentLoaded", fetchImpactIndex);