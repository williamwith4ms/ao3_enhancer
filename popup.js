(async function() {
    const storedWorks = await browser.storage.local.get(null);

    let totalWordCount = 0;
    let totalWorksRead = 0;

    const readWorks = Object.entries(storedWorks).filter(([, workData]) => workData && workData.read);

    for (const [workId, workData] of readWorks) {
        totalWordCount += workData.wordCount || 0;
        totalWorksRead++;
    }

    document.getElementById("total-works-read").textContent = totalWorksRead;
    document.getElementById("total-word-count").textContent = totalWordCount.toLocaleString();

    document.getElementById("open-history").addEventListener("click", () => {
        browser.tabs.create({ url: browser.runtime.getURL("history.html") });
    });
})();