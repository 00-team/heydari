export {}

const dropdown = document.querySelector<HTMLElement>('.dropdown')
const dropactive = document.querySelector<HTMLElement>('.drop-active')
const links = document.querySelectorAll('.drop-link')

const activeSpan = document.querySelector<HTMLElement>('span.drop-active-text')

function toggleDropdown() {
    if (dropdown.classList.contains('show')) {
        dropdown.className = dropdown.className.replace(' show', '')
    } else {
        dropdown.className += ' show'
    }
}

dropactive.addEventListener('click', () => {
    toggleDropdown()
})

links.forEach((link: HTMLElement, index) => {
    link.addEventListener('mouseover', () => {
        dropdown.style.setProperty('--top', `${3.5 * index}em`)
    })
    link.addEventListener('click', () => {
        let newCategory = link.innerText

        toggleDropdown()

        productCards.forEach((card: HTMLElement) => {
            let category =
                card.querySelector<HTMLElement>('.product-category').innerText

            let hasCategory = category.includes(newCategory)

            if (hasCategory) {
                card.className = 'product-card'
                return
            }

            if (card.classList.contains('hide')) return

            card.className = 'product-card hide'
        })

        activeSpan.innerText = newCategory
    })
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
