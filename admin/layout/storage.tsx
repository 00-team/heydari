import { useSearchParams } from '@solidjs/router'
import { ImageIcon } from 'icons'
import { MaterialModel } from 'models'
import { httpx } from 'shared'
import { Component, createEffect, For, onMount, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import './style/storage.scss'

const Storage: Component<{}> = props => {
    type stateType = {
        show: boolean
        img: string | null
        title: string | null
        count: number

        loading: boolean

        items: MaterialModel[]

        page: number
    }

    const [state, setState] = createStore<stateType>({
        show: false,
        title: '',
        img: null,
        count: 0,

        items: [],
        loading: true,

        page: 0,
    })

    const [params, setParams] = useSearchParams()

    createEffect(() => fetch_items(parseInt(params.page || '0') || 0))

    onMount(() => {})

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

    return (
        <div class='storage-container' classList={{ loading: state.loading }}>
            <Show when={!state.loading} fallback={<LoadingItems />}>
                <button class='main-cta'>Add Item</button>
                <div class='storage-items'>
                    <For each={state.items}>{item => <Item {...item} />}</For>
                </div>
            </Show>
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
