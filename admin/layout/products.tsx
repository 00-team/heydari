import { useSearchParams } from '@solidjs/router'
import { LoadingElem, Select } from 'comps'
import { addAlert } from 'comps/alert'
import {
    ArmchairIcon,
    ChairIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CloseIcon,
    CodeIcon,
    ExternalLinkIcon,
    InternetIcon,
    NameIcon,
    NoPhotoIcon,
    PlusIcon,
    PriceIcon,
    RotateCcwIcon,
    SaveIcon,
    SearchIcon,
    StarFillIcon,
    StarIcon,
    Table2Icon,
    TableIcon,
    TrashIcon,
    WarningIcon,
} from 'icons'
import { EMPTY_PRODUCT, ProductModel, ProductTagModel } from 'models'
import { httpx, Perms } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    createUniqueId,
    For,
    JSX,
    Match,
    onCleanup,
    onMount,
    Show,
    Switch,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { self } from 'store'
import { setPopup } from 'store/popup'
import './style/products.scss'

type TagState = {
    [k in ProductTagModel['kind']]: {
        [k in ProductTagModel['part']]: ProductTagModel[]
    }
}
const [tags, setTags] = createStore<TagState>({
    chair: { leg: [], bed: [] },
    table: { leg: [], bed: [] },
})

type popupType = {
    show: boolean
    type: 'edit' | 'add'
    product: ProductModel
    advanced: boolean

    errorSec: 'name' | 'slug' | 'code' | 'id' | 'img' | 'description'
    errorText: string

    files: File[]
}

type filtersType = {
    best: boolean
    onlyChair: boolean
    onlyTable: boolean
}

type stateType = {
    search: string

    filters: filtersType

    popup: popupType

    products: ProductModel[]
    page: number
    loading: boolean
}
const [state, setState] = createStore<stateType>({
    search: '',
    filters: {
        best: false,
        onlyChair: false,
        onlyTable: false,
    },
    popup: {
        show: false,
        type: 'add',
        product: null,
        advanced: false,

        errorSec: 'name',
        errorText: '',

        files: [],
    },

    products: [],
    page: 0,
    loading: true,
})

export default () => {
    const [params, setParams] = useSearchParams()

    onMount(() => load_tags(0))

    function load_tags(page: number) {
        httpx({
            url: '/api/admin/product-tags/',
            method: 'GET',
            params: { page },
            onLoad(x) {
                if (x.status != 200) return
                let tags: ProductTagModel[] = x.response
                if (tags.length == 0) return
                setTags(
                    produce(s => {
                        tags.forEach(t => {
                            s[t.kind][t.part].push(t)
                        })
                    })
                )
                if (tags.length >= 64) {
                    return load_tags(page + 1)
                }
            },
        })
    }

    createEffect(() => {
        state.filters.best
        fetch_products(parseInt(params.page || '0') || 0)
    })

    function fetch_products(page: number) {
        setState({ loading: true })
        setParams({ page })

        httpx({
            url: '/api/admin/products/',
            params: { page, best: state.filters.best },
            method: 'GET',
            onLoad(x) {
                setState({ loading: false })

                if (x.status != 200) return

                const productsWithLoading = x.response.map(
                    (product: ProductModel) => ({
                        ...product,
                        loading: false,
                    })
                )

                setState({ products: productsWithLoading, page })
            },
        })
    }

    function popup_add() {
        setState(
            produce(s => {
                s.popup = {
                    type: 'add',
                    product: {
                        ...EMPTY_PRODUCT,
                    },
                    show: true,
                    advanced: false,
                    errorSec: null,
                    errorText: '',
                    files: [],
                }
            })
        )
    }

    const products = createMemo(() => {
        let query = state.search.trim().toLocaleLowerCase()
        let result: ProductModel[] = [...state.products]

        if (query.length >= 3) {
            result = result.filter(
                m =>
                    m.name.toLocaleLowerCase().includes(query) ||
                    m.code.toLocaleLowerCase().includes(query)
            )
        }

        if (state.filters.onlyChair) {
            result = result.filter(s => s.kind === 'chair')
        }

        if (state.filters.onlyTable) {
            result = result.filter(s => s.kind === 'table')
        }

        if (state.filters) return result
    })

    return (
        <div class='products-container'>
            <div class='search-container'>
                <div class='search-wrapper'>
                    <input
                        type='text'
                        class='title_small'
                        placeholder='جستجو کنید...'
                        value={state.search}
                        oninput={e => setState({ search: e.target.value })}
                    />
                    <button class='icon'>
                        <SearchIcon />
                    </button>
                </div>
                <div class='filters-wrapper'>
                    <FilterCheckbox
                        holder='بهترین محصولات'
                        checked={state.filters.best}
                        onCheck={c =>
                            setState(
                                produce(s => {
                                    s.filters.best = c
                                })
                            )
                        }
                        class='title_smaller'
                    />
                    <FilterCheckbox
                        holder=' فقط صندلی'
                        checked={state.filters.onlyChair}
                        onCheck={c => {
                            setState(
                                produce(s => {
                                    s.filters.onlyChair = c
                                    if (s.filters.onlyChair) {
                                        s.filters.onlyTable = false
                                    }
                                })
                            )
                        }}
                        class='title_smaller'
                    />
                    <FilterCheckbox
                        holder='فقط میز'
                        checked={state.filters.onlyTable}
                        onCheck={c =>
                            setState(
                                produce(s => {
                                    s.filters.onlyTable = c

                                    if (s.filters.onlyTable) {
                                        s.filters.onlyChair = false
                                    }
                                })
                            )
                        }
                        class='title_smaller'
                    />
                </div>
            </div>

            <Show when={self.perms.check(Perms.A_PRODUCT)}>
                <button
                    class='add-product title_small'
                    disabled={state.loading}
                    onclick={() => {
                        popup_add()
                    }}
                >
                    <PlusIcon />
                    <span>اضافه محصول</span>
                    <PlusIcon />
                </button>
            </Show>

            <div class='products-wrapper'>
                <Show when={!state.loading} fallback={<Loading />}>
                    <Show
                        when={state.products.length > 0}
                        fallback={
                            <div class='empty title'>
                                محصولی برای نمایش پیدا نشد!
                            </div>
                        }
                    >
                        <For each={products()}>
                            {product => <ProductCmp {...product} />}
                        </For>
                    </Show>
                </Show>
            </div>

            <ProductPopup />
        </div>
    )
}

interface FilterCheckboxProps {
    checked: boolean
    onCheck(check: boolean): void
    class?: string

    holder: string
}
const FilterCheckbox: Component<FilterCheckboxProps> = P => {
    const uniqeId = createUniqueId()

    return (
        <label
            class={`search-filter ${P.class || ''}`}
            classList={{ active: P.checked }}
            for={uniqeId}
        >
            <input
                type='checkbox'
                id={uniqeId}
                checked={P.checked}
                onchange={e => P.onCheck(e.target.checked)}
            />
            <div class='checkbox-wrapper'></div>
            <div class='holder'>{P.holder}</div>
        </label>
    )
}

const ProductCmp: Component<ProductModel> = P => {
    return (
        <>
            <Show
                when={!P.loading}
                fallback={<LoadingElem class='loading-product' />}
            >
                <button
                    class='product-container'
                    onclick={() =>
                        setState(
                            produce(s => {
                                s.popup = {
                                    show: true,
                                    type: 'edit',
                                    product: JSON.parse(JSON.stringify(P)),
                                    advanced: false,
                                    errorSec: null,
                                    errorText: '',
                                    files: [],
                                }
                            })
                        )
                    }
                >
                    <Show when={P.code}>
                        <div class='product-tag description'>{P.code}</div>
                    </Show>
                    <Show when={P.best}>
                        <div class='best' title='جزو بهترین محصولات'>
                            <StarFillIcon />
                        </div>
                    </Show>
                    <div class='img-container'>
                        <Show
                            when={P.photos[0]}
                            fallback={
                                <div class='no-photo title_small'>
                                    <NoPhotoIcon />
                                    <span>بدون عکس</span>
                                </div>
                            }
                        >
                            <img
                                src={`/record/pp-${P.id}-${P.photos[0]}`}
                                loading='lazy'
                                decoding='async'
                            />
                        </Show>
                    </div>
                    <div class='info-container'>
                        <div class='product-name title_smaller'>{P.name}</div>
                        <div class='product-type'>
                            <Show
                                when={P.kind === 'chair'}
                                fallback={<Table2Icon />}
                            >
                                <ChairIcon />
                            </Show>
                        </div>
                    </div>
                </button>
            </Show>
        </>
    )
}

export const Loading: Component = () => {
    return (
        <>
            <LoadingElem class='product-container' />
            <LoadingElem class='product-container' />
            <LoadingElem class='product-container' />
            <LoadingElem class='product-container' />
        </>
    )
}

const ProductPopup: Component = () => {
    let ac = new AbortController()

    onMount(() => {
        escHandle()

        onCleanup(() => {
            ac.abort()
        })
    })

    function escHandle() {
        document.addEventListener(
            'keydown',
            e => {
                if (e.key === 'Escape' && state.popup.show) {
                    closePopup()
                }
            },
            { signal: ac.signal }
        )
    }

    const closePopup = () => {
        let addChange = false

        if (state.popup.type === 'add') {
            if (state.popup.product.name || state.popup.files.length > 0) {
                addChange = true
            }
        }

        if (changed() || addChange) {
            setPopup({
                type: 'warning',
                content:
                    'بعد از خروج مطالبی که عوض کردید بدون ذخیر پاک میشوند!',
                Icon: () => <WarningIcon />,
                show: true,
                title: 'خروج بدون ذخیره؟',
                onSubmit() {
                    setState(
                        produce(s => {
                            s.popup.show = false
                        })
                    )
                },
            })

            return
        }

        setState(
            produce(s => {
                s.popup.show = false
            })
        )
    }

    function product_delete() {
        let index = state.products.findIndex(
            p => p.slug === state.popup.product.slug
        )

        if (index < 0) return

        setState(
            produce(s => {
                s.popup.show = false
                s.products[index].loading = true
            })
        )

        httpx({
            url: `/api/admin/products/${state.popup.product.id}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200)
                    return addAlert({
                        type: 'error',
                        subject: 'حذف ناموفق!',
                        content: 'حذف محصول با خطا مواجح شد!',
                        timeout: 3,
                    })

                addAlert({
                    type: 'success',
                    subject: 'حذف موفق!',
                    content: 'محصول با موفقیت حذف شد',
                    timeout: 3,
                })
                setState(
                    produce(s => {
                        s.products.splice(index, 1)
                    })
                )
            },
        })
    }

    async function product_add() {
        let p = state.popup.product

        let uniqeId = performance.now()

        let empty = { ...EMPTY_PRODUCT, id: uniqeId }

        setState(
            produce(s => {
                s.popup.show = false

                s.products.unshift({ ...empty })
            })
        )

        let index = state.products.findIndex(a => a.id === uniqeId)

        if (index < 0) return

        httpx({
            url: '/api/admin/products/',
            method: 'POST',
            json: {
                code: p.code,
                kind: p.kind,
                name: p.name,
                slug: p.slug,
            },
            onLoad(firstRes) {
                if (firstRes.status !== 200) {
                    setState(
                        produce(s => {
                            s.products.splice(index, 1).filter(s => s)
                        })
                    )
                    return
                }

                const productsWithLoading = {
                    ...firstRes.response,
                    loading: true,
                }

                setState(
                    produce(s => {
                        s.products[index] = productsWithLoading
                    })
                )

                for (let f of state.popup.files) {
                    let data = new FormData()
                    data.set('photo', f)

                    httpx({
                        url: `/api/admin/products/${firstRes.response.id}/photos/`,
                        method: 'PUT',
                        data,
                        onLoad(secRes) {
                            if (secRes.status != 200) return

                            setState(
                                produce(s => {
                                    s.products[index].photos =
                                        secRes.response.photos

                                    s.products[index].loading = false
                                })
                            )
                        },
                    })
                }
            },
        })
    }

    function product_update() {
        let p = state.popup.product

        if (!p) return

        let index = state.products.findIndex(s => s.slug === p.slug)

        if (index < 0) return

        setState(
            produce(s => {
                s.popup.show = false
                s.products[index].loading = true
            })
        )

        httpx({
            url: `/api/admin/products/${p.id}/`,
            method: 'PATCH',
            json: {
                slug: p.slug,
                name: p.name,
                code: p.code,
                detail: p.detail,
                tag_leg: p.tag_leg,
                tag_bed: p.tag_bed,
                best: p.best,
                price: p.price,
                count: p.count,
                description: p.description,
                specification: p.specification,
            },
            onLoad(x) {
                if (x.status != 200)
                    return addAlert({
                        type: 'error',
                        subject: 'ذخیره ناموفق!',
                        content: 'ذخیره محصول با خطا مواجح شد!',
                        timeout: 3,
                    })

                addAlert({
                    type: 'success',
                    subject: 'ذخیره موفق!',
                    content: 'محصول با موفقیت ذخیره شد',
                    timeout: 3,
                })

                setState(
                    produce(s => {
                        s.products[index] = { ...x.response, loading: false }
                    })
                )
            },
        })
    }

    const changed = createMemo(() => {
        let s = state.popup.product

        if (!s) return

        let index = state.products.findIndex(i => i.slug === s.slug)

        if (index < 0) return

        let p = state.products[index]

        let change =
            s.slug != p.slug ||
            s.name != p.name ||
            s.code != p.code ||
            s.detail != p.detail ||
            s.tag_leg != p.tag_leg ||
            s.tag_bed != p.tag_bed ||
            s.description != p.description ||
            s.price != p.price ||
            s.count != p.count ||
            s.best != p.best ||
            s.kind != p.kind

        if (!change) {
            if (
                Object.keys(s.specification).length !=
                Object.keys(p.specification).length
            )
                return true

            for (let [k, v] of Object.entries(s.specification)) {
                let ov = p.specification[k]
                if (ov == undefined || ov != v) return true
            }
        }

        return change
    })

    const formIsValid = (): boolean => {
        let p = state.popup.product

        if (!p.name || !p.slug || !p.code) {
            addAlert({
                type: 'error',
                subject: 'فرم را کامل پر کنید!',
                content: 'فرم به درستی کامل نشده است!',
                timeout: 3,
            })
            return false
        }

        if (!p.kind) {
            addAlert({
                type: 'error',
                subject: 'نوع محصول را مشخص کنید.',
                content: 'میز یا صندلی بودن محصول را انتخاب کنید.',
                timeout: 3,
            })
            return false
        }

        return true
    }

    return (
        <div
            class='product-popup'
            classList={{ show: state.popup.show }}
            onclick={() => {
                closePopup()
            }}
        >
            <form
                onsubmit={e => {
                    e.preventDefault()

                    if (!formIsValid()) return

                    if (state.popup.type === 'edit') {
                        if (!changed()) {
                            return addAlert({
                                type: 'error',
                                timeout: 3,
                                subject: 'مطلبی را عوض نکردید!',
                                content: '',
                            })
                        }

                        product_update()
                    } else {
                        product_add()
                    }
                }}
                onreset={e => {
                    e.preventDefault()

                    closePopup()
                }}
                class='popup-wrapper'
                onclick={e => e.stopPropagation()}
            >
                <button class='close icon' type='reset'>
                    <CloseIcon />
                </button>
                <div class='popup-section'>
                    <PopupOverview />
                    <div
                        class='advanced'
                        classList={{ hide: !state.popup.advanced }}
                    >
                        به زودی...
                    </div>
                </div>

                <div class='popup-actions'>
                    <div class='ctas'>
                        <Show
                            when={state.popup.type === 'edit'}
                            fallback={
                                <button
                                    class='cta add description'
                                    type='submit'
                                >
                                    <PlusIcon />
                                    اضافه
                                </button>
                            }
                        >
                            <button
                                class='cta save description'
                                classList={{ disable: !changed() }}
                                type='submit'
                            >
                                <SaveIcon />
                                ذخیره
                            </button>

                            <Show when={self.perms.check(Perms.D_PRODUCT)}>
                                <button
                                    class='cta delete description'
                                    type='button'
                                    onclick={() => {
                                        setPopup({
                                            show: true,
                                            Icon: () => <TrashIcon />,
                                            content:
                                                'این عمل قابل بازگشت نیست!',
                                            title: 'حذف محصول؟',
                                            type: 'error',
                                            onSubmit() {
                                                product_delete()
                                            },
                                        })
                                    }}
                                >
                                    <TrashIcon />
                                    حذف
                                </button>
                            </Show>
                        </Show>
                    </div>
                    <div
                        class='tabs'
                        classList={{ advanced: state.popup.advanced }}
                    >
                        <button
                            class='tab description'
                            type='button'
                            onclick={() =>
                                setState(
                                    produce(s => {
                                        s.popup.advanced = false
                                    })
                                )
                            }
                        >
                            نگاه کلی
                        </button>
                        <button
                            class='tab description'
                            type='button'
                            onclick={() =>
                                setState(
                                    produce(s => {
                                        s.popup.advanced = true
                                    })
                                )
                            }
                        >
                            پیشرفته
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

const PopupOverview: Component = () => {
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

                s.products[index].photos.splice(idx, 1).filter(s => s)

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
                console.log(f)
                setState(
                    produce(s => {
                        s.popup.files.push(f)
                    })
                )
            }

            return
        }

        for (let f of el.files) {
            await new Promise((resolve, reject) => {
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

                                s.products[index].photos = x.response.photos

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
                                    when={images()[local.active].startsWith(
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
                    value={state.popup.product?.name || null}
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
                    value={state.popup.product?.slug || null}
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
                        value={state.popup.product?.price.toString() || null}
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
                        value={state.popup.product?.code || null}
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
                    value={state.popup.product?.description || null}
                    oninput={e =>
                        setState(
                            produce(s => {
                                s.popup.product.description = e.target.value
                            })
                        )
                    }
                    placeholder='توضیحات محصول...'
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

type ProductProps = {
    product: ProductModel
    update(product?: ProductModel): void
}
const Product: Component<ProductProps> = P => {
    type State = {
        loading: boolean
        edit: boolean
        slug: string
        name: string
        code: string
        description: string
        tag_leg: number | null
        tag_bed: number | null
        price: number
        count: number
        specification: { [key: string]: string }
        detail: string
    }
    const [state, setState] = createStore<State>({
        loading: false,
        edit: false,
        slug: P.product.slug,
        name: P.product.name,
        code: P.product.code,
        detail: P.product.detail,
        tag_leg: P.product.tag_leg,
        tag_bed: P.product.tag_bed,
        price: P.product.price,
        count: P.product.count,
        description: P.product.description,
        specification: { ...P.product.specification },
    })

    function product_delete() {
        httpx({
            url: `/api/admin/products/${P.product.id}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    function product_update() {
        httpx({
            url: `/api/admin/products/${P.product.id}/`,
            method: 'PATCH',
            json: {
                slug: state.slug,
                name: state.name,
                code: state.code,
                detail: state.detail,
                tag_leg: state.tag_leg,
                tag_bed: state.tag_bed,
                best: P.product.best,
                price: state.price,
                count: state.count,
                description: state.description,
                specification: state.specification,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update(x.response)
            },
        })
    }

    function toggle_star() {
        httpx({
            url: `/api/admin/products/${P.product.id}/`,
            method: 'PATCH',
            json: {
                slug: P.product.slug,
                name: P.product.name,
                code: P.product.code,
                detail: P.product.detail,
                tag_leg: P.product.tag_leg,
                tag_bed: P.product.tag_bed,
                best: !P.product.best,
                price: P.product.price,
                count: P.product.count,
                description: P.product.description,
                specification: P.product.specification,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update(x.response)
            },
        })
    }

    function reset() {
        setState({
            slug: P.product.slug,
            name: P.product.name,
            code: P.product.code,
            detail: P.product.detail,
            tag_leg: P.product.tag_leg,
            tag_bed: P.product.tag_bed,
            description: P.product.description,
            specification: { ...P.product.specification },
            price: P.product.price,
            count: P.product.count,
        })
    }

    const changed = createMemo(() => {
        let change =
            state.slug != P.product.slug ||
            state.name != P.product.name ||
            state.code != P.product.code ||
            state.detail != P.product.detail ||
            state.tag_leg != P.product.tag_leg ||
            state.tag_bed != P.product.tag_bed ||
            state.description != P.product.description ||
            state.price != P.product.price ||
            state.count != P.product.count
        state.count = P.product.count

        if (!change) {
            if (
                Object.keys(state.specification).length !=
                Object.keys(P.product.specification).length
            )
                return true

            for (let [k, v] of Object.entries(state.specification)) {
                let ov = P.product.specification[k]
                if (ov == undefined || ov != v) return true
            }
        }

        return change
    })

    // function thumbnail_update() {
    //     let el = document.createElement('input')
    //     el.setAttribute('type', 'file')
    //     el.setAttribute('accept', 'image/*')
    //     el.onchange = () => {
    //         if (!el.files || !el.files[0]) return

    //         setState({ loading: true })
    //         let data = new FormData()
    //         data.set('photo', el.files[0])

    //         httpx({
    //             url: `/api/admin/products/${P.product.id}/thumbnail/`,
    //             method: 'PUT',
    //             data,
    //             onLoad(x) {
    //                 if (x.status != 200) return

    //                 setState({ loading: false })
    //                 P.update(x.response)
    //             },
    //         })
    //     }
    //     el.click()
    // }

    // function thumbnail_delete() {
    //     httpx({
    //         url: `/api/admin/products/${P.product.id}/thumbnail/`,
    //         method: 'DELETE',
    //         onLoad(x) {
    //             if (x.status != 200) return
    //             P.update(x.response)
    //         },
    //     })
    // }

    function photo_add() {
        let el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('accept', 'image/*')
        el.setAttribute('multiple', 'true')
        el.onchange = async () => {
            if (!el.files || el.files.length == 0) return

            setState({ loading: true })

            for (let f of el.files) {
                await new Promise((resolve, reject) => {
                    let data = new FormData()
                    data.set('photo', f)
                    httpx({
                        url: `/api/admin/products/${P.product.id}/photos/`,
                        method: 'PUT',
                        data,
                        reject,
                        onLoad(x) {
                            if (x.status != 200) return
                            resolve(true)
                        },
                    })
                })
            }

            setState({ loading: false })
            P.update()
        }
        el.click()
    }

    function photo_del(idx: number) {
        httpx({
            url: `/api/admin/products/${P.product.id}/photos/${idx}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    const leg_tags = createMemo(() =>
        [{ display: '---', idx: null }].concat(
            tags[P.product.kind].leg.map(t => ({
                display: t.name,
                idx: t.id,
            }))
        )
    )
    const bed_tags = createMemo(() =>
        [{ display: '---', idx: null }].concat(
            tags[P.product.kind].bed.map(t => ({
                display: t.name,
                idx: t.id,
            }))
        )
    )

    return (
        <div class='product' classList={{ loading: state.loading }}>
            <Show when={state.loading}>
                <span class='message'>Loading...</span>
            </Show>
            <div class='top'>
                <div class='info'>
                    <span>{P.product.id}</span>
                    <Switch>
                        <Match when={P.product.kind == 'chair'}>
                            <ArmchairIcon />
                        </Match>
                        <Match when={P.product.kind == 'table'}>
                            <TableIcon />
                        </Match>
                    </Switch>
                    <span>
                        {new Date(
                            P.product.created_at * 1e3
                        ).toLocaleDateString()}
                    </span>
                    <span>
                        {P.product.updated_at <= 0
                            ? '---'
                            : new Date(
                                  P.product.updated_at * 1e3
                              ).toLocaleDateString()}
                    </span>
                    <span>{P.product.code}</span>
                    <span>{P.product.slug}</span>
                    <span>{P.product.name}</span>
                </div>
                <div class='product-actions'>
                    <button
                        class='styled icon'
                        onClick={() => open('/products/' + P.product.slug)}
                    >
                        <ExternalLinkIcon />
                    </button>
                    <Show when={!changed()}>
                        <button
                            class='styled icon'
                            classList={{ active: P.product.best }}
                            onClick={toggle_star}
                            style={{ '--color': '#FF6B00' }}
                        >
                            <StarIcon />
                        </button>
                    </Show>
                    <button
                        class='styled icon'
                        classList={{ rotate: state.edit }}
                        onClick={() => setState(s => ({ edit: !s.edit }))}
                    >
                        <Show when={state.edit} fallback={<ChevronUpIcon />}>
                            <ChevronUpIcon />
                        </Show>
                    </button>
                    <Show when={state.edit && changed()}>
                        <button
                            class='reverse'
                            onclick={() => {
                                setPopup({
                                    show: true,
                                    title: 'برگرداندن محصول؟',
                                    content:
                                        'تغییرات شما ذخیره نخواهند شد، ادامه میدهید؟',
                                    Icon: () => <RotateCcwIcon />,

                                    type: 'warning',
                                    onSubmit: () => {
                                        reset()
                                    },
                                })
                            }}
                        >
                            <RotateCcwIcon />
                        </button>
                    </Show>
                    <Show when={state.edit && changed()}>
                        <button
                            class='save-btn'
                            onclick={() => {
                                setPopup({
                                    show: true,
                                    title: 'ذخیره محصول؟',
                                    content:
                                        'آیا از حذخیرهدف محصول از سایت مطمعن هستید؟',
                                    Icon: () => <SaveIcon />,

                                    type: 'success',
                                    onSubmit: () => {
                                        product_update()
                                    },
                                })
                            }}
                        >
                            <SaveIcon />
                        </button>
                    </Show>
                    {/* <Confact
                        icon={TrashIcon}
                        color='var(--red)'
                        onAct={product_delete}
                        timer_ms={1300}
                    /> */}
                    <button
                        class='delete-btn'
                        onclick={() => {
                            setPopup({
                                show: true,
                                title: 'حذف محصول؟',
                                content:
                                    'آیا از حدف محصول از سایت مطمعن هستید؟',
                                Icon: () => <TrashIcon />,

                                type: 'error',
                                onSubmit: () => {
                                    product_delete()
                                },
                            })
                        }}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
            <Show when={state.edit}>
                <div class='bottom'>
                    <span>Slug:</span>
                    <input
                        class='styled'
                        placeholder='product slug'
                        maxLength={255}
                        value={state.slug}
                        onInput={e => {
                            let slug = e.currentTarget.value.slice(0, 255)
                            setState({ slug })
                        }}
                    />
                    <span>Name:</span>
                    <input
                        class='styled'
                        placeholder='product name'
                        dir='auto'
                        maxLength={255}
                        value={state.name}
                        onInput={e => {
                            let name = e.currentTarget.value.slice(0, 255)
                            setState({ name })
                        }}
                    />
                    <span>Code:</span>
                    <input
                        class='styled'
                        placeholder='product code must be unique'
                        maxLength={255}
                        value={state.code}
                        onInput={e => {
                            let code = e.currentTarget.value.slice(0, 255)
                            setState({ code })
                        }}
                    />
                    <span>Price:</span>
                    <input
                        class='styled'
                        type='number'
                        placeholder='price in IRR'
                        value={state.price}
                        onInput={e => {
                            let price = ~~(parseInt(e.currentTarget.value) || 0)
                            setState({ price })
                        }}
                    />
                    <span>Count:</span>
                    <input
                        class='styled'
                        type='number'
                        placeholder='count'
                        value={state.count}
                        onInput={e => {
                            let count = ~~(parseInt(e.currentTarget.value) || 0)
                            setState({ count })
                        }}
                    />
                    <span>Description:</span>
                    <textarea
                        rows={4}
                        dir='auto'
                        class='styled'
                        placeholder='product detail'
                        maxLength={2047}
                        value={state.description}
                        onInput={e => {
                            let description = e.currentTarget.value.slice(
                                0,
                                2047
                            )
                            setState({ description })
                        }}
                    />
                    <span>Tag Leg:</span>
                    <Select
                        items={leg_tags()}
                        onChange={v => setState({ tag_leg: v[0].idx })}
                        defaults={[
                            leg_tags().find(t => t.idx == state.tag_leg),
                        ]}
                    />
                    <span>Tag Bed:</span>
                    <Select
                        items={bed_tags()}
                        onChange={v => setState({ tag_bed: v[0].idx })}
                        defaults={[
                            bed_tags().find(t => t.idx == state.tag_bed),
                        ]}
                    />
                    <span>Detail:</span>
                    <textarea
                        rows={9}
                        dir='auto'
                        class='styled'
                        placeholder='product description'
                        maxLength={2047}
                        value={state.detail}
                        onInput={e => {
                            let detail = e.currentTarget.value.slice(0, 2047)
                            setState({ detail })
                        }}
                    />
                    <span>Table:</span>
                    <div class='table-container'>
                        <div class='table-wrapper'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>حذف</th>
                                        <th>عنوان</th>
                                        <th>توضیح</th>
                                    </tr>
                                </thead>
                                <SpecificationTable
                                    s={state.specification}
                                    del={key =>
                                        setState(
                                            produce(s => {
                                                delete s.specification[key]
                                            })
                                        )
                                    }
                                    set_key={(old, nky) => {
                                        setState(
                                            produce(s => {
                                                let val = s.specification[old]
                                                if (val == undefined) return
                                                s.specification[old]
                                                delete s.specification[old]
                                                s.specification[nky] = val
                                            })
                                        )
                                    }}
                                    set_val={(key, val) => {
                                        setState(
                                            produce(s => {
                                                s.specification[key] = val
                                            })
                                        )
                                    }}
                                />
                            </table>
                        </div>

                        <button
                            class='styled icon'
                            onClick={() => {
                                let val = 'توضیحات'
                                let key = 'عنوان جدید'

                                if (key in state.specification)
                                    return addAlert({
                                        type: 'error',
                                        timeout: 3,
                                        subject: 'عنوان تکراری!',
                                        content:
                                            'عنوان جدید رو به چیزه دیگری تغییر بدید.',
                                    })

                                setState(
                                    produce(s => {
                                        s.specification[key] = val
                                    })
                                )
                            }}
                        >
                            <PlusIcon />
                        </button>
                    </div>

                    <span>Photos:</span>
                    <div class='photos'>
                        <button
                            class='styled icon'
                            style={{ 'margin-left': '-1rem' }}
                            onClick={photo_add}
                        >
                            <PlusIcon />
                        </button>
                        {P.product.photos.map((s, i) => (
                            <div class='image' onClick={() => photo_del(i)}>
                                <TrashIcon />
                                <img
                                    draggable={false}
                                    loading='lazy'
                                    decoding='async'
                                    src={`/record/pp-${P.product.id}-${s}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Show>
        </div>
    )
}

type SPP = {
    s: { [key: string]: string }
    del(key: string): void
    set_key(old: string, nky: string): void
    set_val(key: string, val: string): void
}
const SpecificationTable: Component<SPP> = P => {
    return (
        <tbody>
            <Show
                when={Object.keys(P.s).length > 0}
                fallback={
                    <tr class='empty'>
                        <td colspan='3'>مشخصاتی ثبت نشده!</td>
                    </tr>
                }
            >
                {Object.entries(P.s).map(([key, value]) => (
                    <tr>
                        <td class='delete-cta'>
                            <button
                                class='styled icon'
                                onClick={() => {
                                    P.del(key)
                                }}
                            >
                                <TrashIcon />
                            </button>
                        </td>

                        <td>
                            <input
                                type='text'
                                value={key}
                                onBlur={e =>
                                    P.set_key(key, e.currentTarget.value)
                                }
                            />
                        </td>

                        <td>
                            <input
                                type='text'
                                value={value}
                                onBlur={e =>
                                    P.set_val(key, e.currentTarget.value)
                                }
                            />
                        </td>
                    </tr>
                ))}
            </Show>
        </tbody>
    )
}

type AddProductProps = {
    update(): void
}
const AddProduct: Component<AddProductProps> = P => {
    type State = Pick<ProductModel, 'kind' | 'name' | 'slug' | 'code'> & {
        show: boolean
    }
    const [state, setState] = createStore<State>({
        show: false,
        kind: 'chair',
        slug: '',
        name: '',
        code: '',
    })

    function add() {
        httpx({
            url: '/api/admin/products/',
            method: 'POST',
            json: {
                kind: state.kind,
                slug: state.slug,
                name: state.name,
                code: state.code,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    return (
        <div class='product'>
            <div class='top'>
                <div class='info'>Add a Product</div>
                <div class='product-actions'>
                    <Show
                        when={
                            state.show &&
                            state.name &&
                            state.code &&
                            state.slug.length >= 3
                        }
                    >
                        <button class='add-btn styled icon' onClick={add}>
                            <PlusIcon />
                        </button>
                    </Show>
                    <button
                        class='styled icon'
                        onClick={() => setState(s => ({ show: !s.show }))}
                    >
                        <Show when={state.show} fallback={<ChevronDownIcon />}>
                            <ChevronUpIcon />
                        </Show>
                    </button>
                </div>
            </div>
            <Show when={state.show}>
                <div class='bottom'>
                    <span>Slug:</span>
                    <input
                        class='styled'
                        placeholder='product slug'
                        dir='auto'
                        maxLength={255}
                        value={state.slug}
                        onInput={e => {
                            let slug = e.currentTarget.value.slice(0, 255)
                            setState({ slug })
                        }}
                    />
                    <span>Name:</span>
                    <input
                        class='styled'
                        placeholder='product name'
                        dir='auto'
                        maxLength={255}
                        value={state.name}
                        onInput={e => {
                            let name = e.currentTarget.value.slice(0, 255)
                            setState({ name })
                        }}
                    />
                    <span>Code:</span>
                    <input
                        class='styled'
                        placeholder='product code must be unique'
                        maxLength={255}
                        value={state.code}
                        onInput={e => {
                            let code = e.currentTarget.value.slice(0, 255)
                            setState({ code })
                        }}
                    />
                    <span>Kind:</span>
                    <button
                        class='styled icon'
                        onClick={() =>
                            setState(s => ({
                                kind: s.kind == 'chair' ? 'table' : 'chair',
                            }))
                        }
                    >
                        <Show
                            when={state.kind == 'chair'}
                            fallback={<TableIcon />}
                        >
                            <ArmchairIcon />
                        </Show>
                    </button>
                </div>
            </Show>
        </div>
    )
}
