// Function to visualize filtered trends using Chart.js
function visualizeTrends(trendData) {
    console.log("Trend Data Received:", JSON.stringify(trendData, null, 2)); // Debugging log

    if (!trendData || Object.keys(trendData).length === 0) {
        console.error("No valid trend data available.");
        return;
    }

    let ctxInfra = document.getElementById('infraTrendChart').getContext('2d');
    let ctxSocial = document.getElementById('socialTrendChart').getContext('2d');

    let infraLabels = new Set();
    let infraData = {};
    let socialLabels = new Set();
    let socialData = {};

    for (let country in trendData) {
        let infraTrends = trendData[country]["infrastructure"];
        let socialTrends = trendData[country]["social"];

        // 🛠️ FIX: Ensure infrastructure is an object, not a list
        if (!Array.isArray(infraTrends)) {
            console.warn(`Invalid infrastructure data for ${country}, skipping.`);
            continue;
        }

        // 🛠️ FIX: Ensure social trends are in the correct format
        if (!Array.isArray(socialTrends)) {
            console.warn(`Invalid social data for ${country}, skipping.`);
            continue;
        }

        // Process Infrastructure Data (handling empty lists)
        infraTrends.forEach(entry => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                console.error("Invalid infrastructure trend entry:", entry);
                return;
            }
            let [year, count] = entry;
            infraLabels.add(year);
            if (!infraData[year]) infraData[year] = 0;
            infraData[year] += count;
        });

        // Process Social Data
        socialTrends.forEach(entry => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                console.error("Invalid social trend entry:", entry);
                return;
            }
            let [year, count] = entry;
            socialLabels.add(year);
            if (!socialData[year]) socialData[year] = 0;
            socialData[year] += count;
        });
    }

    // Convert Sets to Sorted Arrays
    let infraLabelsArr = Array.from(infraLabels).sort();
    let socialLabelsArr = Array.from(socialLabels).sort();

    let infraCounts = infraLabelsArr.map(year => infraData[year] || 0);
    let socialCounts = socialLabelsArr.map(year => socialData[year] || 0);

    // Destroy existing charts if they exist
    if (window.infraChart) window.infraChart.destroy();
    if (window.socialChart) window.socialChart.destroy();

    // Create Infrastructure Trend Chart
    window.infraChart = new Chart(ctxInfra, {
        type: 'line',
        data: {
            labels: infraLabelsArr,
            datasets: [{
                label: "Infrastructure Issues Over Time",
                data: infraCounts,
                borderColor: "red",
                fill: false
            }]
        }
    });

    // Create Social Trend Chart
    window.socialChart = new Chart(ctxSocial, {
        type: 'line',
        data: {
            labels: socialLabelsArr,
            datasets: [{
                label: "Social Issues Over Time",
                data: socialCounts,
                borderColor: "blue",
                fill: false
            }]
        }
    });
}