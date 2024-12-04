export {}
const aboutContents = document.querySelectorAll('.about-content')
const aboutSliders = document.querySelectorAll('.about-slider')

let current = 0

const setClass = index => {
    aboutContents.forEach((content, idx0) => {
        if (index === idx0) return (content.className = 'about-content active')
        if (index - 1 === idx0)
            return (content.className = 'about-content prev')
        if (index + 1 === idx0)
            return (content.className = 'about-content next')
        if (index === aboutContents.length - 1 && idx0 === 0)
            return (content.className = 'about-content next')
        return (content.className = 'about-content')
    })
    aboutSliders.forEach((content, idx0) => {
        if (index === idx0) return (content.className = 'about-slider active')
        if (index - 1 === idx0) return (content.className = 'about-slider prev')
        if (index + 1 === idx0) return (content.className = 'about-slider next')
        if (index === aboutContents.length - 1 && idx0 === 0)
            return (content.className = 'about-slider next')
        return (content.className = 'about-slider')
    })
}

document.addEventListener(
    'DOMContentLoaded',
    () => {
        setClass(current)
        setInterval(() => {
            current = current % aboutContents.length
            setClass(current)
        }, 7500)
    },
    false
)
