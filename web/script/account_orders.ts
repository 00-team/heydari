for (let e of document.querySelectorAll('div.aUTpGc129q')) {
    if (!e.textContent) continue

    let d = new Date(parseInt(e.textContent.trim()) * 1e3)
    e.textContent = d.toLocaleDateString('fa-IR')
}
