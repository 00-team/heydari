export {}

const productCircle = document.querySelector<HTMLElement>('.circle#circle')

let mouse = { x: 0, y: 0 }
let circle = { x: 0, y: 0 }

document.addEventListener('mousemove', e => {
    if (!productCircle) return

    mouse.x = e.x
    mouse.y = e.y
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
