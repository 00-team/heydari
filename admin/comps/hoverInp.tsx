import { Component, createMemo, JSX, onCleanup, onMount } from 'solid-js'

import { CloseIcon } from 'icons'
import './style/hoverinp.scss'

type hoverInpProps = {
    ref?: (el: HTMLInputElement) => void
    holder: string
    acitve: boolean
    Icon: JSX.Element

    class?: string
    id?: string

    disable?: boolean
    format?: boolean
    name?: string

    max_length?: number

    inpType: 'text' | 'number' | 'username'
    value: string
    onInp(e: string): void

    autoCmp?: string
    showClear?: boolean

    onClear?(): void
    onEnter?(): void
}

function sanitize(value: string) {
    return value.replace(/\s/g, '_')
}
function unformatNumber(s: string) {
    // keep digits, dot and minus (if you want negatives/decimals)
    return (s ?? '').toString().replace(/[^\d.-]/g, '')
}
function formatNumber(raw: string) {
    if (!raw) return ''
    const n = Number(unformatNumber(raw))
    if (!isFinite(n)) return raw
    return n.toLocaleString()
}

export const HoverInp: Component<hoverInpProps> = P => {
    let inputEl: HTMLInputElement | undefined

    onMount(() => {
        if (!P.onEnter) return

        const ac = new AbortController()

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || (e as any).keyCode === 13) {
                e.preventDefault()
                P.onEnter!()
            }
        }
        inputEl?.addEventListener('keydown', handler, { signal: ac.signal })

        onCleanup(() => ac.abort())
    })

    const inpType = createMemo(() => {
        // keep input type TEXT when formatting is on (so commas can be shown)
        if (P.format) return 'text'
        if (P.inpType == 'number') return 'number'
        return 'text'
    })

    const dir = createMemo(() => {
        if (P.inpType == 'username') return 'ltr'

        return 'auto'
    })

    // displayed value (formatted if requested)
    const displayed = createMemo(() => {
        if (P.format) {
            return formatNumber(P.value)
        }
        return P.value
    })

    return (
        <div
            class={`hover-inp `}
            id={`${P.id || ''}`}
            classList={{
                active: P.acitve,
                disabled: P.disable,
                [P.class || '']: true,
            }}
        >
            <div class='holder description'>
                {P.Icon}
                {P.holder}
            </div>

            <input
                ref={el => {
                    inputEl = el as HTMLInputElement
                    P.ref?.(el)
                }}
                type={inpType()}
                class='title_smaller'
                classList={{ username: P.inpType == 'username' }}
                autocomplete={!P.autoCmp ? 'new-password' : P.autoCmp}
                value={displayed()}
                maxLength={P.max_length || undefined}
                oninput={e => {
                    const el = e.currentTarget as HTMLInputElement

                    if (P.inpType === 'username') {
                        const raw = el.value
                        const caretBefore = el.selectionStart ?? raw.length

                        const sanitized = sanitize(raw)
                        if (sanitized !== raw) {
                            el.value = sanitized
                            try {
                                el.setSelectionRange(caretBefore, caretBefore)
                            } catch {}
                        }
                        P.onInp(sanitized)
                        return
                    }

                    if (P.format) {
                        // current displayed string user typed (may contain commas)
                        const rawTyped = el.value
                        // previous raw value (unformatted) from props
                        const prevRaw = P.value ?? ''
                        const prevFormatted = formatNumber(prevRaw)
                        const newRaw = unformatNumber(rawTyped) // what we will store
                        // call parent with unformatted numeric string
                        P.onInp(newRaw)

                        // Adjust caret: schedule after render so formatted value has been applied
                        const caretBefore = el.selectionStart ?? rawTyped.length
                        // compute how many separators before caret in prev vs next formatted
                        const nextFormatted = formatNumber(newRaw)
                        const prevCommasBefore = (
                            prevFormatted.slice(0, caretBefore).match(/,/g) ||
                            []
                        ).length
                        const nextCommasBefore = (
                            nextFormatted.slice(0, caretBefore).match(/,/g) ||
                            []
                        ).length
                        const diff = nextCommasBefore - prevCommasBefore
                        const desired = Math.max(0, caretBefore + diff)

                        // after next tick the input value will be re-rendered to the formatted version.
                        // use setTimeout 0 to move caret after DOM update.
                        setTimeout(() => {
                            try {
                                inputEl?.setSelectionRange(desired, desired)
                            } catch {}
                        }, 0)

                        return
                    }

                    // default (no formatting)
                    P.onInp(e.currentTarget.value)
                }}
                name={P.name}
                dir={dir()}
                // @ts-ignore
                style={{ direction: dir() }}
                disabled={P.disable}
                onwheel={e => e.currentTarget.blur()}
                onkeydown={e => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault()
                    }
                }}
            />

            <button
                type='button'
                class='clear-icon icon'
                onclick={() => {
                    P.onClear && P.onClear()
                }}
                tabIndex={-1}
                classList={{ active: P.showClear }}
            >
                <CloseIcon />
            </button>
        </div>
    )
}
