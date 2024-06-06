export {}

const productCircle = document.querySelector<HTMLElement>('.circle#circle')

let mouse = { x: 0, y: 0 }
let circle = { x: 0, y: 0 }

document.addEventListener('mousemove', e => {
    if (!productCircle) return

    // // @ts-ignore
    // console.log(e.target.className)

    mouse.x = e.x
    mouse.y = e.y

    // // @ts-ignore
    // console.log(e.target.tagName)

    // @ts-ignore
    if (e.target.className.includes('category'))
        return (productCircle.className = 'circle category')
    // @ts-ignore
    if (e.target.className.includes('product-desc'))
        return (productCircle.className = 'circle desc')
    // @ts-ignore
    if (e.target.className.includes('product-title'))
        return (productCircle.className = 'circle title')
    // @ts-ignore
    if (e.target.className.includes('banner-img'))
        return (productCircle.className = 'circle banner')

    return (productCircle.className = 'circle')
})

const speed = 0.03

const tick = () => {
    circle.x += (mouse.x - circle.x) * speed
    circle.y += (mouse.y - circle.y) * speed

    // productCircle.style.transform = `translate(${circle.x}px,${circle.y}px)`
    productCircle.style.top = `${circle.y}px`
    productCircle.style.left = `${circle.x}px`

    window.requestAnimationFrame(tick)
}

tick()

const main = document.querySelector<HTMLImageElement>('.main-img')
const imgs = document.querySelectorAll('.other-img')

imgs.forEach((img: HTMLImageElement) => {
    img.addEventListener('click', e => {
        main.src = img.src
    })
})
