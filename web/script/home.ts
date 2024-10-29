export {}

const welcomerContainer = document.querySelector<HTMLElement>('.welcomer')

welcomerContainer.addEventListener('click', () => {
    welcomerContainer.style.display = 'none'
})

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

let htmlWord = document.querySelector<HTMLElement>('span.typer-word')
const words = ['اداری', 'خانگی', 'استادیومی', 'رستورانی', 'ویلایی', 'آموزشی']
let currentMessage = 0
const DELETE_DELAY = 1000
const START_DELAY = 250

function typeMessage() {
    if (!words[currentMessage]) {
        currentMessage = 0
    }

    const currentStr = words[currentMessage]

    currentStr.split('')

    let part = ''

    let currentLetter = 0

    let int1 = setInterval(() => {
        if (!currentStr[currentLetter]) {
            currentMessage++

            setTimeout(() => {
                deleteMessage(part)
            }, DELETE_DELAY)

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
typeMessage()
