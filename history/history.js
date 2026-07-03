let works = [];

function loadWorks() {
    return browser.storage.local.get(null).then(storedWorks =>
        Object.entries(storedWorks)
            .filter(([, workData]) => workData && workData.read)
            .map(([workId, workData]) => ({ id: workId, ...workData }))
    );
}

function getFilteredSortedWorks() {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    const sortMode = document.getElementById("sort-select").value;

    let result = works.filter(w =>
        (w.title ?? "").toLowerCase().includes(query) ||
        (w.author ?? "").toLowerCase().includes(query)
    );

    result.sort((a, b) => {
        switch (sortMode) {
            case "date-asc":
                return (a.lastSaved ?? 0) - (b.lastSaved ?? 0);
            case "title-asc":
                return (a.title ?? "").localeCompare(b.title ?? "");
            case "title-desc":
                return (b.title ?? "").localeCompare(a.title ?? "");
            case "words-desc":
                return (b.wordCount ?? 0) - (a.wordCount ?? 0);
            case "words-asc":
                return (a.wordCount ?? 0) - (b.wordCount ?? 0);
            default:
                return (b.lastSaved ?? 0) - (a.lastSaved ?? 0);
        }
    });

    return result;
}

function renderWork(workData, workId, currentTime) {
    const listItem = document.createElement("li");
    listItem.classList.add("work");

    const title = document.createElement("h3");
    title.classList.add("work-title");
    const workLink = document.createElement("a");
    const authorLink = document.createElement("a");

    workLink.href = `https://archiveofourown.org/works/${encodeURIComponent(workId)}`;
    workLink.textContent = workData.title ?? "Unknown Title";
    workLink.classList.add("work-link");
    title.appendChild(workLink);
    title.appendChild(document.createTextNode(" by "));
    authorLink.href = `https://archiveofourown.org/users/${encodeURIComponent(workData.author)}/`;
    authorLink.textContent = workData.author ?? "Unknown Author";
    authorLink.classList.add("work-author");
    title.appendChild(authorLink);
    listItem.appendChild(title);

    const fandom = document.createElement("ul");
    fandom.classList.add("work-fandom");
    if (workData.fandom) {
        workData.fandom.forEach(f => {
            const fandomItem = document.createElement("li");
            fandomItem.classList.add("tag-fandom");
            const fandomLink = document.createElement("a");
            fandomLink.href = `https://archiveofourown.org/tags/${encodeURIComponent(f)}/works`;
            fandomLink.textContent = f;
            fandomItem.appendChild(fandomLink);
            fandom.appendChild(fandomItem);
        });
    }
    listItem.appendChild(fandom);


    const tags = document.createElement("ul");
    tags.classList.add("work-tags");

    const tagCategories = ["warning", "relationship", "character", "freeform"];
    tagCategories.forEach(category => {
        if (workData[category]) {
            workData[category].forEach(tag => {
                const tagItem = document.createElement("li");
                tagItem.classList.add(`tag-${category}`);
                const tagLink = document.createElement("a");
                tagLink.href = `https://archiveofourown.org/tags/${encodeURIComponent(tag)}/works`;
                tagLink.textContent = tag;
                tagItem.appendChild(tagLink);
                tags.appendChild(tagItem);
            });
        }
    });

    listItem.appendChild(tags);

    const summary = document.createElement("p");
    summary.classList.add("work-summary");
    summary.textContent = workData.summary ?? "No summary available.";
    listItem.appendChild(summary);

    const meta = document.createElement("ul");
    meta.classList.add("work-meta");

    const languageItem = document.createElement("li");
    languageItem.textContent = `Language: ${workData.language ?? "Unknown"}`;
    meta.appendChild(languageItem);

    const wordsItem = document.createElement("li");
    wordsItem.textContent = `Words: ${workData.wordCount?.toLocaleString() ?? "Unknown"}`;
    meta.appendChild(wordsItem);

    const publishedItem = document.createElement("li");
    const publishedDate = new Date((workData.published ?? 0) * 1000);
    publishedItem.textContent = `Published: ${publishedDate.toLocaleDateString()}`;
    meta.appendChild(publishedItem);

    const lastSavedItem = document.createElement("li");
    const lastSavedDate = new Date((workData.lastSaved ?? 0) * 1000);
    lastSavedItem.textContent = `Last Saved: ${lastSavedDate.toLocaleString()} (${Math.floor((currentTime - (workData.lastSaved ?? 0)) / 86400)} days ago)`;
    meta.appendChild(lastSavedItem);



    listItem.appendChild(meta);

    return listItem;
}

function render() {
    const currentTime = Math.floor(Date.now() / 1000);
    const filtered = getFilteredSortedWorks();
    const list = document.getElementById("history-list");
    list.innerHTML = "";
    filtered.forEach(w => list.appendChild(renderWork(w, w.id, currentTime)));
}

function renderStats() {
    const totalWordCount = works.reduce((sum, w) => sum + (w.wordCount || 0), 0);
    document.getElementById("total-works-read").textContent = works.length;
    document.getElementById("total-word-count").textContent = totalWordCount.toLocaleString();
}

async function init() {
    works = await loadWorks();
    renderStats();
    render();

    document.getElementById("search-input").addEventListener("input", render);
    document.getElementById("sort-select").addEventListener("change", render);
}

init();