export {}

const productsElem = document.querySelector('.products-container#products')
const productsHeader = document.querySelector('.products-header')

const addClass = () => {
    productsHeader.className += ' active'

    return
}

window.onload = () => {
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

    observer.observe(productsElem)
}
