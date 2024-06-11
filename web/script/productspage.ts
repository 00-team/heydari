export {}

const allDropDowns = document.querySelectorAll('.dropdown')

function toggleDropdown(dropdown: HTMLElement) {
    if (dropdown.classList.contains('show')) {
        dropdown.className = dropdown.className.replace(' show', '')
    } else {
        dropdown.className += ' show'
    }

    const links = dropdown.querySelectorAll('.drop-link')
    const active = dropdown.querySelector<HTMLElement>('.drop-active-text')

    links.forEach((link: HTMLElement, index) => {
        link.addEventListener('mouseover', () => {
            dropdown.style.setProperty('--top', `${3.5 * index}em`)
        })
        link.addEventListener('click', () => {
            let newOrder = link.innerText

            active.innerText = newOrder
        })
    })
}

allDropDowns.forEach((dropdown: HTMLElement) => {
    dropdown.addEventListener('click', () => toggleDropdown(dropdown))
})

const input = document.querySelector<HTMLInputElement>('.search-inp')
const productCards = document.querySelectorAll('.product-card')

input.addEventListener('input', e => {
    // @ts-ignore
    let value = e.currentTarget.value

    if (value) {
        productCards.forEach((card: HTMLElement) => {
            let title = card.querySelector<HTMLElement>('figcaption').innerText
            let code =
                card.querySelector<HTMLElement>('.product-code').innerText

            let hasTitle = title.includes(value)
            let hasCode = code.includes(value)

            if (hasTitle || hasCode) {
                card.className = 'product-card'
                return
            }

            if (card.classList.contains('hide')) return

            card.className = 'product-card hide'
        })
    } else {
        productCards.forEach((card: HTMLElement) => {
            card.className = card.className.replace(' hide', '')
        })
    }
})
