import { addAlert } from 'comps/alert'
import { HoverInp } from 'comps/hoverInp'
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
    TrashCrossIcon,
} from 'icons'
import { httpx, validate_image_format } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    For,
    onCleanup,
    onMount,
    Show,
} from 'solid-js'
import { createStore, produce, unwrap } from 'solid-js/store'
import { setPopup } from 'store/popup'
import { setState, state } from './shared'

export const PopupOverview: Component = () => {
    type localType = {
        active: number
    }
    const [local, setLocal] = createStore<localType>({
        active: 0,
    })

    createEffect(() => {
        if (!state.popup.show) {
            setLocal({ active: 0 })
        }
    })

    onMount(() => {
        let ac = new AbortController()

        document.addEventListener('dragover', e => {
            if (!state.popup.show) return

            e.preventDefault()
        })

        document.addEventListener('drop', file_draged)

        onCleanup(() => {
            ac.abort()
        })
    })

    function file_draged(e: DragEvent) {
        if (!state.popup.show) return

        e.preventDefault()

        if (!e.dataTransfer) return

        const list = e.dataTransfer.files
        if (!list || list.length === 0) return

        for (let file of list) {
            if (!validate_image_format(file)) continue
            if (file.size == 0) continue
            if (is_dup(file)) continue

            setState(
                produce(s => {
                    s.popup.files.push({
                        file: file,
                        url: URL.createObjectURL(file),
                    })
                })
            )
        }
    }

    function photo_del(url: string, pdx: number) {
        if (state.popup.type == 'add') {
            setState(
                produce(s => {
                    s.popup.files.splice(pdx, 1)
                })
            )

            return
        }

        if (!url) return

        let p = unwrap(state.popup)

        let index = state.popup.files.findIndex(file => file.url == url)
        let proIndex = state.products.findIndex(pr => pr.id == p.product.id)

        if (index == -1 || proIndex == -1) return

        let file = state.popup.files[index]

        setState(
            produce(s => {
                s.popup.files.splice(index, 1)

                s.popup.product.photos = s.popup.product.photos.filter(
                    img => img !== url
                )

                if (!s.products[proIndex]) return

                s.products[proIndex]!.photos = s.products[
                    proIndex
                ]!.photos.filter(img => img !== url)
            })
        )

        if (file!.url!.startsWith('blob:')) return

        httpx({
            url: `/api/admin/products/${p.product.id}/photos/${index}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return

                setLocal({ active: 0 })
            },
        })
    }

    async function upload_files(
        e: Event & {
            currentTarget: HTMLInputElement
            target: HTMLInputElement
        }
    ) {
        const el = e.currentTarget

        if (!el.files || el.files.length == 0) return

        for (let f of el.files) {
            setState(
                produce(s => {
                    s.popup.files.push({
                        file: f,
                        url: URL.createObjectURL(f),
                    })
                })
            )
        }
    }

    function is_dup(file: File): boolean {
        let found = Object.values(state.popup.files).some(
            f => f.file?.name == file.name && f.file?.size == file.size
        )
        if (found) {
            addAlert({
                type: 'error',
                timeout: 5,
                content: 'از گذاشتن عکس تکراری خودداری کنید',
                subject: 'خطا!',
            })
            return true
        }

        return false
    }

    const images = createMemo(() => {
        return state.popup.files.filter(s => s.url).map(s => s.url)
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
                                            src={`/record/pp-${state.popup.product.id}-${
                                                state.popup.product.photos[
                                                    local.active
                                                ]
                                            }`}
                                            loading='lazy'
                                            decoding='async'
                                            alt=''
                                            draggable='false'
                                        />
                                    }
                                >
                                    <img
                                        src={images()[local.active]!}
                                        loading='lazy'
                                        decoding='async'
                                        alt=''
                                        draggable='false'
                                    />
                                </Show>

                                <button
                                    type='button'
                                    class='delete-image'
                                    onclick={() => {
                                        setPopup({
                                            show: true,
                                            Icon: () => <TrashCrossIcon />,
                                            content:
                                                'این عمل قابل بازگشت نیست!',
                                            title: 'حذف عکس؟',
                                            type: 'error',
                                            onSubmit() {
                                                photo_del(
                                                    images()[local.active]!,
                                                    local.active
                                                    // images()[local.active]!
                                                )
                                                setLocal({ active: 0 })
                                            },
                                        })
                                    }}
                                >
                                    <TrashCrossIcon />
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
                                        when={!img!.startsWith('blob:')}
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
                                                    src={img!}
                                                    loading='lazy'
                                                    decoding='async'
                                                    alt=''
                                                    draggable='false'
                                                />
                                            </div>
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
                                                src={`/record/pp-${state.popup.product.id}-${img}`}
                                                loading='lazy'
                                                decoding='async'
                                                alt=''
                                                draggable='false'
                                            />
                                        </div>
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
                <HoverInp
                    Icon={<NameIcon />}
                    holder='اسم محصول'
                    acitve={!!state.popup.product.name}
                    value={state.popup.product.name}
                    onInp={e =>
                        setState(
                            produce(s => {
                                s.popup.product.name = e
                            })
                        )
                    }
                    inpType='text'
                />
                <HoverInp
                    Icon={<InternetIcon />}
                    holder='URL'
                    acitve={!!state.popup.product.slug}
                    value={state.popup.product.slug}
                    onInp={e => {
                        let val = e.replaceAll(' ', '-')

                        setState(
                            produce(s => {
                                s.popup.product.slug = val
                            })
                        )
                    }}
                    inpType='username'
                />
                <div class='inputs'>
                    <HoverInp
                        Icon={<PriceIcon />}
                        holder='قیمت (تومان)'
                        acitve={true}
                        value={String(state.popup.product.price || 0)}
                        onInp={e => {
                            setState(
                                produce(s => {
                                    s.popup.product.price = parseInt(e) || 0
                                })
                            )
                        }}
                        format
                        inpType='number'
                    />
                    <HoverInp
                        Icon={<CodeIcon />}
                        acitve={!!state.popup.product.code}
                        holder='کد محصول'
                        value={state.popup.product.code}
                        onInp={e => {
                            let val = e.replaceAll(' ', '-')

                            setState(
                                produce(s => {
                                    s.popup.product.code = val
                                })
                            )
                        }}
                        inpType='text'
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
