export {}

const dropdown = document.querySelector<HTMLElement>('.dropdown')
const dropactive = document.querySelector<HTMLElement>('.drop-active')
const links = document.querySelectorAll('.drop-link')

const activeSpan = document.querySelector<HTMLElement>('span.drop-active-text')

function toggleDropdown() {
    if (dropdown.classList.contains('show')) {
        dropdown.className = dropdown.className.replace(' show', '')
    } else {
        dropdown.className += ' show'
    }
}

dropactive.addEventListener('click', () => {
    toggleDropdown()
})

links.forEach((link: HTMLElement, index) => {
    link.addEventListener('mouseover', () => {
        dropdown.style.setProperty('--top', `${3.5 * index}em`)
    })
    link.addEventListener('click', () => {
        toggleDropdown()

        activeSpan.innerText = link.innerText
    })
})
