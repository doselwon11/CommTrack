// function to fetch the geoname id and then fetch states/regions
document.getElementById("country").addEventListener("change", function () {
    const country = this.value;
    const regionSelect = document.getElementById("region");
    regionSelect.innerHTML = ""; // clear previous options

    // predefined state lists for the u.s. and canada
    const predefinedRegions = {
        "United States": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
        "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
    };

    if (predefinedRegions[country]) {
        predefinedRegions[country].forEach(region => {
            let option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    } else {
        // step 1: fetch the geoname id of the country
        fetch(`https://secure.geonames.org/searchJSON?name=${country}&featureClass=A&username=ddtn722`)
            .then(response => response.json())
            .then(data => {
                if (data.geonames.length > 0) {
                    let geonameId = data.geonames[0].geonameId;
                    // step 2: use the geoname id to fetch states/regions
                    return fetch(`https://secure.geonames.org/childrenJSON?geonameId=${geonameId}&username=ddtn722`);
                } else {
                    throw new Error('no geoname id found for this country.');
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.geonames) {
                    data.geonames.forEach(state => {
                        let option = document.createElement("option");
                        option.value = state.name;
                        option.textContent = state.name;
                        regionSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('error fetching regions:', error));
    }
});