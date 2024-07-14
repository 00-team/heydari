export {}

document.addEventListener('DOMContentLoaded', () => {
    let blog = document.querySelector<HTMLElement>('.simurgh--blog-fnd')

    let details = blog.querySelector<HTMLElement>('.simurgh--blog-options')

    let readtime = details
        .querySelectorAll<HTMLElement>('.simurgh--blog-option')[0]
        .querySelector('span')
    let readtimeValue = readtime.innerText

    let publishDate = details
        .querySelectorAll<HTMLElement>('.simurgh--blog-option')[1]
        .querySelector('span')
    let publishDateValue = publishDate.innerText

    let UpdateDate = details
        .querySelectorAll<HTMLElement>('.simurgh--blog-option')[2]
        .querySelector('span')
    let UpdateDateValue = UpdateDate.innerText

    setReadTime(parseInt(readtimeValue, 10), readtime)

    setDate(parseInt(publishDateValue), publishDate)

    setDate(parseInt(UpdateDateValue), UpdateDate)
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
