export {}

const navContainer = document.querySelector('nav.nav-container')
const openSmallNav = document.querySelector('.small-open')
const closeSmallNav = document.querySelector('.small-close')

let scrolled = false
let isSmall = false
let openSmall = false

document.addEventListener('DOMContentLoaded', () => {
    if (innerWidth < 1024) isSmall = true
    render()

    window.onresize = () => {
        if (innerWidth < 1024) isSmall = true
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
    render()
})
closeSmallNav.addEventListener('click', () => {
    openSmall = false
    render()
})

function render() {
    let addedClass = `${scrolled ? 'scrolled' : ''} ${
        isSmall ? 'small' : 'big'
    } ${openSmall ? 'opensmall' : ''}`

    navContainer.className = `nav-container ${addedClass}`
}
