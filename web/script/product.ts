export {}


const main = document.querySelector<HTMLImageElement>('.main-img')
const imgs = document.querySelectorAll('.other-img')

imgs.forEach((img: HTMLImageElement) => {
    img.addEventListener('click', e => {
        main.src = img.src
    })
})
