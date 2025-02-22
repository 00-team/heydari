import { LoadingElem } from 'comps'
import {
    ChairIcon,
    CodeIcon,
    InternetIcon,
    NameIcon,
    NoPhotoIcon,
    PlusIcon,
    PriceIcon,
    StarFillIcon,
    StarIcon,
    Table2Icon,
    TrashIcon,
} from 'icons'
import { httpx } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    For,
    JSX,
    Show,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { setPopup } from 'store/popup'
import { state, setState } from './shared'

export const PopupOverview: Component = () => {
    type localType = {
        active: number
    }
    const [local, setLocal] = createStore<localType>({
        active: 0,
    })

    function photo_del(idx: number) {
        let p = state.popup.product
        if (!p) return

        if (state.popup.type === 'add') {
            setState(
                produce(s => {
                    s.popup.files = s.popup.files.filter(
                        (_, idx1) => idx !== idx1
                    )
                })
            )

            return
        }

        setState(
            produce(s => {
                let index = s.products.findIndex(i => i.slug === p.slug)
                if (index < 0) return

                s.products[index]!.photos.splice(idx, 1).filter(s => s)

                s.popup.product.photos.splice(idx, 1).filter(s => s)
            })
        )

        httpx({
            url: `/api/admin/products/${p.id}/photos/${idx}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return
            },
        })
    }

    async function upload_files(
        e: Event & {
            currentTarget: HTMLInputElement
            target: HTMLInputElement
        }
    ) {
        const el = e.target

        const id = state.popup.product.id

        if (!el.files || el.files.length == 0) return

        if (state.popup.type === 'add') {
            for (let f of el.files) {
                setState(
                    produce(s => {
                        s.popup.files.push(f)
                    })
                )
            }

            return
        }

        for (let f of el.files) {
            await new Promise((_, reject) => {
                let data = new FormData()
                data.set('photo', f)

                let loadingId = performance.now()

                setState(
                    produce(s => {
                        s.popup.product.photos.push(`loading ${loadingId}`)
                    })
                )

                httpx({
                    url: `/api/admin/products/${id}/photos/`,
                    method: 'PUT',
                    data,
                    reject,
                    onLoad(x) {
                        if (x.status != 200) return

                        setState(
                            produce(s => {
                                let index = s.products.findIndex(
                                    i => i.id === id
                                )

                                if (index < 0) return

                                s.products[index]!.photos = x.response.photos

                                if (s.popup.product.id === x.response.id) {
                                    s.popup.product.photos.filter(s =>
                                        s.includes('loading')
                                    )
                                    s.popup.product.photos = x.response.photos
                                }
                            })
                        )
                    },
                })
            })
        }
    }

    const images = createMemo((): string[] => {
        if (state.popup.type === 'add') {
            return state.popup.files.map(img => URL.createObjectURL(img))
        }

        return state.popup.product?.photos || []
    })

    return (
        <div class='overview' classList={{ hide: state.popup.advanced }}>
            <aside class='imgs-container'>
                <div class='divs-wrapper'>
                    <button
                        class='best-product title_small'
                        type='button'
                        classList={{ active: state.popup.product?.best }}
                        onclick={() => {
                            setState(
                                produce(s => {
                                    s.popup.product.best = !s.popup.product.best
                                })
                            )
                        }}
                    >
                        <div class='is-best isnt'>
                            <StarIcon />
                            <span>جزو بهترین ها</span>
                        </div>
                        <div class='is-best is'>
                            <StarFillIcon />
                            <span>جزو بهترین ها</span>
                        </div>
                    </button>
                    <div class='imgs-wrapper'>
                        <div class='active-img'>
                            <Show
                                when={images()[local.active]}
                                fallback={<NoPhotoIcon />}
                            >
                                <Show
                                    when={images()[local.active]!.startsWith(
                                        'blob:'
                                    )}
                                    fallback={
                                        <img
                                            src={`/record/pp-${state.popup.product?.id}-${
                                                state.popup.product.photos[
                                                    local.active
                                                ]
                                            }`}
                                            loading='lazy'
                                            decoding='async'
                                            alt=''
                                        />
                                    }
                                >
                                    <img
                                        src={images()[local.active]}
                                        loading='lazy'
                                        decoding='async'
                                        alt=''
                                    />
                                </Show>

                                <button
                                    type='button'
                                    class='delete-image'
                                    onclick={() => {
                                        setPopup({
                                            show: true,
                                            Icon: () => <TrashIcon />,
                                            content:
                                                'این عمل قابل بازگشت نیست!',
                                            title: 'حذف عکس؟',
                                            type: 'error',
                                            onSubmit() {
                                                photo_del(local.active)
                                                setLocal({ active: 0 })
                                            },
                                        })
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            </Show>
                        </div>
                        <div class='other-imgs'>
                            <label class='add-img' for='popup-add-img'>
                                <input
                                    type='file'
                                    multiple
                                    id='popup-add-img'
                                    accept='.png, .jpg, .jpeg, .webp'
                                    onchange={upload_files}
                                />
                                <PlusIcon />
                            </label>
                            <For each={images()}>
                                {(img, index) => (
                                    <Show
                                        when={!img.startsWith('blob:')}
                                        fallback={
                                            <div
                                                class='other-img'
                                                onclick={() => {
                                                    setLocal({
                                                        active: index(),
                                                    })
                                                }}
                                            >
                                                <img
                                                    src={img}
                                                    loading='lazy'
                                                    decoding='async'
                                                    alt=''
                                                />
                                            </div>
                                        }
                                    >
                                        <Show
                                            when={!img.startsWith('loading')}
                                            fallback={
                                                <LoadingElem class='other-img' />
                                            }
                                        >
                                            <div
                                                class='other-img'
                                                onclick={() => {
                                                    setLocal({
                                                        active: index(),
                                                    })
                                                }}
                                            >
                                                <img
                                                    src={`/record/pp-${state.popup.product?.id}-${img}`}
                                                    loading='lazy'
                                                    decoding='async'
                                                    alt=''
                                                />
                                            </div>
                                        </Show>
                                    </Show>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
                <div
                    class='product-kind'
                    classList={{
                        active: state.popup.product?.kind === 'table',
                        hide: !state.popup.product?.kind,
                        disable: state.popup?.type === 'edit',
                    }}
                >
                    <button
                        class='kind'
                        type='button'
                        onclick={() => {
                            setState(
                                produce(s => {
                                    s.popup.product.kind = 'chair'
                                })
                            )
                        }}
                    >
                        <ChairIcon />
                    </button>
                    <button
                        class='kind'
                        type='button'
                        onclick={() => {
                            setState(
                                produce(s => {
                                    s.popup.product.kind = 'table'
                                })
                            )
                        }}
                    >
                        <Table2Icon />
                    </button>
                </div>
            </aside>

            <aside class='data-container'>
                <FloatInput
                    Icon={<NameIcon />}
                    holder='اسم محصول'
                    value={state.popup.product.name}
                    onChange={e =>
                        setState(
                            produce(s => {
                                s.popup.product.name = e
                            })
                        )
                    }
                    class='description'
                    inpClass='title_smaller'
                    inpMode='str'
                />
                <FloatInput
                    Icon={<InternetIcon />}
                    holder='URL'
                    value={state.popup.product.slug}
                    onChange={e =>
                        setState(
                            produce(s => {
                                s.popup.product.slug = e
                            })
                        )
                    }
                    class='description'
                    inpClass='title_smaller'
                    inpMode='str'
                />
                <div class='inputs'>
                    <FloatInput
                        Icon={<PriceIcon />}
                        holder='قیمت (ریال)'
                        value={state.popup.product.price.toString()}
                        onChange={e => {
                            setState(
                                produce(s => {
                                    s.popup.product.price = parseInt(e) || 0
                                })
                            )
                        }}
                        class='price description'
                        inpClass='title_smaller'
                        inpMode='num'
                    />
                    <FloatInput
                        Icon={<CodeIcon />}
                        holder='کد محصول'
                        value={state.popup.product.code}
                        onChange={e =>
                            setState(
                                produce(s => {
                                    s.popup.product.code = e
                                })
                            )
                        }
                        class='code description'
                        inpClass='title_smaller'
                        inpMode='str'
                    />
                </div>

                <textarea
                    name=''
                    id=''
                    cols='30'
                    class='description'
                    rows='10'
                    value={state.popup.product.description}
                    oninput={e =>
                        setState(
                            produce(s => {
                                s.popup.product.description = e.target.value
                            })
                        )
                    }
                    placeholder='توضیحات خلاصه...'
                ></textarea>
            </aside>
        </div>
    )
}

interface FloatInputProps {
    inpClass?: string
    class?: string

    holder: string
    Icon: JSX.Element

    value: string
    onChange(value: string): void

    inpMode: 'str' | 'num'
}
const FloatInput: Component<FloatInputProps> = P => {
    const [active, setActive] = createSignal(false)

    createEffect(() => {
        if (P.value && state.popup.show) {
            setActive(true)
        } else {
            setActive(false)
        }
    })

    return (
        <div
            class={`finput-container ${P.class || ''}`}
            classList={{ active: active() }}
        >
            <div class='holder'>
                {P.Icon}
                {P.holder}
            </div>
            <input
                value={P.value}
                onfocus={() => setActive(true)}
                onblur={() => {
                    if (!P.value) setActive(false)
                }}
                type={P.inpMode === 'num' ? 'number' : 'text'}
                inputmode={P.inpMode === 'num' ? 'numeric' : 'text'}
                class={`finput ${P.inpClass || ''}`}
                oninput={e => P.onChange(e.target.value)}
            />
        </div>
    )
}
