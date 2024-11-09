import { ImageIcon } from 'icons'
import { MaterialModel } from 'models'
import { Component, For, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import './style/storage.scss'

const Storage: Component<{}> = props => {
    type stateType = {
        show: boolean
        img: string | null
        title: string | null
        count: number

        loading: boolean

        items: MaterialModel[]
    }

    const [state, setState] = createStore<stateType>({
        show: false,
        title: '',
        img: null,
        count: 0,

        loading: true,

        items: [],
    })

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
