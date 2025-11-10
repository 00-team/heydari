const main = document.querySelector<HTMLImageElement>('.main-img')!
const imgs = document.querySelectorAll<HTMLImageElement>('.other-img')

imgs.forEach(img => {
    img.addEventListener('click', () => {
        main.src = img.src
    })
})

const aboutProduct = document.querySelector<HTMLElement>('.product-about')!

const aboutSelect = aboutProduct.querySelector<HTMLElement>('.about-select')!
const aboutWrapper = aboutProduct.querySelector<HTMLElement>('.about-wrapper')!

const InfoButton = aboutSelect.querySelector<HTMLButtonElement>('button.info')!
const AboutButton =
    aboutSelect.querySelector<HTMLButtonElement>('button.about')!

const aboutSection = aboutWrapper.querySelector<HTMLElement>('.about')!
const infoSection = aboutWrapper.querySelector<HTMLElement>('.info')!

const aboutText = aboutSection.querySelector<HTMLElement>('p')!
const infoTable = infoSection.querySelector<HTMLTableElement>('table')!

let activeSection: 'info' | 'about' = 'about'

function update() {
    if (activeSection === 'about') {
        AboutButton.className = 'title_small about active'
        InfoButton.className = 'title_small info'

        aboutSection.className = 'about title_smaller active'
        infoSection.className = 'info title_smaller'

        aboutWrapper.style.height = `calc(${aboutText.getBoundingClientRect().height}px + 5rem)`
    } else {
        AboutButton.className = 'title_small about '
        InfoButton.className = 'title_small info active'

        aboutSection.className = 'about title_smaller '
        infoSection.className = 'info title_smaller active'

        aboutWrapper.style.height = `calc(${infoTable.getBoundingClientRect().height}px + 5rem)`
    }
}

update()

InfoButton.addEventListener('click', () => {
    activeSection = 'info'
    update()
})
AboutButton.addEventListener('click', () => {
    activeSection = 'about'
    update()
})

const productPrice = document.querySelector<HTMLDivElement>(
    '#product-price span span'
)!

let orderCount = document.querySelector<HTMLInputElement>('#order-counter')!
let orderPlus = document.querySelector<HTMLInputElement>('#order-plus')!
let orderMinus = document.querySelector<HTMLInputElement>('#order-minus')!

productPrice.innerText = parseInt(productPrice.innerText).toLocaleString()

const handlePlus = () => {
    orderCount.valueAsNumber = orderCount.valueAsNumber + 1
}
const handleMinus = () => {
    orderCount.valueAsNumber = Math.max(1, orderCount.valueAsNumber - 1)
}

orderPlus.addEventListener('click', handlePlus)
orderMinus.addEventListener('click', handleMinus)

// declare global {
//     var add_order: (id: number) => void
// }

// globalThis.add_order = (id: number) => {
//     api_orders_post({ product: id, count: orderCount.valueAsNumber || 1 })
// }

const buyCta = document.querySelector<HTMLButtonElement>('#buy-cta')
buyCta?.addEventListener('click', initPopup)

// popup
const popupCmp = document.querySelector<HTMLElement>('#product-popup-cmp')
const popupCmpForm = popupCmp?.querySelector<HTMLElement>('form')
const closePopupCta = popupCmp?.querySelector<HTMLButtonElement>('.close-popup')
const popupTotal = popupCmp?.querySelector<HTMLSpanElement>('#total')

let p_orderCount =
    popupCmp?.querySelector<HTMLInputElement>('#p-order-counter')!
let p_orderPlus = popupCmp?.querySelector<HTMLInputElement>('#p_add')!
let p_orderMinus = popupCmp?.querySelector<HTMLInputElement>('#p_minus')!

function initPopup() {
    const raw = (productPrice?.textContent ?? '0').replace(/\D+/g, '')
    const price = raw ? Number(raw) : 0
    const count = Math.max(0, Number(p_orderCount.valueAsNumber) || 0)

    p_orderCount.valueAsNumber = count

    popupTotal!.textContent = (price * count).toLocaleString()
    popupCmp?.classList.add('active')
}

// closes popup
function closePopup() {
    popupCmp?.classList.remove('active')
}

// update total based on count and price
function updateTotal() {
    const raw = (productPrice?.textContent ?? '0').replace(/\D+/g, '')
    const price = raw ? Number(raw) : 0
    const count = Math.max(0, Number(p_orderCount.valueAsNumber) || 0)
    popupTotal!.textContent = (price * count).toLocaleString()
}

// handlers for + and –
const p_handlePlus = () => {
    let v = (p_orderCount.valueAsNumber || 0) + 1

    p_orderCount.valueAsNumber = v
    p_orderCount.valueAsNumber = v

    updateTotal()
}

const p_handleMinus = () => {
    const current = p_orderCount.valueAsNumber || 0
    if (current > 1) {
        let v = current - 1

        p_orderCount.valueAsNumber = v
        p_orderCount.valueAsNumber = v

        updateTotal()
    }
}

// attach listeners
p_orderPlus.addEventListener('click', p_handlePlus)
p_orderMinus.addEventListener('click', p_handleMinus)

// also update total if user manually edits the count input
p_orderCount.addEventListener('input', updateTotal)

popupCmp?.addEventListener('click', () => {
    closePopup()
})
popupCmpForm?.addEventListener('click', e => {
    e.stopPropagation()
})

closePopupCta?.addEventListener('click', () => {
    closePopup()
})
// popup end
