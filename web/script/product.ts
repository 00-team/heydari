export {}

const main = document.querySelector<HTMLImageElement>('.main-img')
const imgs = document.querySelectorAll('.other-img')

imgs.forEach((img: HTMLImageElement) => {
    img.addEventListener('click', e => {
        main.src = img.src
    })
})

const aboutProduct = document.querySelector<HTMLElement>('.product-about')

const aboutSelect = aboutProduct.querySelector<HTMLElement>('.about-select')
const aboutWrapper = aboutProduct.querySelector<HTMLElement>('.about-wrapper')

const InfoButton = aboutSelect.querySelector<HTMLButtonElement>('button.info')
const AboutButton = aboutSelect.querySelector<HTMLButtonElement>('button.about')

const aboutSection = aboutWrapper.querySelector<HTMLElement>('.about')
const infoSection = aboutWrapper.querySelector<HTMLElement>('.info')

const aboutText = aboutSection.querySelector<HTMLElement>('p')
const infoTable = infoSection.querySelector<HTMLTableElement>('table')

let activeSection: 'info' | 'about' = 'about'

function update() {
    if (activeSection === 'about') {
        AboutButton.className = 'title_small about active'
        InfoButton.className = 'title_small info'

        aboutSection.className = 'about title_smaller active'
        infoSection.className = 'info title_smaller'

        aboutWrapper.style.height = `calc(${aboutText.getBoundingClientRect().height}px + 5rem)`
    } else {
        AboutButton.className = 'title_small about '
        InfoButton.className = 'title_small info active'

        aboutSection.className = 'about title_smaller '
        infoSection.className = 'info title_smaller active'

        aboutWrapper.style.height = `calc(${infoTable.getBoundingClientRect().height}px + 5rem)`
    }
}

update()

InfoButton.addEventListener('click', () => {
    activeSection = 'info'
    update()
})
AboutButton.addEventListener('click', () => {
    activeSection = 'about'
    update()
})
