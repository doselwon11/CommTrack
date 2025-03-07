// function to visualize both infrastructure and social issue trends on a single chart
function visualizeTrends(trendData) {
    console.log("Trend Data Received:", JSON.stringify(trendData, null, 2));

    if (!trendData || Object.keys(trendData).length === 0) {
        console.error("No valid trend data available.");
        return;
    }

    let ctxTrend = document.getElementById('trend-charts').getContext('2d');

    let labels = new Set();
    let infraData = {};
    let socialData = {};

    for (let country in trendData) {
        let infraTrends = trendData[country]["infrastructure"] || [];
        let socialTrends = trendData[country]["social"] || [];

        // process infrastructure data (handling empty lists)
        infraTrends.forEach(entry => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                console.error("Invalid infrastructure trend entry:", entry);
                return;
            }
            let [year, count] = entry;
            labels.add(year);
            if (!infraData[year]) infraData[year] = 0;
            infraData[year] += count;
        });

        // process social data
        socialTrends.forEach(entry => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                console.error("Invalid social trend entry:", entry);
                return;
            }
            let [year, count] = entry;
            labels.add(year);
            if (!socialData[year]) socialData[year] = 0;
            socialData[year] += count;
        });
    }

    // convert sets to sorted arrays
    let sortedLabels = Array.from(labels).sort();
    let infraCounts = sortedLabels.map(year => infraData[year] || 0);
    let socialCounts = sortedLabels.map(year => socialData[year] || 0);

    // destroy existing chart if it exists
    if (window.trendChart) window.trendChart.destroy();

    // create merged trend chart with whole numbers on y-axis
    window.trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: sortedLabels,
            datasets: [
                {
                    label: "Infrastructure Issues Over Time",
                    data: infraCounts,
                    borderColor: "red",
                    fill: false
                },
                {
                    label: "Social Issues Over Time",
                    data: socialCounts,
                    borderColor: "blue",
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'logarithmic', // allows for proper scaling of increasing values
                    min: 1, // ensures smallest value is at least 1
                    ticks: {
                        callback: function(value) {
                            return Number.isInteger(value) ? value : ''; // only display whole numbers
                        },
                        stepSize: 1 // forces step increments of whole numbers
                    }
                }
            }
        }
    });
}