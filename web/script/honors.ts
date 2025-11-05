export {}

const HonorsElem = document.querySelector('.honors-container#honors')!
const honorsWrapper = document.querySelector('.honors-wrapper')!
const honorsHeader = document.querySelector('.honor-header')!

const addClass = () => {
    HonorsElem.className += ' active'
    honorsWrapper.className += ' active'
    honorsHeader.className += ' active'

    return
}

const honors = document.querySelectorAll('.honor-container')

let current = 1

function setClass(index: number) {
    honors.forEach((content, idx0) => {
        if (index === idx0)
            return (content.className = 'honor-container active')
        if (index - 1 === idx0)
            return (content.className = 'honor-container prev')
        if (index + 1 === idx0)
            return (content.className = 'honor-container next')
        if (index === honors.length - 1 && idx0 === 0)
            return (content.className = 'honor-container next')
        return (content.className = 'honor-container')
    })
}

document.addEventListener('DOMContentLoaded', () => {
    var observer = new IntersectionObserver(
        ([entry]) => {
            if (entry && entry.isIntersecting) {
                addClass()

                setClass(current) // Initialize with the first content as active
                setInterval(() => {
                    current = (current + 1) % honors.length // Circular increment
                    setClass(current)
                }, 3000)

                observer.disconnect()
            }
        },
        {
            threshold: 0.4,
        }
    )

    observer.observe(HonorsElem)
})
