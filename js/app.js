/* ===========================================
   TPC Survey Dashboard
   app.js
   =========================================== */

'use strict';

/* -------------------------------
   Configuration
--------------------------------*/

const DATA_URL = "data/responses.json";

const CATEGORY_KEYWORDS = {
    Demographics: [
        "age",
        "gender",
        "region",
        "member",
        "religious orientation",
        "academia",
        "citation",
        "training",
        "world",
        "live",
        "formal"
    ],

    Religion: [
        "religion",
        "god",
        "atheism",
        "theism",
        "religious"
    ],

    Politics: [
        "capitalism",
        "socialism",
        "political",
        "libertarian",
        "egalitarian",
        "communitarian",
        "dictator"
    ],

    AI: [
        "ai",
        "artificial intelligence"
    ],

    Philosophy: [
        "philosophy",
        "knowledge",
        "mind",
        "ethics",
        "metaphysics",
        "epistemology",
        "logic",
        "consciousness",
        "free will",
        "realism",
        "empiricism",
        "rationalism",
        "meaning of life",
        "probability",
        "trolley",
        "ship of theseus",
        "experience machine",
        "zombies",
        "philosopher"
    ]
};

/* -------------------------------
   Global State
--------------------------------*/

const state = {

    rawData: [],

    questions: [],

    charts: [],

    search: "",

    category: "All"

};

/* -------------------------------
   DOM
--------------------------------*/

const dashboard = document.getElementById("dashboard");

const spinner = document.getElementById("loadingSpinner");

const searchInput = document.getElementById("searchInput");

const categoryFilter = document.getElementById("categoryFilter");

const resetButton = document.getElementById("resetFilters");

const emptyMessage = document.getElementById("emptyState");

/* -------------------------------
   Initialize
--------------------------------*/

document.addEventListener("DOMContentLoaded", init);

async function init() {

    showSpinner(true);

    try {

        await loadSurvey();

        attachEvents();

        renderDashboard();

    }

    catch (err) {

        console.error(err);

        dashboard.innerHTML = `
            <div class="alert alert-danger">
                Failed to load responses.json
            </div>
        `;

    }

    finally {

        showSpinner(false);

    }

}

/* -------------------------------
   Load Survey
--------------------------------*/

async function loadSurvey() {

    const response = await fetch(DATA_URL);

    if (!response.ok) {

        throw new Error("Cannot load responses.json");

    }

    state.rawData = await response.json();

    analyzeSurvey();

}

/* -------------------------------
   Analyze Entire Survey
--------------------------------*/

function analyzeSurvey() {

    if (!state.rawData.length) return;

    const first = state.rawData[0];

    const questions = Object.keys(first);

    state.questions = questions.map(question => {

        return analyzeQuestion(question);

    });

}

/* -------------------------------
   Analyze One Question
--------------------------------*/

function analyzeQuestion(question) {

    const counts = {};

    let total = 0;

    let numeric = true;

    let multiSelect = false;

    const values = [];

    state.rawData.forEach(row => {

        let answer = row[question];

        if (
            answer === null ||
            answer === undefined ||
            answer === ""
        ) {
            return;
        }

        total++;

        values.push(answer);

        if (typeof answer === "string") {

            if (answer.includes(",")) {

                multiSelect = true;

            }

            if (isNaN(answer)) {

                numeric = false;

            }

        }

        else if (typeof answer !== "number") {

            numeric = false;

        }

    });

    if (multiSelect) {

        values.forEach(v => {

            v.split(",").forEach(item => {

                const option = item.trim();

                if (!option) return;

                counts[option] = (counts[option] || 0) + 1;

            });

        });

    }

    else {

        values.forEach(v => {

            counts[v] = (counts[v] || 0) + 1;

        });

    }

    const entries = Object.entries(counts)

        .sort((a, b) => b[1] - a[1]);

    return {

        question,

        category: detectCategory(question),

        total,

        numeric,

        multiSelect,

        counts,

        entries

    };

}

/* -------------------------------
   Category Detection
--------------------------------*/

function detectCategory(question) {

    const text = question.toLowerCase();

    for (const category in CATEGORY_KEYWORDS) {

        const words = CATEGORY_KEYWORDS[category];

        for (const word of words) {

            if (text.includes(word.toLowerCase())) {

                return category;

            }

        }

    }

    return "Other";

}

/* -------------------------------
   Events
--------------------------------*/

function attachEvents() {

    if (searchInput) {

        searchInput.addEventListener("input", e => {

            state.search = e.target.value.toLowerCase();

            renderDashboard();

        });

    }

    if (categoryFilter) {

        categoryFilter.addEventListener("change", e => {

            state.category = e.target.value;

            renderDashboard();

        });

    }

    if (resetButton) {

        resetButton.addEventListener("click", () => {

            state.search = "";

            state.category = "All";

            searchInput.value = "";

            categoryFilter.value = "All";

            renderDashboard();

        });

    }

}

/* -------------------------------
   Spinner
--------------------------------*/

function showSpinner(show) {

    if (!spinner) return;

    spinner.classList.toggle("d-none", !show);

}

/* -------------------------------
   Dashboard Rendering
--------------------------------*/

function renderDashboard() {

    destroyCharts();

    dashboard.innerHTML = "";

    let questions = state.questions.filter(q => {

        const searchMatch = q.question
            .toLowerCase()
            .includes(state.search);

        const categoryMatch =

            state.category === "All"

            ||

            q.category === state.category;

        return searchMatch && categoryMatch;

    });

    if (!questions.length) {

        emptyMessage.classList.remove("d-none");

        return;

    }

    emptyMessage.classList.add("d-none");

    questions.forEach((question, index) => {

        dashboard.appendChild(

            createQuestionCard(question, index)

        );

    });

}