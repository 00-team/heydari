const params = new URLSearchParams(location.search)

function insert_param(name: string, value: string) {
    params.set(name, value)
    history.replaceState(
        {},
        '',
        decodeURIComponent(`${window.location.pathname}?${params}`)
    )
    location.reload()
}

function generic_clear(dd: HTMLDivElement) {
    if (!dd.dataset.value) return
    dd.querySelector<HTMLSpanElement>('.drop-active-text').innerText = '---'
    params.delete(dd.dataset.id)
    location.search = params.toString()
}

function generic_load(dd: HTMLDivElement) {
    let pal = params.get(dd.dataset.id)
    if (!pal) return

    let value = dd.querySelector<HTMLDivElement>(
        `.drop-link[data-value="${pal}"]`
    )
    if (!value) return
    dd.setAttribute('data-value', pal)

    let active = dd.querySelector<HTMLSpanElement>('.drop-active-text')
    active.innerText = value.dataset.name
}

function generic_select(dd: HTMLDivElement, dl: HTMLDivElement) {
    dd.setAttribute('data-value', dl.dataset.value)
    insert_param(dd.dataset.id, dl.dataset.value)
}

let dropdown_kind = document.getElementById('dropdown_kind')
var dropdown_leg = document.getElementById('dropdown_leg')
let dropdown_bed = document.getElementById('dropdown_bed')

global.kind_clear = generic_clear
global.kind_select = generic_select
global.kind_load = (dd: HTMLDivElement) => {
    let pal = params.get(dd.dataset.id)
    if (!pal || !['chair', 'table'].includes(pal)) {
        dropdown_leg.classList.add('disable')
        dropdown_bed.classList.add('disable')
        return
    }

    dropdown_bed.classList.add(pal)
    dropdown_leg.classList.add(pal)

    dd.setAttribute('data-value', pal)
    let active = dd.querySelector<HTMLSpanElement>('.drop-active-text')
    active.innerText = pal == 'chair' ? 'صندلی' : 'میز'
}

global.bed_clear = generic_clear
global.bed_load = generic_load
global.bed_select = generic_select

global.leg_clear = generic_clear
global.leg_load = generic_load
global.leg_select = generic_select

global.sort_clear = generic_clear
global.sort_load = generic_load
global.sort_select = generic_select

function setProducts() {
    document
        .querySelectorAll<HTMLDivElement>('.filters .dropdown')
        .forEach(el => {
            let on_select = global[el.dataset.id + '_select']
            let on_clear = global[el.dataset.id + '_clear']
            let on_load = global[el.dataset.id + '_load']

            on_load && on_load(el)

            el.onclick = () => el.classList.toggle('show')

            el.querySelectorAll<HTMLDivElement>('.drop-link').forEach(dl => {
                dl.onclick = () => on_select(el, dl)
            })

            el.parentElement.querySelector<HTMLDivElement>(
                '.clear-filter'
            ).onclick = () => on_clear(el)
        })
}

document.addEventListener('DOMContentLoaded', () => {
    setProducts()
    setPagination()
})

// search product
const search_input = document.querySelector<HTMLInputElement>('.search-inp')
const product_cards = document.querySelectorAll<HTMLDivElement>('.product-card')

search_input.oninput = () => {
    if (!search_input.value) {
        product_cards.forEach(p => {
            p.classList.remove('hide')
        })
        return
    }

    product_cards.forEach(p => {
        let title = p.querySelector<HTMLElement>('.product-title').textContent
        let code = p.querySelector<HTMLElement>('.product-code').textContent

        let hasTitle = title.includes(search_input.value)
        let hasCode = code.includes(search_input.value)

        if (hasTitle || hasCode) {
            p.classList.remove('hide')
            return
        }

        p.classList.add('hide')
    })
}

// search product end

function setPagination() {
    const paginationContainer =
        document.querySelector<HTMLElement>('.pagination')
    const paginationWrapper = paginationContainer.querySelector<HTMLElement>(
        '.pagination-wrapper'
    )

    const totalPages = parseInt(paginationContainer.dataset.pages) || 1
    let currentPage =
        parseInt(new URLSearchParams(window.location.search).get('page')) || 1

    console.log(totalPages, currentPage)

    if (totalPages <= 1) return (paginationContainer.innerHTML = '')

    function createPagination(totalPages: number, currentPage: number) {
        paginationWrapper.innerHTML = ''

        // Previous button
        const prevButton = paginationContainer.querySelector<HTMLElement>(
            'button.pagination-prev'
        )
        prevButton.addEventListener('click', () => goToPage(currentPage - 1))

        // Next button
        const nextButton = paginationContainer.querySelector<HTMLElement>(
            'button.pagination-next'
        )
        nextButton.addEventListener('click', () => goToPage(currentPage + 1))

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button')

            pageButton.innerText = `${i}`

            pageButton.classList.add('title_smaller')

            if (i === currentPage) {
                pageButton.classList.add('active')
            }
            pageButton.addEventListener('click', () => goToPage(i))
            paginationWrapper.appendChild(pageButton)
        }
    }

    createPagination(totalPages, currentPage)

    function goToPage(page) {
        insert_param('page', page)
    }
}

// pagination
