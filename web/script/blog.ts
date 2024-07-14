export {}

document.addEventListener('DOMContentLoaded', () => {
    let blog = document.querySelector<HTMLElement>('.simurgh--blogs')
    let blogs = blog.querySelectorAll('figure')

    blogs.forEach(b => {
        let details = b.querySelector<HTMLElement>('div')

        let readtime = details
            .querySelectorAll<HTMLElement>('.detail-container')[0]
            .querySelector('span')
        let readtimeValue = readtime.innerText

        let calendar = details
            .querySelectorAll<HTMLElement>('.detail-container')[1]
            .querySelector('span')
        let calendarValue = calendar.innerText

        setReadTime(parseInt(readtimeValue, 10), readtime)
        setDate(parseInt(calendarValue), calendar)
    })
})

function setReadTime(seconds: number, elem: HTMLElement) {
    const hours = Math.floor(seconds / 3600)
    seconds %= 3600
    const minutes = Math.floor(seconds / 60)
    seconds = seconds % 60

    let text = `${minutes} دقیقه و ${seconds} ثانیه`

    elem.innerText = text
}

function setDate(date: number, elem: HTMLElement) {
    const getOffset = (timestamp: number) => {
        let offset = Math.abs(new Date().getTimezoneOffset()) * 60

        return (timestamp + offset) * 1000
    }

    let value = new Date(getOffset(date)).toLocaleDateString('fa-IR')

    elem.innerText = value
}
