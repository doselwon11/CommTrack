// function to visualize both infrastructure and social issue trends on a single chart
// function to visualize trends
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
        let infraTrends = trendData[country]["infrastructure"] || {};
        let socialTrends = trendData[country]["social"] || {};

        Object.entries(infraTrends).forEach(([timestamp, count]) => {
            labels.add(timestamp);
            infraData[timestamp] = count;
        });

        Object.entries(socialTrends).forEach(([timestamp, count]) => {
            labels.add(timestamp);
            socialData[timestamp] = count;
        });
    }

    // convert sets to sorted arrays
    let sortedLabels = Array.from(labels).sort();
    let infraCounts = sortedLabels.map(year => infraData[year] || 0);
    let socialCounts = sortedLabels.map(year => socialData[year] || 0);

    // destroy existing chart if it exists
    if (window.trendChart) window.trendChart.destroy();

    // create merged trend chart
    window.trendChart = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: sortedLabels,
            datasets: [
                {
                    label: "Infrastructure Issues",
                    data: infraCounts,
                    borderColor: "red",
                    fill: false
                },
                {
                    label: "Social Issues",
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
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : ''; // show only whole numbers
                        }
                    }
                }
            }
        }
    });
}