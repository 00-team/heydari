import { useSearchParams } from '@solidjs/router'
import { addAlert } from 'comps/alert'
import { ChairIcon, CloseIcon, MinusIcon, PlusIcon, UploadIcon } from 'icons'
import { MaterialModel } from 'models'
import { httpx } from 'shared'
import { Component, createEffect, createMemo, For, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import './style/storage.scss'

export const IMAGE_MIMETYPE = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webm',
]

const Storage: Component<{}> = props => {
    type stateType = {
        show: boolean
        type: 'add' | 'edit'
        name: string | null
        img: File | null
        count: number
        newCount: number
        action: 'add' | 'sold'

        loading: boolean

        items: MaterialModel[]

        page: number
    }

    const [state, setState] = createStore<stateType>({
        show: false,
        type: 'add',
        name: '',
        img: null,
        count: 0,
        newCount: 0,
        action: 'add',

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

    const return_newCount = createMemo((): number =>
        state.action === 'add'
            ? state.count + state.newCount
            : state.count - state.newCount
    )

    const close_popup = () => {
        setState(
            produce(s => {
                s.show = false
                s.type = 'add'
                s.name = ''
                s.img = null
                s.count = 0
                s.newCount = 0
                s.action = 'add'
            })
        )
    }

    function save_add_item() {
        if (state.type === 'add') {
            httpx({
                url: '/api/admin/materials/',
                method: 'POST',
                json: {
                    name: state.name,
                    count: return_newCount(),
                    detail: '',
                },
                onLoad(x) {
                    if (x.status != 200) return

                    setState(
                        produce(s => {
                            let newitems = [...s.items, { ...x.response }]
                            s.items = newitems
                        })
                    )
                },
            })
        } else {
        }
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
                                {(item, index) => (
                                    <Item
                                        {...item}
                                        onClick={() =>
                                            setState(
                                                produce(s => {
                                                    s.show = true
                                                    s.type = 'edit'

                                                    s = { ...item }
                                                })
                                            )
                                        }
                                    />
                                )}
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

                        if (state.name.length <= 0)
                            return addAlert({
                                type: 'error',
                                timeout: 5,
                                content: 'اسم نمیتواند خالی باشد!',
                                subject: 'خطا!',
                            })
                        if (return_newCount() < 0)
                            return addAlert({
                                type: 'error',
                                timeout: 5,
                                content: 'تعداد آیتم نمیتواند منفی باشد!',
                                subject: 'خطا!',
                            })

                        save_add_item()

                        close_popup()
                    }}
                >
                    <button class='close-form' onclick={() => close_popup()}>
                        <CloseIcon />
                    </button>

                    <div class='data-wrapper'>
                        <div class='img-container'>
                            <Show
                                when={state.img}
                                fallback={
                                    <UploadImage
                                        onUpload={file =>
                                            setState({ img: file })
                                        }
                                    />
                                }
                            >
                                <div
                                    class='img-wrapper'
                                    onclick={() => setState({ img: null })}
                                >
                                    <img src={URL.createObjectURL(state.img)} />
                                    <div class='clear-img'>
                                        <CloseIcon />
                                    </div>
                                </div>
                            </Show>
                        </div>
                        <div
                            class='count'
                            classList={{
                                error: return_newCount() < 0,
                            }}
                        >
                            <span>{return_newCount().toLocaleString()}</span>
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

                        <div class='counter-update'>
                            <div class='main-inp'>
                                <button
                                    type='button'
                                    class='icon plus'
                                    onclick={() =>
                                        setState(
                                            produce(s => {
                                                s.newCount += 1
                                            })
                                        )
                                    }
                                >
                                    <PlusIcon />
                                </button>
                                <input
                                    type='number'
                                    inputMode='numeric'
                                    min={0}
                                    maxLength={20}
                                    value={state.newCount}
                                    placeholder={'تعداد...'}
                                    oninput={e => {
                                        if (e.target.value.length >= 10)
                                            return e.preventDefault()

                                        let value = Math.ceil(
                                            e.target.valueAsNumber
                                        )

                                        setState({ newCount: value || 0 })
                                    }}
                                />
                                <button
                                    type='button'
                                    class='icon minus'
                                    onclick={() =>
                                        setState(
                                            produce(s => {
                                                if (s.newCount >= 1)
                                                    s.newCount -= 1
                                            })
                                        )
                                    }
                                >
                                    <MinusIcon />
                                </button>
                            </div>
                            <div
                                class='counter-action'
                                classList={{ sold: state.action === 'sold' }}
                            >
                                <button
                                    class='action added'
                                    onclick={() => setState({ action: 'add' })}
                                    type='button'
                                >
                                    اضافه
                                </button>
                                <button
                                    class='action sold'
                                    onclick={() => setState({ action: 'sold' })}
                                    type='button'
                                >
                                    فروش
                                </button>
                            </div>
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

interface UploadImageProps {
    onUpload: (file: File) => void
}
const UploadImage: Component<UploadImageProps> = P => {
    return (
        <label
            class='upload-image'
            for='image-upload-inp'
            ondragenter={e => e.preventDefault()}
            ondragleave={e => e.preventDefault()}
            ondragover={e => e.preventDefault()}
            ondrop={e => {
                e.preventDefault()

                let file = e.dataTransfer.files[0]

                if (!IMAGE_MIMETYPE.includes(file.type))
                    return addAlert({
                        type: 'error',
                        timeout: 5,
                        content: 'فرمت واردی باید عکس باشد!',
                        subject: 'خطا!',
                    })

                P.onUpload(file)
            }}
        >
            <input
                type='file'
                id='image-upload-inp'
                accept='.jpg, .jpeg, .png, image/jpg, image/jpeg, image/png'
                onchange={e => {
                    if (!e.target.files || !e.target.files[0]) return

                    const file = e.target.files[0]

                    if (!IMAGE_MIMETYPE.includes(file.type))
                        return addAlert({
                            type: 'error',
                            timeout: 5,
                            content: 'فرمت واردی باید عکس باشد!',
                            subject: 'خطا!',
                        })

                    P.onUpload(file)
                }}
            />

            <UploadIcon />

            <p>آپلود عکس</p>

            <span>فایل خود را اینجا بندازید یا کلیک کنید!</span>
        </label>
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

interface ItemProps extends MaterialModel {
    onClick: () => void
}
const Item: Component<ItemProps> = P => {
    return (
        <div class='item' onclick={P.onClick}>
            <div class='img-container  '>
                <img src={P.photo} alt='' />
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
