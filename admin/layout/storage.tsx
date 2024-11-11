import { useSearchParams } from '@solidjs/router'
import { addAlert } from 'comps/alert'
import {
    ChairIcon,
    CloseIcon,
    DeleteIcon,
    ImageIcon,
    MinusIcon,
    PlusIcon,
    UploadIcon,
} from 'icons'
import { MaterialModel } from 'models'
import { httpx } from 'shared'
import { Component, createEffect, createMemo, For, Show } from 'solid-js'
import { createStore, produce, SetStoreFunction } from 'solid-js/store'
import { setPopup } from 'store/popup'

import './style/storage.scss'

export const IMAGE_MIMETYPE = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webm',
]

type stateType = {
    show: boolean
    type: 'edit' | 'add'
    activeItem: MaterialModel

    loading: boolean

    items: MaterialModel[]

    page: number
}

const default_item: MaterialModel = {
    count: 0,
    created_at: 0,
    detail: '',
    name: '',
    id: 0,
    photo: null,
    updated_at: 0,
}

const Storage: Component<{}> = props => {
    const [state, setState] = createStore<stateType>({
        show: false,
        type: 'add',
        activeItem: { ...default_item },

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
                                        onClick={() => {
                                            setState(
                                                produce(s => {
                                                    s.show = true
                                                    s.activeItem = { ...item }
                                                    s.type = 'edit'
                                                })
                                            )
                                        }}
                                        onDel={() => {
                                            httpx({
                                                url: `/api/admin/materials/${item.id}/`,
                                                method: 'DELETE',
                                                onLoad(x) {
                                                    if (x.status != 200) return

                                                    setState(
                                                        produce(s => {
                                                            const index =
                                                                s.items.findIndex(
                                                                    i =>
                                                                        i.id ===
                                                                        item.id
                                                                )

                                                            if (index !== -1) {
                                                                s.items.splice(
                                                                    index,
                                                                    1
                                                                )
                                                            }
                                                        })
                                                    )
                                                },
                                            })
                                        }}
                                    />
                                )}
                            </For>
                        </Show>
                    </div>
                </div>
            </Show>

            <Popup setState={setState} state={state} />
        </div>
    )
}

interface PopupProps {
    state: stateType
    setState: SetStoreFunction<stateType>
}
const Popup: Component<PopupProps> = P => {
    type Pstate = {
        name: string
        newCount: number
        imgUrl: string
        imgFile: File | null

        action: 'add' | 'sold'
    }

    const [state, setState] = createStore<Pstate>({
        name: '',
        newCount: 0,

        imgFile: null,
        imgUrl: '',

        action: 'add',
    })

    // Watch for changes in P.state.activeItem and update local state accordingly
    createEffect(() => {
        setState({
            name: P.state.activeItem.name || '',
            newCount: 0,
            imgUrl: P.state.activeItem.photo || '',
            imgFile: null,
            action: 'add',
        })
    })

    const return_newCount = createMemo((): number =>
        state.action === 'add'
            ? P.state.activeItem.count + state.newCount
            : P.state.activeItem.count - state.newCount
    )

    const close_popup = () => {
        P.setState(
            produce(s => {
                s.show = false
                s.activeItem = { ...default_item }
            })
        )
    }

    function on_submit() {
        if (return_newCount() < 0)
            return addAlert({
                type: 'error',
                timeout: 5,
                content: 'تعداد در انبار نمیتواند منفی باشد!',
                subject: 'خطا!',
            })
        if (state.name.length <= 0)
            return addAlert({
                type: 'error',
                timeout: 5,
                content: 'اسم آیتم نمیتواند خالی باشد!',
                subject: 'خطا!',
            })

        if (P.state.type === 'add') {
            let id

            if (!state.imgFile) {
                return addAlert({
                    type: 'error',
                    timeout: 5,
                    content: 'عکس آیتم نمیتواند خالی باشد!',
                    subject: 'خطا!',
                })
            }

            let data = new FormData()
            data.set('photo', state.imgFile)

            httpx({
                url: '/api/admin/materials/',
                method: 'POST',
                json: {
                    count: return_newCount(),
                    name: state.name,
                    detail: '',
                },
                onLoad(x) {
                    if (x.status != 200) return

                    id = x.response.id

                    P.setState(
                        produce(s => {
                            s.items.unshift(x.response)
                        })
                    )

                    httpx({
                        url: `/api/admin/materials/${id}/photo/`,
                        method: 'PUT',
                        data,
                        onLoad(x) {
                            if (x.status != 200) return

                            P.setState(
                                produce(s => {
                                    s.items[0] = x.response
                                })
                            )
                        },
                    })
                },
            })
        } else {
            let id = P.state.activeItem.id

            if (!state.imgUrl)
                return addAlert({
                    type: 'error',
                    timeout: 5,
                    content: 'عکس آیتم نمیتواند خالی باشد!',
                    subject: 'خطا!',
                })

            httpx({
                url: `/api/admin/materials/${id}/`,
                method: 'PATCH',
                json: {
                    count: return_newCount(),
                    name: state.name,
                    detail: '',
                },
                onLoad(x) {
                    if (x.status != 200) return

                    addAlert({
                        timeout: 5,
                        type: 'success',
                        subject: 'موفق!',
                        content: 'آیتم شما با موفقیت به روز شد!',
                    })

                    P.setState(
                        produce(s => {
                            let index = s.items.findIndex(i => i.id === id)

                            s.items[index] = x.response
                        })
                    )
                },
            })

            if (state.imgFile) {
                let data = new FormData()
                data.set('photo', state.imgFile)

                httpx({
                    url: `/api/admin/materials/${id}/photo/`,
                    method: 'PUT',
                    data,
                    onLoad(x) {
                        if (x.status != 200) return

                        P.setState(
                            produce(s => {
                                let index = s.items.findIndex(i => i.id === id)

                                s.items[index] = x.response
                            })
                        )
                    },
                })
            }
        }

        close_popup()
    }

    return (
        <div
            class='popup-container'
            classList={{ show: P.state.show }}
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

                    on_submit()
                }}
            >
                <button
                    class='close-form'
                    type='button'
                    onclick={() => close_popup()}
                >
                    <CloseIcon />
                </button>

                <div class='data-wrapper'>
                    <div
                        class='img-container'
                        onclick={() => {
                            setState(
                                produce(s => {
                                    s.imgFile = null
                                    s.imgUrl = ''
                                })
                            )
                        }}
                    >
                        <Show
                            when={state.imgUrl || state.imgFile}
                            fallback={
                                <UploadImage
                                    onUpload={file => {
                                        setState(
                                            produce(s => {
                                                s.imgFile = file
                                            })
                                        )
                                    }}
                                />
                            }
                        >
                            <div class='img-wrapper'>
                                <img
                                    src={
                                        state.imgUrl
                                            ? `/record/mp-${P.state.activeItem.id}-${state.imgUrl}`
                                            : URL.createObjectURL(state.imgFile)
                                    }
                                />
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
                            value={state.name}
                            oninput={e => setState({ name: e.target.value })}
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
                                            if (s.newCount >= 1) s.newCount -= 1
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
    onDel: () => void
}
const Item: Component<ItemProps> = P => {
    return (
        <div class='item' onclick={P.onClick}>
            <div class='img-container  '>
                <Show when={P.photo} fallback={<ImageIcon />}>
                    <img src={`/record/mp-${P.id}-${P.photo}`} alt='' />
                </Show>
            </div>

            <div class='data-wrapper'>
                <div></div>

                <div class='item-count'>{P.count}</div>

                <div class='item-name'>{P.name}</div>
            </div>

            <button
                class='delete-cta'
                onclick={e => {
                    e.stopImmediatePropagation()
                    e.stopPropagation()

                    setPopup({
                        show: true,
                        title: 'حذف آیتم',
                        type: 'error',
                        Icon: () => <DeleteIcon />,
                        content: 'از حذف آیتم در انبار مطمعنید؟',
                        onSubmit: () => P.onDel(),
                    })
                }}
            >
                حذف از انبار
                <DeleteIcon />
            </button>
        </div>
    )
}

export default Storage
