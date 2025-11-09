for (let e of document.querySelectorAll('div.aUTpGc129q')) {
    let d = new Date(parseInt(e.textContent.trim()) * 1e3)
    e.textContent = d.toLocaleDateString('fa-IR')
}
