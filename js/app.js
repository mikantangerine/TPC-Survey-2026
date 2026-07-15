alert("app.js loaded");

async function loadResponses() {
    try {
        const response = await fetch("https://mikantangerine.github.io/TPC-Survey-2026/data/responses.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const responses = await response.json();

        console.log(responses);

        // Store globally if needed
        window.responses = responses;

        // Call your chart generation here
        // generateCharts(responses);

    } catch (err) {
        console.error("Failed to load responses.json", err);
    }
}

loadResponses();