// function to fetch countries
function fetchCountries() {
    return fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .catch(error => console.error("Error fetching countries:", error));
}

// function to load all countries for analysing trends
function loadCountriesForForms() {
    fetchCountries().then(data => {
        let countrySelects = document.querySelectorAll(".country-dropdown"); // Target all country dropdowns
        countrySelects.forEach(select => {
            select.innerHTML = ""; // Clear existing options

            let defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select a Country";
            select.appendChild(defaultOption);

            data.sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort countries alphabetically

            data.forEach(country => {
                let option = document.createElement("option");
                option.value = country.name.common;
                option.textContent = country.name.common;
                select.appendChild(option);
            });
        });
    });
}

// Load countries on page load
document.addEventListener("DOMContentLoaded", loadCountriesForForms);

// function to fetch trends with filters
function fetchIssueTrends() {
    let selectedCountry = document.getElementById("trendCountry").value;
    let selectedCategory = document.getElementById("trendCategory").value;

    let queryParams = [];
    if (selectedCountry) queryParams.push(`country=${encodeURIComponent(selectedCountry)}`);
    if (selectedCategory) queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);

    let apiUrl = `${API_URL}/get_issue_trends`;
    if (queryParams.length) apiUrl += "?" + queryParams.join("&");

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        console.log("API Response for Trends:", JSON.stringify(data, null, 2)); // Log the exact API response
        visualizeTrends(data);
    })
    .catch(error => console.error("Error fetching issue trends:", error));
}

// attach filter event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("trendCountry").addEventListener("change", fetchIssueTrends);
    document.getElementById("trendCategory").addEventListener("change", fetchIssueTrends);
});

// load trends on page load
document.addEventListener("DOMContentLoaded", fetchIssueTrends);
