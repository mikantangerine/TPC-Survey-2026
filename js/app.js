

Chart.register(ChartDataLabels);

async function loadResponses() {
    try {

        const [responseResult, questionResult] = await Promise.all([
            fetch("./data/responses.json"),
            fetch("./data/questions.json")
        ]);

        if (!responseResult.ok) {
            throw new Error("Couldn't load responses.json");
        }

        if (!questionResult.ok) {
            throw new Error("Couldn't load questions.json");
        }

        const data = await responseResult.json();
        const questionGroups = await questionResult.json();

        generateCharts(data, questionGroups);

    } catch (err) {

        document.getElementById("dashboard").innerHTML =
            `<div class="alert alert-danger">${err.message}</div>`;

    }
}

function generateCharts(data, questionGroups) {

    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = "";

    const questions = questionGroups[pageGroup] || [];

    const respondentCount = document.getElementById("respondentCount");
    if (respondentCount) {
        respondentCount.textContent = data.length;
    }

    const questionCount = document.getElementById("questionCount");
    if (questionCount) {
        questionCount.textContent = questions.length;
    }

    const colors = [
        "#4E79A7",
        "#59A14F",
        "#F28E2B",
        "#E15759",
        "#76B7B2"
    ];

    questions.forEach(question => {

        const counts = {};

        data.forEach(person => {

            let answer = person[question];

            if (answer === null || answer === undefined || answer === "") {
                answer = "No Response";
            } else {
                answer = String(answer);
            }

            counts[answer] = (counts[answer] || 0) + 1;

        });

        let entries = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]);

        if (entries.length > 4) {

            const top = entries.slice(0, 3);

            const otherTotal = entries
                .slice(3)
                .reduce((sum, item) => sum + item[1], 0);

            entries = [
                ...top,
                ["Other", otherTotal]
            ];

        }

        const labels = entries.map(e => e[0]);
        const values = entries.map(e => e[1]);

        const total = values.reduce((a, b) => a + b, 0);

        const percentages = values.map(v =>
            ((v / total) * 100).toFixed(1)
        );

        const card = document.createElement("div");

        card.className = "card mb-4";

        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${question}</h5>
                <div style="height:${Math.max(labels.length * 55, 220)}px">
                    <canvas></canvas>
                </div>
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

                    borderRadius: 8

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

                    datalabels: {

                        color: "#ffffff",

                        font: {
                            weight: "bold"
                        },

                        formatter: function(value) {
                            return value + "%";
                        }

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
                        max: 100
                    },

                    y: {
                        grid: {
                            display: false
                        }
                    }

                }

            }

        });

    });

}

loadResponses();