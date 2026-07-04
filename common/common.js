export function loadWorks() {
    return browser.storage.local.get(null).then(storedWorks =>
        Object.entries(storedWorks)
            .filter(([, workData]) => workData && workData.read)
            .map(([workId, workData]) => ({ id: workId, ...workData }))
    );
}