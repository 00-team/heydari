export {}

const filterDrop = document.querySelector<HTMLElement>('.dropdown#categories')
const filterActive = document.querySelector<HTMLElement>(
    '.drop-active#categories'
)
const filters = document.querySelectorAll('.drop-filter')

const filterActiveSpan = document.querySelector<HTMLElement>(
    'span.drop-active-text#categories'
)

function toggleFilterDropdown() {
    if (filterDrop.classList.contains('show')) {
        filterDrop.className = filterDrop.className.replace(' show', '')
    } else {
        filterDrop.className += ' show'
    }
}

filterActive.addEventListener('click', () => {
    toggleFilterDropdown()
})

filters.forEach((link: HTMLElement, index) => {
    link.addEventListener('mouseover', () => {
        filterDrop.style.setProperty('--top', `${3.5 * index}em`)
    })
    link.addEventListener('click', () => {
        let newCategory = link.innerText

        toggleFilterDropdown()

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

        filterActiveSpan.innerText = newCategory
    })
})

const ordersDrop = document.querySelector<HTMLElement>('.dropdown#order')
const ordersActive = document.querySelector<HTMLElement>('.drop-active#order')
const orders = document.querySelectorAll('.drop-order')

const ordersActiveSpan = document.querySelector<HTMLElement>(
    'span.drop-active-text#order'
)

function toggleOrdersDropdown() {
    if (ordersDrop.classList.contains('show')) {
        ordersDrop.className = ordersDrop.className.replace(' show', '')
    } else {
        ordersDrop.className += ' show'
    }
}

ordersActive.addEventListener('click', () => {
    toggleOrdersDropdown()
})

orders.forEach((link: HTMLElement, index) => {
    link.addEventListener('mouseover', () => {
        ordersDrop.style.setProperty('--top', `${3.5 * index}em`)
    })
    link.addEventListener('click', () => {
        let newOrder = link.innerText

        toggleOrdersDropdown()

        ordersActiveSpan.innerText = newOrder
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
