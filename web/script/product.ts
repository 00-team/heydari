export {}

const main = document.querySelector<HTMLImageElement>('.main-img')
const imgs = document.querySelectorAll('.other-img')

imgs.forEach((img: HTMLImageElement) => {
    img.addEventListener('click', e => {
        main.src = img.src
        updateMagnify()
    })
})

function magnify(img: HTMLImageElement, zoom: number) {
    const parent = img.parentElement
    const glass = document.createElement('DIV')
    glass.setAttribute('class', 'img-magnifier-glass')

    parent.insertBefore(glass, img)

    const parentWidth = parent.offsetWidth
    const parentHeight = parent.offsetHeight

    glass.style.backgroundImage = `url('${main.src}')`
    glass.style.backgroundRepeat = 'no-repeat'
    glass.style.backgroundSize = `cover`

    let bw = 3
    let w = glass.offsetWidth / 2
    let h = glass.offsetHeight / 2

    glass.addEventListener('mousemove', moveMagnifier)
    img.addEventListener('mousemove', moveMagnifier)
    glass.addEventListener('touchmove', moveMagnifier)
    img.addEventListener('touchmove', moveMagnifier)

    function moveMagnifier(e: MouseEvent | TouchEvent) {
        e.preventDefault()

        let pos, x, y

        pos = getCursorPos(e)

        x = pos.x
        y = pos.y

        if (x > parentWidth - (w / zoom) * 0.1) {
            x = parentWidth - w / zoom
        }
        if (x < w / zoom) {
            x = w / zoom
        }
        if (y > parentHeight - (h / zoom) * 0.1) {
            y = parentHeight - h / zoom
        }
        if (y < (h / zoom) * 0.1) {
            y = h / zoom
        }
        glass.style.left = `${x - w}px`
        glass.style.top = `${y - h}px`

        const bgPosX = (x / parentWidth) * parentWidth * zoom - w + bw
        const bgPosY = (y / parentHeight) * parentHeight * zoom - h + bw

        glass.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`
        glass.style.backgroundSize = `${parentWidth * zoom}px ${
            parentHeight * zoom
        }px`
        glass.style.display = 'block'
    }

    function getCursorPos(e: MouseEvent | TouchEvent) {
        let a,
            x = 0,
            y = 0
        a = parent.getBoundingClientRect()

        if (e instanceof TouchEvent) {
            x = e.touches[0].clientX - a.left
            y = e.touches[0].clientY - a.top
        } else {
            x = e.clientX - a.left
            y = e.clientY - a.top
        }

        x = (x / (a.right - a.left)) * parentWidth
        y = (y / (a.bottom - a.top)) * parentHeight

        return { x: x, y: y }
    }
}

function updateMagnify() {
    let glass = document.querySelector<HTMLElement>('div.img-magnifier-glass')

    glass.style.backgroundImage = `url('${main.src}')`
}

magnify(main, 3)
