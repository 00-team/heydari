export {}

const HonorsElem = document.querySelector('.honors-container#honors')
const honorsWrapper = document.querySelector('.honors-wrapper')
const honorsHeader = document.querySelector('.honor-header')

const addClass = () => {
    HonorsElem.className += ' active'
    honorsWrapper.className += ' active'
    honorsHeader.className += ' active'

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

    observer.observe(HonorsElem)
}
