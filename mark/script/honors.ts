export {}

const HonorsElem = document.querySelector('.honors-container#honors')

const addClass = () => {
    let honorsWrapper = document.querySelector('.honors-wrapper')
    let honorsHeader = document.querySelector('.honor-header')

    console.log(honorsWrapper)
    console.log(honorsHeader)

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
