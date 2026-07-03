import { loadWorks } from "../common/common.js";

async function init() {
    works = await loadWorks();
}

async function loadWorks() {
    const works = await browser.storage.local.get("works");
    return works.works || [];
}