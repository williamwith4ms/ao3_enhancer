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

    document.getElementById("import-data-merge").addEventListener("click", async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        const existingData = await browser.storage.local.get(null);
                        const mergedData = { ...existingData, ...importedData };
                        await browser.storage.local.set(mergedData);
                        alert("Data imported and merged successfully.");
                    } catch (error) {
                        alert("Failed to import data: " + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });

    document.getElementById("import-data-replace").addEventListener("click", async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
                const confirmation = confirm("Warning: This can result in data loss. Ensure you have a backup of your data before proceeding. Do you want to continue?");
                if (!confirmation) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        await browser.storage.local.clear();
                        await browser.storage.local.set(importedData);
                        alert("Data imported and replaced successfully.");
                    } catch (error) {
                        alert("Failed to import data: " + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });
})();