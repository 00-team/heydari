export {}

const allDropDowns = document.querySelectorAll('.dropdown')
const clearFilterElem = document.querySelectorAll('.clear-filter')

const chairTags = document.querySelectorAll('.drop-links.chair-links')
const tableTags = document.querySelectorAll('.drop-links.table-links')

const params = new URLSearchParams(window.location.search)

// search product
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
// end search

function toggleDropdown(dropdown: HTMLElement) {
    if (dropdown.classList.contains('disable')) {
        return
    }

    if (dropdown.classList.contains('show')) {
        dropdown.className = dropdown.className.replace(' show', '')
    } else {
        dropdown.className += ' show'
    }

    const links = dropdown.querySelectorAll('.drop-link')
    const active = dropdown.querySelector<HTMLElement>('.drop-active-text')

    links.forEach((link: HTMLElement) => {
        link.addEventListener('click', () => {
            let newOrder = link.innerText

            active.innerText = newOrder

            setTags()
            updateDisable()
        })
    })
}

// clear filters
clearFilterElem.forEach((clear: HTMLElement) => {
    clear.addEventListener('click', () => {
        let dropdown = clear.previousElementSibling

        let activeSpan =
            dropdown.querySelector<HTMLElement>('.drop-active-text')

        if (activeSpan.innerText === '---') return

        activeSpan.innerText = '---'

        params.delete(dropdown.id)

        location.search = params.toString()
    })
})
// end clear filters

function applyFilters() {
    const links = document.querySelectorAll('.drop-link')

    links.forEach((link: HTMLElement) => {
        link.addEventListener('click', () => {
            let elemTag = link.getAttribute('data-name')
            let elemId = link.getAttribute('data-id')

            console.log(elemTag, elemId)
            insertParam(elemTag, elemId)
        })
    })
}

allDropDowns.forEach((dropdown: HTMLElement) => {
    dropdown.addEventListener('click', () => toggleDropdown(dropdown))
})

function getFilters() {
    if (params.size <= 0) return

    let kind = params.get('kind')
    let bed = params.get('bed')
    let leg = params.get('leg')
    let sort = params.get('sort')

    if (kind) {
        let dropdown = document.querySelector<HTMLElement>('.dropdown#kind')
        let activeSpan =
            dropdown.querySelector<HTMLElement>('.drop-active-text')

        let links = dropdown.querySelector<HTMLElement>('.drop-links')

        let activeLink = links.querySelector<HTMLElement>(`.drop-link#${kind}`)

        if (activeLink) {
            activeSpan.innerText = activeLink.innerHTML.replace(/\s/g, '')
            updateDisable()
        }
    }
    if (leg) {
        let dropdown = document.querySelector<HTMLElement>('.dropdown#leg')
        let activeSpan =
            dropdown.querySelector<HTMLElement>('.drop-active-text')
    }
}

function setTags() {
    let dropdown = document.querySelector<HTMLElement>('.dropdown#kind')

    let activeSpan = dropdown.querySelector<HTMLElement>('.drop-active-text')

    if (activeSpan.innerText === 'صندلی') {
        chairTags.forEach((tag: HTMLElement) => (tag.className += ' show'))
        tableTags.forEach(
            (tag: HTMLElement) =>
                (tag.className = tag.className.replace(' show', ''))
        )
    } else if (activeSpan.innerText === 'میز') {
        tableTags.forEach((tag: HTMLElement) => (tag.className += ' show'))
        chairTags.forEach(
            (tag: HTMLElement) =>
                (tag.className = tag.className.replace(' show', ''))
        )
    }
}

function insertParam(name, value) {
    params.set(name, value)
    window.history.replaceState(
        {},
        '',
        decodeURIComponent(`${window.location.pathname}?${params}`)
    )
    location.reload()
}

function removeDisable(id: string) {
    let drop = document.querySelector(`.dropdown#${id}`)
    drop.className = drop.className.replace(' disable', '')
}

function updateDisable() {
    let dropdown = document.querySelector<HTMLElement>('.dropdown#kind')
    let span = dropdown.querySelector<HTMLElement>('.drop-active-text')

    if (span.innerText !== '---') {
        removeDisable('leg')
        removeDisable('bed')
    }
}

applyFilters()
getFilters()
setTags()
