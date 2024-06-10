export {}

const stickyButton = document.querySelector<HTMLElement>('a.main.hero-button')

stickyButton.addEventListener('mousemove', e => {
    const pos = stickyButton.getBoundingClientRect()
    const mx = e.clientX - pos.left - pos.width / 2
    const my = e.clientY - pos.top - pos.height / 2

    stickyButton.style.transform = `
        translate(${mx * 0.15}px ,${my * 0.3}px)
        rotate3d(${mx * -0.1}, ${my * -0.3}, 0, 12deg)
    `
})
stickyButton.addEventListener('mouseenter', e => {
    stickyButton.style.transition = ''
})
stickyButton.addEventListener('mouseleave', e => {
    // stickyButton.className = 'hero-btn main'
    stickyButton.style.transform = ''
    stickyButton.style.transition = '0.2s ease'
})
