(function () {
    const dataVersion = 2;

    if (window.location.pathname.match(/\/works\/[0-9]+/)) {
        workPage();
    } else if (window.location.pathname.match(/\/works\/search/)) {
        searchPage();
    }

    async function workPage() {
        const workId = window.location.pathname.match(/\/works\/([0-9]+)/)[1];
        injectReadButton(workId);
    }

    async function searchPage() {
        const blurbs = [...document.querySelectorAll("li.work.blurb.group[id^='work_']")];
        const ids = blurbs.map(b => b.id.match(/work_([0-9]+)/)[1]);
        const stored = await browser.storage.local.get(ids);

        blurbs.forEach((blurb, i) => {
            const workId = ids[i];
            if (stored[workId]?.read) {
                blurb.classList.add("ao3ext_read");
                const heading = blurb.querySelector(".heading");
                if (heading) {
                    const badge = document.createElement("span");
                    badge.textContent = "Read";
                    badge.classList.add("ao3ext_read_badge");
                    heading.appendChild(badge);
                }
            }
        });
    }

    async function injectReadButton(workId) {

        const actionsList = document.querySelector("#feedback ul.actions");

        if (!actionsList) {
            console.log("Actions list not found.");
            return;
        }

        const listItem = document.createElement("li");
        const readButton = document.createElement("button");

        readButton.textContent = await isRead(workId) ? "Unmark as Read" : "Mark as Read";

        listItem.appendChild(readButton);
        actionsList.appendChild(listItem);

        readButton.addEventListener("click", readButtonClickHandler);

        async function readButtonClickHandler() {
            const data = await getWorkInfo(workId);
            try {
                await browser.storage.local.set(data);
                readButton.textContent = data[workId].read ? "Unmark as Read" : "Mark as Read";
            } catch (err) {
                console.error("Failed to save read status:", err);
            }
        }

        async function getWorkInfo(workId) {
            const read = await isRead(workId);
            let data = { [workId]: { dataVersion: dataVersion, read: !read, workName: undefined, wordCount: undefined } };

            const workContainer = document.querySelector(".work.meta.group") || document;

            const workNameElement = workContainer.querySelector("h2.title.heading");
            if (workNameElement) {
                data[workId].workName = workNameElement.textContent.trim();
            }

            const wordCountElement = workContainer.querySelector("dd.words");
            if (wordCountElement) {
                data[workId].wordCount = parseInt(wordCountElement.textContent.replace(/,/g, ''));
            }

            return data;
        }
    }

    async function isRead(workId) {
        const response = await browser.storage.local.get(workId);
        if (!response[workId]) {
            return false;
        }
        return response[workId].read;
    }

})();