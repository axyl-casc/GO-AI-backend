

function updateSiteState() {
    // tsumego / puzzle replacement
    for (const parent of document.querySelectorAll("body *")) {
        for (const child of parent.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                const pattern = /puzzle/gi; // Case-insensitive regular expression
                const replacement = "tsumego";
                const subNode = document.createElement("span");
                subNode.innerHTML = child.textContent.replace(pattern, replacement);
                parent.insertBefore(subNode, child);
                parent.removeChild(child);
            }
        }
    }
}
