export {}

const allDropDowns = document.querySelectorAll('.dropdown')

const chairTags = document.querySelectorAll('.drop-links.chair-links')
const tableTags = document.querySelectorAll('.drop-links.table-links')

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

    if (links.length <= 1) {
        dropdown.style.setProperty('--top', `${0}em`)
    } else {
        links.forEach((link: HTMLElement, index) =>
            link.addEventListener('mouseover', () => {
                dropdown.style.setProperty('--top', `${3.5 * index}em`)
            })
        )
    }

    links.forEach((link: HTMLElement) => {
        link.addEventListener('click', () => {
            let newOrder = link.innerText

            active.innerText = newOrder

            const removeDisable = (id: string) => {
                let drop = document.querySelector(`.dropdown#${id}`)
                drop.className = drop.className.replace(' disable', '')
            }

            if (link.id === 'chair') {
                chairTags.forEach(
                    (tag: HTMLElement) => (tag.style.display = 'flex')
                )
                tableTags.forEach(
                    (tag: HTMLElement) => (tag.style.display = 'none')
                )
                dropdown.style.setProperty('--top', `${0}em`)
            } else if (link.id === 'table') {
                chairTags.forEach(
                    (tag: HTMLElement) => (tag.style.display = 'none')
                )
                tableTags.forEach(
                    (tag: HTMLElement) => (tag.style.display = 'flex')
                )
                dropdown.style.setProperty('--top', `${0}em`)
            }

            if (dropdown.id === 'kind') {
                removeDisable('paye')
                removeDisable('kafi')
            }
            // if (dropdown.id === 'paye') {
            //     removeDisable('kafi')
            // }

            // if (dropdown.id === 'kafi') {
            //     insertParam('kafi', index)
            // }
            // if (dropdown.id === 'paye') {
            //     insertParam('paye', index)
            // }
            // if (dropdown.id === 'kind') {
            //     insertParam('kind', index)
            // }
            // if (dropdown.id === 'order') {
            //     insertParam('order', index)
            // }

            // insertParam('test', 'abbbasre')
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

function insertParam(key, value) {
    key = encodeURIComponent(key)
    value = encodeURIComponent(value)

    // kvp looks like ['key1=value1', 'key2=value2', ...]
    var kvp = document.location.search.substr(1).split('&')
    let i = 0

    for (; i < kvp.length; i++) {
        if (kvp[i].startsWith(key + '=')) {
            let pair = kvp[i].split('=')
            pair[1] = value
            kvp[i] = pair.join('=')
            break
        }
    }

    if (i >= kvp.length) {
        kvp[kvp.length] = [key, value].join('=')
    }

    // can return this or...
    let params = kvp.join('&')

    // reload page with new params
    document.location.search = params
}
