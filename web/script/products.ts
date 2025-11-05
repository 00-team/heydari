export {}

const productsElem = document.querySelector('.products-container#products')!
const productsHeader = document.querySelector('.products-header')!

const addClass = () => {
    productsHeader.className += ' active'

    return
}

const productsSlider = document.querySelectorAll('.product-slider')

let current = 1

const setClass = (index: number) => {
    productsSlider.forEach((content, idx0) => {
        if (index === idx0) return (content.className = 'product-slider active')
        if (index - 1 === idx0)
            return (content.className = 'product-slider prev')
        if (index + 1 === idx0)
            return (content.className = 'product-slider next')
        if (index === productsSlider.length - 1 && idx0 === 0)
            return (content.className = 'product-slider next')
        return (content.className = 'product-slider')
    })
}

document.addEventListener('DOMContentLoaded', () => {
    var observer = new IntersectionObserver(
        ([entry]) => {
            if (entry && entry.isIntersecting) {
                addClass()
                observer.disconnect()
            }
        },
        {
            threshold: 0.4,
        }
    )

    setClass(1)
    setInterval(() => {
        if (current + 2 > productsSlider.length) {
            current = 0
            setClass(0)
        }
        setClass(current + 1)
        current += 1

        return
    }, 7500)

    observer.observe(productsElem)
})
