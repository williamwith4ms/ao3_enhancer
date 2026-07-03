(function () {

    document.getElementById("clear-data").addEventListener("click", async () => {
        const confirmation = confirm("Are you sure you want to clear all data? This action cannot be undone.");
        if (confirmation) {
            await browser.storage.local.clear();
            alert("All data has been cleared.");
        }
    });

    document.getElementById("export-data").addEventListener("click", async () => {
        const storedWorks = await browser.storage.local.get(null);
        const dataStr = JSON.stringify(storedWorks, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "ao3_read_data.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    });
})();