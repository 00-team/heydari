import { ChevronDownIcon, ChevronUpIcon } from 'icons'
import { Show, createEffect, on } from 'solid-js'
import { createStore } from 'solid-js/store'
import './style/select.scss'

type BaseItem = { display: string; idx: number }

type Props<T extends BaseItem> = {
    items: T[]
    onChange(props: T): void
    default?: T
    disabled?: boolean
}

export const Select = <T extends BaseItem>(P: Props<T>) => {
    type State = {
        open: boolean
        selected: T
        // changed: number
    }
    const [state, setState] = createStore<State>({
        open: false,
        selected: P.default || P.items[0],
        // changed: 0,
    })

    createEffect(
        on(
            () => state.selected,
            () => P.onChange(state.selected),
            { defer: true }
        )
    )

    createEffect(() => setState({ selected: P.default }))

    createEffect(() => {
        if (P.disabled) setState({ open: false })
    })

    return (
        <div class='cmp-select' classList={{ disabled: P.disabled }}>
            <div
                class='cmp-select-head'
                onclick={() =>
                    !P.disabled && setState(s => ({ open: !s.open }))
                }
            >
                {state.selected.display}
                <Show when={!P.disabled}>
                    {state.open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Show>
            </div>
            <div class='cmp-select-body' classList={{ active: state.open }}>
                {P.items.map(item => (
                    <div
                        class='item'
                        classList={{
                            active: state.selected.idx == item.idx,
                        }}
                        onclick={() => setState({ selected: item })}
                    >
                        {item.display}
                    </div>
                ))}
            </div>
        </div>
    )
}
