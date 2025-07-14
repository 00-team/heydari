import { useSearchParams } from '@solidjs/router'
import { LoadingElem } from 'comps'
import {
    ChairIcon,
    NoPhotoIcon,
    PlusIcon,
    SearchIcon,
    StarFillIcon,
    Table2Icon,
} from 'icons'
import { EMPTY_PRODUCT, ProductModel, ProductTagModel } from 'models'
import { httpx, Perms } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    createUniqueId,
    For,
    onMount,
    Show,
} from 'solid-js'
import { produce } from 'solid-js/store'
import { self } from 'store'
import { ProductPopup } from './prodcut-popup'
import './products.scss'
import { popup_init, setState, setTags, state } from './shared'

export default () => {
    const [params, setParams] = useSearchParams()

    onMount(() => {
        if (self.perms.check(Perms.V_PRODUCT_TAG)) {
            load_tags(0)
        }

        setState({
            page: parseInt(params.page || '0') || 0,
        })
    })

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
        fetch_products(state.page)
    })

    function fetch_products(page: number) {
        setState({ loading: true })
        setParams({ page })

        let params = { page } as any
        if (state.filters.best != null) {
            params.best = state.filters.best
        }

        httpx({
            url: '/api/admin/products/',
            params,
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

        return []
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
                    <button
                        class='title_smaller'
                        style={{
                            border: '2px solid blue',
                            'border-radius': '0.2rem',
                            padding: '0.5rem',
                        }}
                        disabled={state.page == 0}
                        onClick={() => {
                            setState(
                                produce(s => {
                                    s.page--
                                })
                            )
                        }}
                    >
                        صفحه قبلی
                    </button>
                    <button
                        class='title_smaller'
                        style={{
                            border: '2px solid blue',
                            'border-radius': '0.2rem',
                            padding: '0.5rem',
                        }}
                        onClick={() => {
                            setState(
                                produce(s => {
                                    s.page++
                                })
                            )
                        }}
                    >
                        صفحه بعدی
                    </button>
                    <button
                        class='title_smaller'
                        style={{
                            border: '2px solid blue',
                            'border-radius': '0.2rem',
                            padding: '0.5rem',
                        }}
                        onClick={() => {
                            setState(
                                produce(s => {
                                    if (s.filters.best == null) {
                                        s.filters.best = true
                                    } else if (s.filters.best == true) {
                                        s.filters.best = false
                                    } else {
                                        s.filters.best = null
                                    }
                                })
                            )
                        }}
                    >
                        بهترین محصولات: {state.filters.best + ''}
                    </button>
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
                    onclick={() => popup_init(EMPTY_PRODUCT, 'add')}
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
        <Show
            when={!P.loading}
            fallback={<LoadingElem class='loading-product' />}
        >
            <button
                class='product-container'
                onclick={() => popup_init(P, 'edit')}
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
                            draggable='false'
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
