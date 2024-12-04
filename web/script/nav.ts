export {}

const navContainer = document.querySelector<HTMLElement>('nav.nav-container')
const navWrapper = navContainer.querySelector<HTMLElement>('.nav-wrapper')
const smallScreen = navWrapper.querySelector<HTMLElement>('.just-for-small')
const openSmallNav = document.querySelector<HTMLElement>('.small-open')
const closeSmallNav = document.querySelector<HTMLElement>('.small-close')
const logoContainer = document.querySelector<HTMLElement>('.nav-logo-container')

let scrolled = false
let isSmall = false
let openSmall = false

document.addEventListener('DOMContentLoaded', () => {
    if (innerWidth < 768) isSmall = true
    render()

    window.onresize = () => {
        if (innerWidth < 768) isSmall = true
        else isSmall = false
        render()
    }

    window.onscroll = () => {
        if (scrollY > 10 && !scrolled) {
            scrolled = true
            render()
        } else if (scrollY <= 10 && scrolled) {
            scrolled = false
            render()
        }
    }
})

openSmallNav.addEventListener('click', () => {
    openSmall = true
    smallScreen.style.transition = ' transform 0.5s ease-in-out'

    if (!logoContainer.classList.contains('clicked')) {
        logoContainer.className += ' clicked'
    }

    render()
})
closeSmallNav.addEventListener('click', () => {
    openSmall = false
    smallScreen.style.transition = ' transform 0.5s ease-in-out'

    if (!logoContainer.classList.contains('clicked')) {
        logoContainer.className += ' clicked'
    }

    render()
})

function render() {
    let addedClass = `${scrolled ? 'scrolled' : ''} ${
        isSmall ? 'small' : 'big'
    } ${openSmall ? 'opensmall' : ''}`

    navContainer.className = `nav-container ${addedClass}`
}
