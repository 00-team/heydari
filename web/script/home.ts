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

let heroWrapper = document.querySelector<HTMLElement>('.hero-wrapper')
let htmlWord = heroWrapper.querySelector<HTMLElement>('span.typer-word')
let aTags = heroWrapper.querySelectorAll('.hero-img-container a')

type WORD = {
    w: string
    link: string
    id: string
}
const words: WORD[] = [
    {
        w: 'اداری',
        link: 'https://heydari-mi.com/products/Office-Chair',
        id: 'office',
    },
    {
        w: 'خانگی',

        link: 'https://heydari-mi.com/products/savin-chair-5',
        id: 'home',
    },
    // { w: 'استادیومی',  link: '' },
    {
        w: 'رستورانی',
        link: 'https://heydari-mi.com/products/tree-chair',
        id: 'restaurant',
    },
    {
        w: 'ویلایی',
        link: 'https://heydari-mi.com/products/savin-chair-2',
        id: 'villa',
    },
    {
        w: 'آموزشی',
        link: 'https://heydari-mi.com/products/MetalPlast-Chair',
        id: 'edu',
    },
]
let currentMessage = 0
const DELETE_DELAY = 1000
const START_DELAY = 250

function typeMessage() {
    if (!words[currentMessage].w) {
        currentMessage = 0
    }

    const currentStr = words[currentMessage].w

    currentStr.split('')

    let part = ''

    let currentLetter = 0

    let int1 = setInterval(() => {
        if (!currentStr[currentLetter]) {
            currentMessage++

            setTimeout(() => {
                deleteMessage(part)
            }, DELETE_DELAY)

            console.log('switched')
            toggleImgs()
            clearInterval(int1)
        } else {
            part += currentStr[currentLetter++]

            htmlWord.innerText = part
        }
    }, 100)
}
function deleteMessage(str) {
    let int = setInterval(() => {
        if (str.length === 0) {
            setTimeout(() => {
                typeMessage()
            }, START_DELAY)
            clearInterval(int)
        } else {
            str = str.split('')
            str.pop()
            str = str.join('')
            htmlWord.innerHTML = str
        }
    }, 50)
}
function toggleImgs() {
    if (aTags.length == 0) return
    let tags = Array.from(aTags)

    tags.forEach(a => a.classList.toggle('active', false))
    let id = tags.findIndex(a => a.id == words[currentMessage].id)
    if (id == -1) id = currentMessage

    tags[id].classList.toggle('active', true)
}
typeMessage()
toggleImgs()
