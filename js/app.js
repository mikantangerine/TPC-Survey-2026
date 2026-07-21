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

    const colors = [
        "#4E79A7",
        "#59A14F",
        "#F28E2B",
        "#E15759",
        "#76B7B2",
        "#EDC948",
        "#B07AA1",
        "#FF9DA7",
        "#9C755F",
        "#BAB0AC"
    ];

    questions.forEach(question => {

        const counts = {};

        data.forEach(person => {

            let answer = person[question];

            if (!answer || answer.trim() === "") {
                answer = "No Response";
            }

            counts[answer] = (counts[answer] || 0) + 1;

        });

        // Sort responses by frequency
        let entries = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]);

        // Show top 3 answers, group the rest into "Other"
        if (entries.length > 4) {

            const top = entries.slice(0, 3);
            const other = entries.slice(3);

            const otherCount = other.reduce((sum, item) => sum + item[1], 0);

            entries = [
                ...top,
                ["Other", otherCount]
            ];

        }

        const labels = entries.map(item => item[0]);
        const values = entries.map(item => item[1]);

        const totalResponses = values.reduce((a, b) => a + b, 0);

        const percentages = values.map(value =>
            ((value / totalResponses) * 100).toFixed(1)
        );

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

                labels: labels,

                datasets: [{

                    data: percentages,

                    backgroundColor: labels.map(
                        (_, i) => colors[i % colors.length]
                    ),

                    borderRadius: 6,
                    borderSkipped: false

                }]

            },

            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return `${values[context.dataIndex]} responses (${percentages[context.dataIndex]}%)`;

                            }

                        }

                    }

                },

                scales: {

                    x: {

                        display: false,

                        grid: {
                            display: false
                        },

                        suggestedMax: 100

                    },

                    y: {

                        grid: {
                            display: false
                        }

                    }

                }

            }

        });

        // Give each chart some height
        ctx.style.height = `${Math.max(180, labels.length * 45)}px`;

    });

}

loadResponses();