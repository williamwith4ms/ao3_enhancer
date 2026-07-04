export function loadWorks() {
    return browser.storage.local.get(null).then(storedWorks =>
        Object.entries(storedWorks)
            .filter(([, workData]) => workData && workData.read)
            .map(([workId, workData]) => ({ id: workId, ...workData }))
    );
}

export function ao3UriEncode(str) {
    if (str == null) return "";

    // & -> *a*
    // / -> *s*
    // ? -> *q*
    // # -> *h*
    // % -> *p*
    return String(str).replace(/&/g, '*a*')
        .replace(/\//g, '*s*')
        .replace(/\?/g, '*q*')
        .replace(/#/g, '*h*')
        .replace(/%/g, '*p*');
}

export function ao3UriDecode(str) {
    if (str == null) return "";

    return String(str).replace(/\*a\*/g, '&')
        .replace(/\*s\*/g, '/')
        .replace(/\*q\*/g, '?')
        .replace(/\*h\*/g, '#')
        .replace(/\*p\*/g, '%');
}