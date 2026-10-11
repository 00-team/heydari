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
    dd.querySelector<HTMLSpanElement>('.drop-active-text')!.innerText = '---'
    params.delete(dd.dataset.id!)
    location.search = params.toString()
}

function generic_load(dd: HTMLDivElement) {
    let pal = params.get(dd.dataset.id!)
    if (!pal) return

    let value = dd.querySelector<HTMLDivElement>(
        `.drop-link[data-value="${pal}"]`
    )
    if (!value) return
    dd.setAttribute('data-value', pal)

    let active = dd.querySelector<HTMLSpanElement>('.drop-active-text')
    active!.innerText = value.dataset.name!
}

function generic_select(dd: HTMLDivElement, dl: HTMLDivElement) {
    dd.setAttribute('data-value', dl.dataset.value!)
    insert_param(dd.dataset.id!, dl.dataset.value!)
}

let dropdown_kind = document.getElementById('dropdown_kind')!
var dropdown_leg = document.getElementById('dropdown_leg')!
let dropdown_bed = document.getElementById('dropdown_bed')!

const UTMAP: { [k: string]: any } = {
    kind_clear: generic_clear,
    kind_select: generic_select,

    kind_load: (dd: HTMLDivElement) => {
        let pal = params.get(dd.dataset.id!)
        if (!pal || !['chair', 'table'].includes(pal)) {
            dropdown_leg.classList.add('disable')
            dropdown_bed.classList.add('disable')
            return
        }

        dropdown_bed.classList.add(pal)
        dropdown_leg.classList.add(pal)

        dd.setAttribute('data-value', pal)
        let active = dd.querySelector<HTMLSpanElement>('.drop-active-text')!
        active.innerText = pal == 'chair' ? 'صندلی' : 'میز'
    },

    bed_clear: generic_clear,
    bed_load: generic_load,
    bed_select: generic_select,

    leg_clear: generic_clear,
    leg_load: generic_load,
    leg_select: generic_select,

    sort_clear: generic_clear,
    sort_load: generic_load,
    sort_select: generic_select,
}

function setProducts() {
    document
        .querySelectorAll<HTMLDivElement>('.filters .dropdown')
        .forEach(el => {
            let on_select = UTMAP[el.dataset.id + '_select']
            let on_clear = UTMAP[el.dataset.id + '_clear']
            let on_load = UTMAP[el.dataset.id + '_load']

            on_load && on_load(el)

            el.onclick = () => el.classList.toggle('show')

            el.querySelectorAll<HTMLDivElement>('.drop-link').forEach(dl => {
                dl.onclick = () => on_select(el, dl)
            })

            el.parentElement!.querySelector<HTMLDivElement>(
                '.clear-filter'
            )!.onclick = () => on_clear(el)
        })
}

document.addEventListener('DOMContentLoaded', () => {
    setProducts()
    sortProductsByCode()
})

// search product
const search_input = document.querySelector<HTMLInputElement>('.search-inp')!
const product_cards = document.querySelectorAll<HTMLDivElement>('.product-card')

search_input.oninput = () => {
    if (!search_input.value) {
        product_cards.forEach(p => {
            p.classList.remove('hide')
        })
        return
    }

    product_cards.forEach(p => {
        let title = p.querySelector<HTMLElement>('.product-title')!.textContent
        let code = p.querySelector<HTMLElement>('.product-code')!.textContent

        if (!title || !code) return

        let hasTitle = title.includes(search_input.value)
        let hasCode = code.includes(search_input.value)

        if (hasTitle || hasCode) {
            p.classList.remove('hide')
            return
        }

        p.classList.add('hide')
    })
}

const SORT_WITH_IDS: string[] = [
    // 100 series
    '100CF',
    '100F',
    '101',
    '102',
    '103',
    '104',
    '107A',
    '107c',
    '108A',
    '109A',
    '110A',
    '112',
    '113',

    // 200 series
    '202',
    '203',
    '204L',
    '207A',
    '207C',
    '208A',
    '209A',
    '210A',
    '220L',

    // 300 series
    '301',
    '302',
    '303',
    '304',
    '307A',
    '308A',
    '309A',
    '310A',
    '340',

    // 400 series
    '400AD',
    '401',
    '401C',
    '402',
    '402AD',
    '403',
    '404',
    '407A',
    '407C',
    '408A',
    '409A',
    '410A',

    // 500 series
    '540LM',

    // 600 series
    '600',
    '601CL',
    '602L',
    '603L',
    '607c',

    // 700 series
    '700',
    '700S',
    '710AV',
    '710AVF',
    '710v',
    '710vVF',

    // 800 series
    '800S',
    '801F',
    '801JV',
    '810A',
    '810AV',
    '810-F',
    '810F',
    '810V',

    // 900 series
    '900',
    '900A',
    '900AV',
    '900-J',
    '900J',
    '900V',
    '900VJ',
    '902',
    '903',
    '904',

    // S1000 series
    's1000',
    'S1000F',
    'S1000FM',
    'S1000FS',
    'S1000R',
    'S1000S',
    'S1000V',
    'S1000VF',
    'S1000VS',

    // Tables: T series
    'T4',
    'T4S',
    'T5',
    'T5D',
    'T6',
    'T6W',
    'T6WW',
    'T10',
    'T11',
    'T12',
    'T13',
    'T14',
    'T17',
    'T120',
    'T-bar',
    'T-CT150-H45',
    'TH4',

    // Other product codes
    'ALBORZ',
    'C-OF-LP',
    'C-OFS-LP',
    'C-PL-s1005',
    'C-PR-LJP',
    'C-PR-LP',
    'C-SR-LP',
    'C-TR-LP',
    'C-ZA-LR',
    'C-ZAL-LRA',
    'C-ZD-LR',
    'C-ZD-LW',
    'C-ZDL-LR',
    'C-ZR-LR',
    'C-ZZL-LR',
    'FOLDING',
    'lahestani',
    'lahestani-openi',
    'persian',
    'planter',
    'SHAMIM',
    'St2',
    'ST3',
    'tedi',
    'WILSON',
    'WILSON-OPENI',
    'z510',
    'z520',
]
const SORT_PRIORITY = new Map(SORT_WITH_IDS.map((code, index) => [code, index]))

function sortProductsByCode(): void {
    const wrapper = document.querySelector<HTMLElement>(
        'section.products-wrapper'
    )

    console.log(wrapper)
    if (!wrapper) return

    const cards = Array.from(
        wrapper.querySelectorAll<HTMLDivElement>('.product-card')
    )
    console.log(cards)

    const sortedCards = cards
        .map((card, originalIndex) => {
            const code =
                card
                    .querySelector<HTMLElement>('.product-code')
                    ?.textContent?.trim() ?? ''

            return {
                card,
                originalIndex,
                priority: SORT_PRIORITY.get(code),
            }
        })
        .sort((a, b) => {
            // Unknown codes go to the end, preserving their original order.
            if (a.priority === undefined && b.priority === undefined) {
                return a.originalIndex - b.originalIndex
            }

            if (a.priority === undefined) return 1
            if (b.priority === undefined) return -1

            return a.priority - b.priority
        })

    const fragment = document.createDocumentFragment()

    sortedCards.forEach(({ card }) => {
        fragment.appendChild(card)
    })

    wrapper.appendChild(fragment)

    console.log('sorted')
}

// search product end

// function setPagination() {
//     const paginationContainer =
//         document.querySelector<HTMLElement>('.pagination')
//     const paginationWrapper = paginationContainer.querySelector<HTMLElement>(
//         '.pagination-wrapper'
//     )
//
//     const totalPages = parseInt(paginationContainer.dataset.pages) || 1
//     const currentPage = parseInt(paginationContainer.dataset.page) || 0
//
//     console.log(totalPages, currentPage)
//
//     if (totalPages <= 0) return (paginationContainer.innerHTML = '')
//
//     // Previous button
//     // const prevButton = paginationContainer.querySelector<HTMLButtonElement>(
//     //     'button.pagination-prev'
//     // )
//     // if (currentPage <= 1) prevButton.disabled = true
//     // prevButton.addEventListener('click', () => goToPage(currentPage - 1))
//
//     // Next button
//     // const nextButton = paginationContainer.querySelector<HTMLButtonElement>(
//     //     'button.pagination-next'
//     // )
//     // if (currentPage >= totalPages) nextButton.disabled = true
//     // nextButton.addEventListener('click', () => goToPage(currentPage + 1))
//
//     let pageTags = paginationWrapper.querySelectorAll('a')
//     console.log(pageTags.length)
//
//     // Page buttons
//     for (let i = 0; i < pageTags.length; i++) {
//         if (i == currentPage) {
//             pageTags[i].classList.add('active')
//         }
//     }
//
//     // function goToPage(page) {
//     //     insert_param('page', page)
//     // }
// }

// pagination
