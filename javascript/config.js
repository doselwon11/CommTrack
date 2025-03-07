const API_URL = "http://127.0.0.1:5000"; // local url

let countryDataCache = []; // store country data globally

function fetchCountries() {
    if (countryDataCache.length > 0) return Promise.resolve(countryDataCache); // use cached data if available

    return fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            countryDataCache = data; // Cache the data
            return data;
        })
        .catch(error => console.error("Error fetching country data:", error));
}
