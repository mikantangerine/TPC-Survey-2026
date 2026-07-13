// =========================================
// 2026 TPC Survey Dashboard
// app.js
// =========================================

// --------------------------------------------------
// SAMPLE DATA
// Replace this with your actual survey data later.
// --------------------------------------------------

const surveyData = [

    {
        category: "Demographics",
        question: "Gender",
        chart: "pie",
        labels: [
            "Male",
            "Female",
            "Other"
        ],
        values: [
            61,
            36,
            3
        ]
    },

    {
        category: "Religion",
        question: "Religious Affiliation",
        chart: "doughnut",
        labels: [
            "Christian",
            "Atheist",
            "Muslim",
            "Hindu",
            "Other"
        ],
        values: [
            42,
            27,
            13,
            9,
            9
        ]
    },

    {
        category: "Politics",
        question: "Political Orientation",
        chart: "bar",
        labels: [
            "Left",
            "Centre",
            "Right"
        ],
        values: [
            34,
            41,
            25
        ]
    },

    {
        category: "AI",
        question: "Should AI have rights?",
        chart: "bar",
        labels: [
            "Yes",
            "No",
            "Unsure"
        ],
        values: [
            29,
            45,
            26
        ]
    }

];

// --------------------------------------------------
// DOM
// --------------------------------------------------

const dashboard = document.getElementById("dashboard");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const resetButton = document.getElementById("resetFilters");

// --------------------------------------------------
// Populate Categories
// --------------------------------------------------

const categories = [...new Set(surveyData.map(item => item.category))];

categories.forEach(category => {

    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.appendChild(option);

});

// --------------------------------------------------
// Render Dashboard
// --------------------------------------------------

function renderDashboard(data) {

    dashboard.innerHTML = "";

    data.forEach((item, index) => {

        const card = document.createElement("div");

        card.className = "chart-card";

        card.innerHTML = `

            <div class="chart-header">

                <h3>${item.question}</h3>

                <small>${item.category}</small>

            </div>

            <div class="chart-body">

                <canvas id="chart${index}"></canvas>

            </div>

        `;

        dashboard.appendChild(card);

        createChart(item, index);

    });

}

// --------------------------------------------------
// Create Chart
// --------------------------------------------------

function createChart(item, index) {

    const ctx = document
        .getElementById(`chart${index}`)
        .getContext("2d");

    new Chart(ctx, {

        type: item.chart,

        data: {

            labels: item.labels,

            datasets: [{

                data: item.values,

                backgroundColor: [

                    "#3B82F6",
                    "#10B981",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#14B8A6",
                    "#F97316"

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// --------------------------------------------------
// Search
// --------------------------------------------------

function applyFilters() {

    const search = searchBox.value.toLowerCase();

    const category = categoryFilter.value;

    const filtered = surveyData.filter(item => {

        const matchesSearch =
            item.question.toLowerCase().includes(search);

        const matchesCategory =
            category === "All Categories"
            || item.category === category;

        return matchesSearch && matchesCategory;

    });

    renderDashboard(filtered);

}

// --------------------------------------------------
// Events
// --------------------------------------------------

searchBox.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

resetButton.addEventListener("click", () => {

    searchBox.value = "";

    categoryFilter.value = "All Categories";

    renderDashboard(surveyData);

});

// --------------------------------------------------
// Initial Render
// --------------------------------------------------

renderDashboard(surveyData);