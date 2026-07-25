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

const multiSelectQuestions = [
    "Which fields of non-philosophical study or formal knowledge would you say that you have at least undergraduate level knowledge in?",
    "In what ways do you engage in philosophy in your daily life?",
    "Which fields of Philosophy do you consider to be your strengths?\n\nThis list is non-exhaustive. Enter your specific subfield into Others.",
    "Which areas of philosophy have you actively engaged with/are you most interested in?"
];


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


       const isMultiSelect = multiSelectQuestions.includes(question);

data.forEach(person => {

    let answer = person[question];

    if (answer === null || answer === undefined || answer === "") {
        counts["No Response"] = (counts["No Response"] || 0) + 1;
        return;
    }

    answer = String(answer);

    if (isMultiSelect) {
        const parts = answer.split(",").map(p => p.trim()).filter(p => p.length > 0);
        parts.forEach(part => {
            counts[part] = (counts[part] || 0) + 1;
        });
    } else {
        counts[answer] = (counts[answer] || 0) + 1;
    }

});


        let entries = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]);


        let hiddenAnswers = [];

        let isExpanded = false;
        const fullEntries = entries;


        if (entries.length > 4) {

            hiddenAnswers = entries.slice(3);

            const otherTotal = hiddenAnswers
                .reduce((sum, item) => sum + item[1], 0);


            entries = [
                ...entries.slice(0, 3),
                ["Other", otherTotal]
            ];

        }


        let labels = entries.map(e => e[0]);
        let values = entries.map(e => e[1]);


        let total = values.reduce((a, b) => a + b, 0);


        let percentages = values.map(v =>
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
                    <small class="toggle-text text-muted" style="cursor:pointer; text-decoration:underline;">
                        Click "Other" to view all options
                    </small>
            </div>
        `;


        dashboard.appendChild(card);


        const ctx = card.querySelector("canvas");
        const heightDiv = card.querySelector(".card-body > div");
        const toggleText = card.querySelector(".toggle-text");

        const chart = new Chart(ctx, {

            type: "bar",


            data: {

                labels: labels,

                datasets: [{

                    data: percentages,

                    backgroundColor: labels.map(
                        (_, i) => colors[i % colors.length]
                    ),

                    borderRadius: 8,
                    categoryPercentage: 0.7,
                     barPercentage: 0.9

                }]

            },


            options: {

                indexAxis: "y",

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {
                        display:false
                    },


                    datalabels: {

                        color:"#ffffff",

                        font:{
                            weight:"bold"
                        },


                        formatter:function(value){
                            return value + "%";
                        }

                    },


                    tooltip: {

                        callbacks: {

                            label:function(context){

                                return `${values[context.dataIndex]} responses (${percentages[context.dataIndex]}%)`;

                            }

                        }

                    }

                },


                scales: {

    x:{
        display:false,
        max:100
    },


    y:{
        grid:{
            display:false
        },
        ticks: {
            autoSkip: false,
            callback: function(value) {
                const label = this.getLabelForValue(value);
                const maxCharsPerLine = 20;

                if (label.length <= maxCharsPerLine) {
                    return label;
                }

                const words = label.split(' ');
                const lines = [];
                let currentLine = '';

                words.forEach(word => {
                    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
                        lines.push(currentLine.trim());
                        currentLine = word;
                    } else {
                        currentLine = (currentLine + ' ' + word).trim();
                    }
                });

                if (currentLine) lines.push(currentLine);

                return lines;
            }
        },
        afterFit: function(scale) {
        scale.width = Math.max(scale.width, 150);
    }
    }

}

            }

        });





ctx.onclick = function(event) {

    const points = chart.getElementsAtEventForMode(
        event, "nearest", { intersect: true }, true
    );

    if (!points.length) return;

    const index = points[0].index;

    const clickedOther = labels[index] === "Other";

    if (!clickedOther && !isExpanded) return;

    isExpanded = !isExpanded;

    let newEntries;
    if (isExpanded) {
        newEntries = fullEntries;
    } else {
        newEntries = [
            ...fullEntries.slice(0, 3),
            ["Other", hiddenAnswers.reduce((sum, item) => sum + item[1], 0)]
        ];
    }

    labels = newEntries.map(e => e[0]);
    values = newEntries.map(e => e[1]);
    percentages = values.map(v =>
        ((v / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    );

    chart.data.labels = labels;
    chart.data.datasets[0].data = percentages;
    chart.data.datasets[0].backgroundColor = labels.map((_, i) => colors[i % colors.length]);

    const newHeight = Math.max(labels.length * 55, 220);
    heightDiv.style.height = `${newHeight}px`;

    requestAnimationFrame(() => {
        chart.resize(heightDiv.clientWidth, newHeight);
        chart.update();
    });
    toggleText.textContent = isExpanded
        ? 'Click any bar to collapse'
        : 'Click "Other" to view all options';
};


    });

}


loadResponses();

