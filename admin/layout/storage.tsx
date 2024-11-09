import { ImageIcon } from 'icons'
import { MaterialModel } from 'models'
import { Component, For } from 'solid-js'
import { createStore } from 'solid-js/store'

import './style/storage.scss'

const Storage: Component<{}> = props => {
    type state = {
        show: boolean
        img: string | null
        title: string | null
        count: number

        items: MaterialModel[]
    }

    const [state, setState] = createStore<state>({
        show: false,
        title: '',
        img: null,
        count: 0,

        items: [
            {
                count: 100,
                created_at: 100,
                detail: '',
                id: 1,
                name: 'لورم ایپسوم',
                photo: '',
                updated_at: 1000,
            },
        ],
    })

    return (
        <div class='storage-container'>
            <button class='main-cta'>Add Item</button>
            <div class='storage-items'>
                <For each={state.items}>{item => <Item {...item} />}</For>
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
