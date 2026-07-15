alert("this is fetching responses.json");

async function loadResponses() {
    try {
        const response = await fetch("./data/responses.json");

        if (!response.ok) {
            throw new Error("Couldn't load responses.json");
        }

        const data = await response.json();

        generateCharts(data);

    } catch (err) {
        document.getElementById("dashboard").innerHTML =
            `<div class="alert alert-danger">${err.message}</div>`;
    }
}

function generateCharts(data) {

    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = "";

    const questions = Object.keys(data[0]);

    questions.forEach(question => {

        const counts = {};

        data.forEach(person => {

            let answer = person[question];

            if (!answer || answer === "") {
                answer = "No Response";
            }

            counts[answer] = (counts[answer] || 0) + 1;
        });

        const card = document.createElement("div");
        card.className = "card mb-4";

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${question}</h5>
                <canvas></canvas>
            </div>
        `;

        dashboard.appendChild(card);

        const ctx = card.querySelector("canvas");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    label: "Responses",
                    data: Object.values(counts)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

    });

}

loadResponses();