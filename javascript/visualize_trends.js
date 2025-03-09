// function to visualize trends
function visualizeTrends(trendData) {
    console.log("Trend Data Received:", JSON.stringify(trendData, null, 2));

    // check if there's valid data
    if (!trendData || Object.keys(trendData).length === 0) {
        console.error("No valid trend data available.");
        clearChart();
        return;
    }

    let ctxTrend = document.getElementById('trend-charts').getContext('2d');

    let labels = new Set();
    let infraData = {};
    let socialData = {};
    let hasData = false; // flag to check if there is actual trend data

    for (let country in trendData) {
        let infraTrends = trendData[country]["infrastructure"] || {};
        let socialTrends = trendData[country]["social"] || {};

        // extract nested infrastructure trends
        Object.values(infraTrends).forEach(categoryTrends => {
            Object.entries(categoryTrends).forEach(([timestamp, count]) => {
                labels.add(timestamp);
                if (!infraData[timestamp]) infraData[timestamp] = 0;
                infraData[timestamp] += count;
                hasData = true;
            });
        });

        // extract nested social trends
        Object.values(socialTrends).forEach(categoryTrends => {
            Object.entries(categoryTrends).forEach(([timestamp, count]) => {
                labels.add(timestamp);
                if (!socialData[timestamp]) socialData[timestamp] = 0;
                socialData[timestamp] += count;
                hasData = true;
            });
        });
    }

    // if there's no valid data, clear the chart
    if (!hasData) {
        console.warn("No actual data to display.");
        clearChart();
        return;
    }

    // convert labels to a sorted array
    let sortedLabels = Array.from(labels).sort();
    let infraCounts = sortedLabels.map(timestamp => infraData[timestamp] || 0);
    let socialCounts = sortedLabels.map(timestamp => socialData[timestamp] || 0);

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

// function to clear the chart when no data is available
function clearChart() {
    if (window.trendChart) {
        window.trendChart.destroy();
        window.trendChart = null;
    }
}