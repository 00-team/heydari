import { useSearchParams } from '@solidjs/router'
import { ChairIcon, CloseIcon, ImageIcon } from 'icons'
import { MaterialModel } from 'models'
import { httpx } from 'shared'
import { Component, createEffect, For, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import './style/storage.scss'

const Storage: Component<{}> = props => {
    type stateType = {
        show: boolean
        img: string | null
        name: string | null
        count: number

        loading: boolean

        items: MaterialModel[]

        page: number
    }

    const [state, setState] = createStore<stateType>({
        show: false,
        name: '',
        img: null,
        count: 0,

        items: [],
        loading: true,

        page: 0,
    })

    const [params, setParams] = useSearchParams()

    createEffect(() => fetch_items(parseInt(params.page || '0') || 0))

    function fetch_items(page: number) {
        setParams({ page })

        httpx({
            url: '/api/admin/materials/',
            params: { page },
            method: 'GET',
            onLoad(x) {
                if (x.status != 200) return

                setState(
                    produce(s => {
                        s.items = x.response
                        s.loading = false
                    })
                )
            },
        })
    }

    const close_popup = () => {
        setState(
            produce(s => {
                s.show = false
                s.name = ''
                s.img = null
                s.count = 0
            })
        )
    }

    return (
        <div class='storage-container' classList={{ loading: state.loading }}>
            <Show when={!state.loading} fallback={<LoadingItems />}>
                <div class='storage-wrapper'>
                    <button
                        class='main-cta'
                        onclick={() => setState({ show: true })}
                    >
                        Add Item
                    </button>
                    <div class='storage-items'>
                        <Show
                            when={state.items.length >= 1}
                            fallback={
                                <div class='empty-storage'>انبار خالی است!</div>
                            }
                        >
                            <For each={state.items}>
                                {item => <Item {...item} />}
                            </For>
                        </Show>
                    </div>
                </div>
            </Show>

            <div
                class='popup-container'
                classList={{ show: state.show }}
                onclick={() => close_popup()}
            >
                <form
                    class='popup-wrapper'
                    onclick={e => {
                        e.stopImmediatePropagation()
                        e.stopPropagation()
                    }}
                    onsubmit={e => {
                        e.preventDefault()
                    }}
                >
                    <button class='close-form' onclick={() => close_popup()}>
                        <CloseIcon />
                    </button>

                    <div class='data-wrapper'>
                        <div class='img-container'>
                            <Show when={state.img}>
                                <img src={state.img} />
                            </Show>
                        </div>
                        <div class='count'>
                            <span>{state.count.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    <div class='inps-wrapper'>
                        <div class='inp-wrapper'>
                            <div class='holder'>
                                <ChairIcon />
                                اسم آیتم
                            </div>

                            <input
                                type='text'
                                class='name-inp'
                                placeholder='اسم آیتم...'
                                value={state.name || ''}
                                oninput={e =>
                                    setState({ name: e.target.value })
                                }
                            />
                        </div>

                        <button class='popup-cta' type='submit'>
                            تایید
                        </button>
                    </div>

                    {/* 
                    <input
                        type='nunmber'
                        inputMode='numeric'
                        class='count-inp'
                    />

                    <div class='count-action'></div>

                    <button class='poopup-cta'></button> */}
                </form>
            </div>
        </div>
    )
}

const LoadingItems: Component = P => {
    return (
        <div class='loading'>
            <button class='main-cta'>Add Item</button>
            <div class='loading-wrapper'>
                <div class='loading-dots'>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p>لطفا صبر کنید...</p>
            </div>
        </div>
    )
}

const Item: Component<MaterialModel> = P => {
    return (
        <div class='item'>
            <div class='img-container  '>
                {P.photo ? (
                    <img src='https://picsum.photos/300/300' alt='' />
                ) : (
                    <ImageIcon />
                )}
            </div>

            <div class='data-wrapper'>
                <div></div>

                <div class='item-count'>{P.count}</div>

                <div class='item-name'>{P.name}</div>
            </div>
        </div>
    )
}

export default Storage
