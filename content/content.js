(function () {
    const dataVersion = 1;

    if (window.location.pathname.match(/\/works\/[0-9]+/)) {
        workPage();
    } else if (window.location.pathname.match(/\/works\/search/)) {
        searchPage();
    } else if (window.location.pathname.match(/\/tags\/[^/]+/)) {
        tagPage();
    }

    async function workPage() {
        const workId = window.location.pathname.match(/\/works\/([0-9]+)/)[1];
        injectReadButton(workId);
    }

    async function tagPage() {
        const tagName = decodeURIComponent(window.location.pathname.match(/\/tags\/([^/]+)/)[1]);
        injectBlockButton(tagName);
    }

    async function injectBlockButton(tagName) {
        const nav = document.querySelector("#main .user.navigation.actions");
        if (!nav) {
            console.log("Navigation actions not found.");
            return;
        }

        const listItem = document.createElement("li");
        const blockButton = document.createElement("button");
        if (await isBlocked(tagName)) {
            blockButton.textContent = "Unblock Tag";
        } else {
            blockButton.textContent = "Block Tag";
        }



        listItem.appendChild(blockButton);
        nav.appendChild(listItem);

        blockButton.addEventListener("click", async () => {
            const blockedTags = await browser.storage.local.get("blockedTags");
            let blockedTagsArray = blockedTags.blockedTags || [];

            if (await isBlocked(tagName)) {
                try {
                    blockedTagsArray = blockedTagsArray.filter(tag => tag !== tagName);
                    await browser.storage.local.set({ blockedTags: blockedTagsArray });
                    blockButton.textContent = "Block Tag";
                } catch (error) {
                    console.error("Failed to unblock tag:", error);
                }
            } else {
                try {
                    blockedTagsArray.push(tagName);
                    await browser.storage.local.set({ blockedTags: blockedTagsArray });
                    blockButton.textContent = "Unblock Tag";
                } catch (error) {
                    console.error("Failed to block tag:", error);
                }
            }
        });
    }

    async function isBlocked(tagName) {
        console.log("Checking if tag is blocked:", tagName);
        const blockedTags = await browser.storage.local.get("blockedTags");
        const blockedTagsArray = blockedTags.blockedTags || [];
        console.log("Blocked tags from storage:", blockedTagsArray);
        console.log("Is the tag blocked?", blockedTagsArray.includes(tagName));
        return blockedTagsArray.includes(tagName);
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

        // tag blocking, read from the block tags in storage and blur works out with a button top unhide them
        const blockedTags = await loadBlockedTags();
        if (blockedTags) {
            blurbs.forEach((blurb, i) => {
                const tagElements = [...blurb.querySelectorAll("ul.tags li a")];

                let hasBlockedTag = false;
                for (const tagElement of tagElements) {
                    const tagText = tagElement.textContent.trim();
                    if (blockedTags.has(tagText)) {
                        hasBlockedTag = true;
                        tagElement.classList.add("blocked-tag");
                    }
                }

                if (hasBlockedTag) {
                    const blurContainer = document.createElement("div");
                    blurContainer.classList.add("ao3ext_blur_container");
                    blurb.before(blurContainer);
                    blurb.classList.add("ao3ext_blurred");
                    blurContainer.appendChild(blurb);
                    const unhideButton = document.createElement("button");
                    unhideButton.textContent = "Unhide Work";
                    unhideButton.classList.add("ao3ext_unhide_button");

                    unhideButton.addEventListener("click", () => {
                        blurContainer.before(blurb);
                        blurContainer.remove();
                        blurb.classList.remove("ao3ext_blurred");
                    }); blurContainer.appendChild(unhideButton);
                }
            });
        }
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
            let data = {
                [workId]: {
                    dataVersion: dataVersion,
                    read: !read,
                    title: undefined,
                    author: undefined,
                    wordCount: undefined,
                    lastSaved: undefined,
                }
            };

            const prefaceContainer = document.querySelector(".preface.group") || document;
            const workNameElement = prefaceContainer.querySelector("h2.title.heading");
            const authorElement = prefaceContainer.querySelector("h3.byline.heading a[rel='author']");
            const summaryElement = prefaceContainer.querySelector("div.summary blockquote.userstuff");

            if (workNameElement) data[workId].title = workNameElement.textContent.trim();
            if (authorElement) data[workId].author = authorElement.textContent.trim();
            if (summaryElement) data[workId].summary = summaryElement.textContent.trim();

            const workContainer = document.querySelector(".work.meta.group") || document;
            const saveTime = Math.floor(Date.now() / 1000);

            const wordCountElement = workContainer.querySelector("dd.words");
            const ratingElement = workContainer.querySelector("dd.rating");
            const warningElement = workContainer.querySelector("dd.warning");
            const fandomElement = workContainer.querySelector("dd.fandom");
            const characterElement = workContainer.querySelector("dd.character");
            const relationshipElement = workContainer.querySelector("dd.relationship");
            const freeformElement = workContainer.querySelector("dd.freeform");
            const languageElement = workContainer.querySelector("dd.language");
            const publishedElement = workContainer.querySelector("dd.published");

            const getTagArray = (dd) =>
                dd ? [...dd.querySelectorAll("a.tag")].map(el => el.textContent.trim()) : [];

            if (wordCountElement) {
                data[workId].wordCount = parseInt(wordCountElement.textContent.replace(/,/g, ''));
            }
            if (languageElement) {
                data[workId].language = languageElement.textContent.trim();
            }

            data[workId].rating = getTagArray(ratingElement)[0] ?? null;
            data[workId].warning = getTagArray(warningElement);
            data[workId].fandom = getTagArray(fandomElement);
            data[workId].character = getTagArray(characterElement);
            data[workId].relationship = getTagArray(relationshipElement);
            data[workId].freeform = getTagArray(freeformElement);

            if (publishedElement) {
                data[workId].published = new Date(publishedElement.textContent.trim()).getTime() / 1000;
            }

            data[workId].lastSaved = saveTime;
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

    async function loadBlockedTags() {
        const stored = await browser.storage.local.get("blockedTags");

        // i dont want to mess with module imports and scope and how that works with content.js
        // this is definitely bad practice but it works and ill fix it later
        // TODO: use the ao3UriDecode function from common.js
        stored.blockedTags = stored.blockedTags?.map(tag => tag.replace(/\*a\*/g, '&')
            .replace(/\*s\*/g, '/')
            .replace(/\*q\*/g, '?')
            .replace(/\*h\*/g, '#')
            .replace(/\*p\*/g, '%')
            .replace(/\*d\*/g, '.'));

        return new Set(stored?.blockedTags ?? []);
    }

})();