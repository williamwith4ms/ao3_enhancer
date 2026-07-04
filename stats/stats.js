import { loadWorks } from "../common/common.js";

let works = [];
let currentMode = "freeform";

async function init() {
    works = await loadWorks();
    renderStats(works);
    renderTagList(works, currentMode);
    setupToggle();
    setupLimitInput();
}

function renderStats(works) {
    const totalWordCount = works.reduce((sum, w) => sum + (w.wordCount || 0), 0);
    const totalWorksRead = works.length;
    const averageWordCount = totalWorksRead > 0 ? Math.floor(totalWordCount / totalWorksRead) : 0;
    const totalFandoms = new Set(works.flatMap(w => w.fandom)).size;

    document.getElementById("total-works-read").textContent = totalWorksRead;
    document.getElementById("total-word-count").textContent = totalWordCount.toLocaleString();
    document.getElementById("average-word-count").textContent = averageWordCount.toLocaleString();
    document.getElementById("total-fandoms").textContent = totalFandoms;
}

function renderTagList(works, field) {
    const tagList = document.getElementById("top-list");
    const resultLimitInput = document.getElementById("result-limit");
    const resultLimit = parseInt(resultLimitInput.value, 10) || 15;
    tagList.innerHTML = "";

    const tagCounts = {};
    works.forEach(w => {
        (w[field] || []).forEach(value => {
            tagCounts[value] = (tagCounts[value] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTags.length === 0) return;

    sortedTags.slice(0, resultLimit).forEach(([tag, count]) => {
        const li = document.createElement("li");
        li.classList.add("tag-item");

        const tagSpan = document.createElement("span");
        tagSpan.textContent = tag;
        tagSpan.classList.add("tag-name");

        const bar = document.createElement("progress");
        bar.classList.add("tag-bar");
        bar.setAttribute("max", sortedTags[0][1]);
        bar.setAttribute("value", count);

        const countSpan = document.createElement("span");
        countSpan.textContent = count.toLocaleString();
        countSpan.classList.add("tag-count");

        li.appendChild(tagSpan);
        li.appendChild(bar);
        li.appendChild(countSpan);
        tagList.appendChild(li);
    });
}

function setupToggle() {
    const buttons = document.querySelectorAll(".toggle-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentMode = btn.dataset.mode;
            renderTagList(works, currentMode);
        });
    });
}

function setupLimitInput() {
    const limitInput = document.getElementById("result-limit");
    limitInput.addEventListener("input", () => {
        renderTagList(works, currentMode);
    });
}

init();