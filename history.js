(async function() {
    const storedWorks = await browser.storage.local.get(null);
    const readWorks = Object.entries(storedWorks).filter(([, workData]) => workData && workData.read);

    let totalWordCount = 0;
    let totalWorksRead = 0;

    for (const [workId, workData] of readWorks) {
        totalWordCount += workData.wordCount || 0;
        totalWorksRead++;
    }

    // document.getElementById("total-works-read").textContent = totalWorksRead;
    // document.getElementById("total-word-count").textContent = totalWordCount.toLocaleString();

    readWorks.forEach(([workId, workData]) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = `https://archiveofourown.org/works/${workId}`;
        link.textContent = workData.workName || `Work ${workId}`;
        link.target = "_blank";
        link.rel = "noopener";
        listItem.appendChild(link);
        document.getElementById("history-list").appendChild(listItem);
    });
})();