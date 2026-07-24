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


        let hiddenAnswers = [];


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
                <small class="text-muted">
                    Click "Other" to view all options
                </small>
            </div>
        `;


        dashboard.appendChild(card);


        const ctx = card.querySelector("canvas");


        const chart = new Chart(ctx, {

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
                        }
                    }

                }

            }

        });



        ctx.onclick = function(event) {


            const points = chart.getElementsAtEventForMode(
                event,
                "nearest",
                {
                    intersect:true
                },
                true
            );


            if (!points.length) return;


            const index = points[0].index;


            if (labels[index] === "Other" && hiddenAnswers.length) {


                labels.splice(
                    index,
                    1,
                    ...hiddenAnswers.map(x => x[0])
                );


                values.splice(
                    index,
                    1,
                    ...hiddenAnswers.map(x => x[1])
                );


                percentages = values.map(v =>
                    ((v / values.reduce((a,b)=>a+b,0)) * 100).toFixed(1)
                );


                chart.data.labels = labels;

                chart.data.datasets[0].data = percentages;


                chart.data.datasets[0].backgroundColor =
                    labels.map(
                        (_, i) => colors[i % colors.length]
                    );


                chart.options.plugins.datalabels.formatter =
                    function(value){
                        return value + "%";
                    };


                chart.update();

            }

        };


    });

}


loadResponses();



const themes = [
    "light",
    "dark",
    "pink"
];


let currentTheme = localStorage.getItem("theme") || "light";


applyTheme(currentTheme);



const themeButton = document.getElementById("themeToggle");


if (themeButton) {


    updateThemeButton();


    themeButton.addEventListener("click", () => {


        const currentIndex = themes.indexOf(currentTheme);


        currentTheme =
            themes[(currentIndex + 1) % themes.length];


        applyTheme(currentTheme);


        localStorage.setItem(
            "theme",
            currentTheme
        );


        updateThemeButton();


    });


}



function applyTheme(theme) {


    document.body.classList.remove(
        "theme-dark",
        "theme-pink"
    );


    if (theme === "dark") {

        document.body.classList.add(
            "theme-dark"
        );

    }


    if (theme === "pink") {

        document.body.classList.add(
            "theme-pink"
        );

    }

}



function updateThemeButton() {


    if (currentTheme === "light") {

        themeButton.textContent = "🌞";

    }


    if (currentTheme === "dark") {

        themeButton.textContent = "🌙";

    }


    if (currentTheme === "pink") {

        themeButton.textContent = "🌸";

    }

}