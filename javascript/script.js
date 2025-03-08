// ensure openlayers is loaded before initializing the maps
document.addEventListener("DOMContentLoaded", function () {
    if (typeof ol === 'undefined') {
        console.error('OpenLayers failed to load. check the script link.');
        return;
    }
    initMaps();
    loadCountriesForForms();
});

// function to initialize maps using openlayers
const mapInstances = {};
const heatmapSources = { 'infraMap': new ol.source.Vector(), 'socialMap': new ol.source.Vector() };

function initMaps() {
    mapInstances['infraMap'] = createMap('infraMap');
    mapInstances['socialMap'] = createMap('socialMap');
}

// function to create a heatmap layer
function createHeatmapLayer(source) {
    return new ol.layer.Heatmap({
        source: source,
        blur: 20, // how blurry the heat spots are
        radius: 10, // radius of influence for each issue
        weight: function (feature) {
            return 1; // set uniform weight for now (can be adjusted dynamically)
        }
    });
}

function initMaps() {
    mapInstances['infraMap'] = new ol.Map({
        target: 'infraMap',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            createHeatmapLayer(heatmapSources['infraMap'])
        ],
        view: new ol.View({ center: ol.proj.fromLonLat([0, 0]), zoom: 2 })
    });

    mapInstances['socialMap'] = new ol.Map({
        target: 'socialMap',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            createHeatmapLayer(heatmapSources['socialMap'])
        ],
        view: new ol.View({ center: ol.proj.fromLonLat([0, 0]), zoom: 2 })
    });
}

// function to add a report to the heatmap
function addReportToHeatmap(mapId, lon, lat) {
    if (!mapInstances[mapId]) {
        console.error("Map instance not found for:", mapId);
        return;
    }

    let feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    heatmapSources[mapId].addFeature(feature);
}

// function to load country list into dropdown
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

// function to fetch user's location and place a marker
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // reverse geocoding to get country name
            const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

            fetch(reverseGeocodeUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.address && data.address.country) {
                        document.getElementById("country").value = data.address.country;
                    }
                })
                .catch(error => console.error("Error fetching country from coordinates:", error));
            // update the location input field
            document.getElementById("infraLocation").value = `Lat: ${lat}, Lon: ${lon}`;
            // add a marker on the map
            addMarker("infraMap", lon, lat, "Current Location"); // Correct order: lon, lat
        }, error => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location. Ensure location services are enabled.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

let addressTimeout; // debounce timer
function searchAddress() {
    clearTimeout(addressTimeout); // clear previous timer
    addressTimeout = setTimeout(() => {
        const query = document.getElementById("infraLocation").value;
        const addressList = document.getElementById("addressSuggestions");
        if (!addressList) {
            console.error("Address suggestions element not found.");
            return;
        }
        if (query.length < 3) return; // only search when at least 3 characters are entered
        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                addressList.innerHTML = ""; // clear previous results
                if (data.length === 0) {
                    console.error("No results found.");
                    return;
                }
                data.forEach(location => {
                    let option = document.createElement("option");
                    option.value = location.display_name;
                    addressList.appendChild(option);
                });
                // automatically select the first result's country
                if (data[0].address && data[0].address.country) {
                    document.getElementById("country").value = data[0].address.country;
                }
            })
            .catch(error => console.error("Error fetching address suggestions:", error));
    }, 500); // debounce delay of 500ms
}

// function to handle form submissions
function handleFormSubmit(event, type) {
    event.preventDefault();
    let category, location;

    if (type === 'infrastructure') {
        category = document.getElementById("infraCategory").value;
        location = document.getElementById("infraLocation").value;
    } 
    else {
        category = document.getElementById("socialCategory").value;
        location = document.getElementById("city").value + ', ' + document.getElementById("region").value + ', ' + document.getElementById("country").value;
    }

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                addReportToHeatmap(type === 'infrastructure' ? "infraMap" : "socialMap", lon, lat);
            } 
            else {
                alert("Could not find location coordinates. Please enter a valid address.");
            }
        })
        .catch(error => console.error("Error fetching coordinates:", error));
}

// function for users to share report on social media
function shareReport() {
    let reportText = "I've reported an issue on CommTrack! Help make a change: ";
    let reportURL = window.location.href;

    let encodedText = encodeURIComponent(reportText);
    let encodedURL = encodeURIComponent(reportURL);

    let xURL = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedURL}`;
    let facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;

    let shareOptions = `
        <div style="margin-top:10px; padding:10px; background-color:#f4f4f4; border-radius:5px;">
            <strong>Share your report:</strong><br>
            <a href="${xURL}" target="_blank" style="margin-right: 10px;">
            <img src="https://cdn.iconscout.com/icon/free/png-512/free-twitter-x-icon-download-in-svg-png-gif-file-formats--logo-social-media-logos-pack-icons-7740647.png?f=webp&w=256" 
            alt="X logo" style="width:20px;height:20px;">X (Twitter)</a>
            <a href="${facebookURL}" target="_blank" style="margin-right: 10px;">
            <img src="https://cdn.iconscout.com/icon/free/png-512/free-facebook-logo-icon-download-in-svg-png-gif-file-formats--fb-new-color-social-media-logos-icons-1350125.png?f=webp&w=256" 
            alt="Facebook logo" style="width:20px;height:20px;">Facebook</a>
        </div>
    `;

    let shareDiv = document.getElementById("shareOptions");
    if (shareDiv) {
        shareDiv.innerHTML = shareOptions;
        shareDiv.style.display = "block"; // Ensure it's visible
    } else {
        console.error("Error: shareOptions div not found.");
    }
}

// ensure sharing options are hidden initially
document.addEventListener("DOMContentLoaded", function () {
    let shareDiv = document.getElementById("shareOptions");
    if (shareDiv) {
        shareDiv.style.display = "none";
    }
});

// show sharing options only after form submission
document.getElementById("infraForm").addEventListener("submit", function(event) {
    event.preventDefault();
    shareReport();
});

document.getElementById("socialForm").addEventListener("submit", function(event) {
    event.preventDefault();
    shareReport();
});

// attach event listeners to forms
document.getElementById("infraForm").addEventListener("submit", (event) => handleFormSubmit(event, "infrastructure"));
document.getElementById("socialForm").addEventListener("submit", (event) => handleFormSubmit(event, "social"));
document.getElementById("infraLocation").addEventListener("input", searchAddress);