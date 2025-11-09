export type AlertModel = {
    type: 'info' | 'error' | 'success'
    id: string
    subject: string
    content?: string
    timeout: number // seconds
}

type AlertState = {
    alerts: AlertModel[]
}

const MAX_ALERTS = 2
let alertsState: AlertState = { alerts: [] }
let rootEl: HTMLElement | null = null

// queue for alerts that arrive before initAlerts()
const pendingAlerts: Omit<AlertModel, 'id'>[] = []

// store timeout handles per alert id for cleanup
const timeouts = new Map<
    string,
    { hideTimeout?: number; removeTimeout?: number }
>()

let uidCounter = 0
function createUniqueId() {
    uidCounter += 1
    return `a-${Date.now().toString(36)}-${uidCounter}`
}

/**
 * Public API: addAlert
 * Omit id, will be created
 */
export function addAlert(a: Omit<AlertModel, 'id'>) {
    console.debug('[alerts] addAlert called', a)

    // Respect overall max (account queued too)
    const totalIncoming = alertsState.alerts.length + pendingAlerts.length
    if (totalIncoming >= MAX_ALERTS) {
        console.debug('[alerts] max reached, ignoring new alert')
        return
    }

    // If we don't have rootEl yet, try to pick it up automatically
    if (!rootEl) {
        const guessed = document.querySelector('.alerts') as HTMLElement | null
        if (guessed) {
            console.debug(
                '[alerts] rootEl not set — found .alerts automatically'
            )
            rootEl = guessed
        }
    }

    // If still no rootEl, push to pending queue and return (will render later in init)
    if (!rootEl) {
        console.debug(
            '[alerts] rootEl missing — queuing alert until initAlerts()'
        )
        pendingAlerts.push(a)
        return
    }

    const id = createUniqueId()
    alertsState.alerts.unshift({ ...a, id })
    renderAlerts()
}

export function delAlert(id: string) {
    const idx = alertsState.alerts.findIndex(x => x.id === id)
    if (idx === -1) return

    // cleanup timeouts for that id
    const t = timeouts.get(id)
    if (t) {
        if (t.hideTimeout !== undefined) clearTimeout(t.hideTimeout)
        if (t.removeTimeout !== undefined) clearTimeout(t.removeTimeout)
        timeouts.delete(id)
    }

    alertsState.alerts.splice(idx, 1)
    renderAlerts()
}

/** Initialize mount point (call once) */
export function initAlerts(selector = '.alerts') {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) {
        throw new Error('Alerts root not found: ' + selector)
    }

    if (rootEl && rootEl !== el) {
        console.warn(
            '[alerts] initAlerts called but rootEl already set to a different element',
            {
                previous: rootEl,
                new: el,
            }
        )
    }

    rootEl = el
    console.debug('[alerts] initAlerts -> root set', rootEl)

    while (pendingAlerts.length > 0 && alertsState.alerts.length < MAX_ALERTS) {
        const next = pendingAlerts.shift()!
        const id = createUniqueId()
        alertsState.alerts.unshift({ ...next, id })
    }

    renderAlerts()
}

function iconSvg(type: AlertModel['type']): SVGElement {
    const ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('width', '20')
    svg.setAttribute('height', '20')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'currentColor')

    if (type === 'info') {
        // Warning icon (triangle with exclamation)
        svg.innerHTML = `<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>`
    } else if (type === 'error') {
        // Close icon (X)
        svg.innerHTML = `<path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.59 13.41 4.29 19.71 2.87 18.29 9.17 12 2.87 5.71 4.29 4.29 10.59 10.59 16.88 4.29z"/>`
    } else {
        // success (check)
        svg.innerHTML = `<path d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12L19.59 5.59z"/>`
    }
    return svg
}

function renderAlerts() {
    if (!rootEl) return

    // Clear previous DOM
    rootEl.innerHTML = ''
    rootEl.classList.toggle('show', alertsState.alerts.length > 0)

    alertsState.alerts.forEach(a => {
        const container = document.createElement('div')
        container.className = `alert-container ${a.type}`

        // Inner alert element
        const alertEl = document.createElement('div')
        alertEl.className = 'alert'

        // head
        const head = document.createElement('div')
        head.className = 'head'

        const iconWrap = document.createElement('div')
        iconWrap.className = 'icon'
        iconWrap.appendChild(iconSvg(a.type))

        const contentWrap = document.createElement('div')
        contentWrap.className = 'content description'
        const h3 = document.createElement('h3')
        h3.textContent = a.subject
        contentWrap.appendChild(h3)

        head.appendChild(iconWrap)
        head.appendChild(contentWrap)
        alertEl.appendChild(head)

        // body (optional)
        if (a.content) {
            const body = document.createElement('div')
            body.className = 'body description'
            const p = document.createElement('p')
            p.textContent = a.content
            body.appendChild(p)
            alertEl.appendChild(body)
        }

        // bg-style / progress line
        const bg = document.createElement('div')
        bg.className = 'bg-style'
        const line = document.createElement('div')
        line.className = 'line'
        // set animation-duration in seconds
        line.style.animationDuration = `${a.timeout}s`
        line.style.animationPlayState = 'running'
        bg.appendChild(line)
        alertEl.appendChild(bg)

        container.appendChild(alertEl)
        rootEl!.appendChild(container)

        // --- State for this alert element ---
        let hide = false
        timeouts.set(a.id, {}) // create entry

        function startHideAndRemove() {
            if (hide) return
            hide = true
            alertEl.classList.add('hide')

            // schedule removal after 500ms to allow hide animation
            const removeTimeout = window.setTimeout(() => delAlert(a.id), 500)
            const t = timeouts.get(a.id) || {}
            t.removeTimeout = removeTimeout
            timeouts.set(a.id, t)
        }

        const onLineAnimationEnd = () => {
            if (hide) return
            startHideAndRemove()
        }
        line.addEventListener('animationend', onLineAnimationEnd)

        const onClick = () => {
            if (hide) return
            startHideAndRemove()
        }
        alertEl.addEventListener('click', onClick)

        // Pause on mouse enter/leave
        const onMouseEnter = () => {
            line.style.animationPlayState = 'paused'
        }
        const onMouseLeave = () => {
            line.style.animationPlayState = 'running'
        }
        alertEl.addEventListener('mouseenter', onMouseEnter)
        alertEl.addEventListener('mouseleave', onMouseLeave)

        // --- Touch drag handling for swipe-to-dismiss ---
        let startX = 0
        let startY = 0
        let axisLock: 'x' | 'y' | null = null
        const THRESHOLD = 80

        function onTouchStart(e: TouchEvent) {
            const t = e.touches[0]
            if (!t) return
            startX = t.clientX
            startY = t.clientY
            axisLock = null
            alertEl.style.transition = 'none'
            alertEl.style.willChange = 'transform, opacity'
        }

        function onTouchMove(e: TouchEvent) {
            const t = e.touches[0]
            if (!t) return
            const deltaX = t.clientX - startX
            const deltaY = t.clientY - startY
            if (!axisLock) {
                axisLock = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
            }
            const moveX = axisLock === 'x' ? deltaX : 0
            const moveY = axisLock === 'y' ? deltaY : 0
            alertEl.style.transform = `translate(${moveX}px, ${moveY}px)`

            const dist = axisLock === 'x' ? Math.abs(moveX) : Math.abs(moveY)
            const opacity = Math.max(0, 1 - dist / 150)
            alertEl.style.opacity = `${opacity}`
        }

        function onTouchEnd(e: TouchEvent) {
            const t = e.changedTouches[0]
            if (!t) return
            const deltaX = t.clientX - startX
            const deltaY = t.clientY - startY
            const dist = axisLock === 'x' ? deltaX : deltaY

            if (Math.abs(dist) > THRESHOLD) {
                alertEl.style.transition =
                    'transform 0.2s ease, opacity 0.2s ease'
                const extra = 3 * dist
                const outX = axisLock === 'x' ? extra : 0
                const outY = axisLock === 'y' ? extra : 0
                alertEl.style.transform = `translate(${outX}px, ${outY}px)`
                alertEl.style.opacity = '0'

                // remove after animation
                const removeTimeout = window.setTimeout(
                    () => delAlert(a.id),
                    200
                )
                const tentry = timeouts.get(a.id) || {}
                tentry.removeTimeout = removeTimeout
                timeouts.set(a.id, tentry)
            } else {
                // revert
                alertEl.style.transition =
                    'transform 0.2s ease, opacity 0.2s ease'
                alertEl.style.transform = 'translate(0, 0)'
                alertEl.style.opacity = '1'
            }
            alertEl.style.willChange = 'auto'
        }

        alertEl.addEventListener('touchstart', onTouchStart, { passive: true })
        alertEl.addEventListener('touchmove', onTouchMove, { passive: true })
        alertEl.addEventListener('touchend', onTouchEnd, { passive: true })

        // If the alert was added with zero timeout, don't run animation; keep visible
        if (a.timeout <= 0) {
            line.style.animationPlayState = 'paused'
        }
    })
}
