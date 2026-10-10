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
import { popup_init, setState, setTags, SORT_PRIORITY, state } from './shared'

export default () => {
    // Used to ignore responses from older requests if the best filter
    // changes while a previous product-loading request is still running.
    let productFetchId = 0

    onMount(() => {
        if (self.perms.check(Perms.V_PRODUCT_TAG)) {
            load_tags(0)
        }
    })

    function load_tags(page: number): void {
        httpx({
            url: '/api/admin/product-tags/',
            method: 'GET',
            params: { page },

            onLoad(x) {
                if (x.status !== 200) return

                const loadedTags: ProductTagModel[] = x.response

                if (loadedTags.length === 0) return

                setTags(
                    produce(s => {
                        loadedTags.forEach(tag => {
                            s[tag.kind][tag.part].push(tag)
                        })
                    })
                )

                if (loadedTags.length >= 64) {
                    load_tags(page + 1)
                }
            },
        })
    }

    function fetch_products(best: boolean | null): void {
        const fetchId = ++productFetchId

        setState({
            loading: true,
            products: [],
        })

        function fetch_page(page: number): void {
            const params: {
                page: number
                best?: boolean
            } = { page }

            if (best !== null) {
                params.best = best
            }

            httpx({
                url: '/api/admin/products/',
                method: 'GET',
                params,

                onLoad(x) {
                    if (fetchId !== productFetchId) return

                    if (x.status !== 200) {
                        setState({ loading: false })
                        return
                    }

                    const pageProducts: ProductModel[] = x.response

                    if (pageProducts.length === 0) {
                        setState(
                            produce(s => {
                                s.products.sort((a, b) => {
                                    const aPriority =
                                        SORT_PRIORITY.get(a.code) ??
                                        Number.MAX_SAFE_INTEGER

                                    const bPriority =
                                        SORT_PRIORITY.get(b.code) ??
                                        Number.MAX_SAFE_INTEGER

                                    return aPriority - bPriority
                                })

                                s.loading = false
                            })
                        )

                        return
                    }

                    const productsWithLoading = pageProducts.map(
                        (product: ProductModel) => ({
                            ...product,
                            loading: false,
                        })
                    )

                    setState(
                        produce(s => {
                            s.products.push(...productsWithLoading)
                        })
                    )

                    fetch_page(page + 1)
                },
            })
        }

        fetch_page(0)
    }

    createEffect(() => {
        const best = state.filters.best
        fetch_products(best)
    })

    const products = createMemo(() => {
        const query = state.search.trim().toLocaleLowerCase()

        let result: ProductModel[] = [...state.products]

        if (query.length >= 3) {
            result = result.filter(
                product =>
                    product.name.toLocaleLowerCase().includes(query) ||
                    product.code.toLocaleLowerCase().includes(query)
            )
        }

        if (state.filters.onlyChair) {
            result = result.filter(product => product.kind === 'chair')
        }

        if (state.filters.onlyTable) {
            result = result.filter(product => product.kind === 'table')
        }

        return result
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
                        onInput={e =>
                            setState({ search: e.currentTarget.value })
                        }
                    />

                    <button class='icon'>
                        <SearchIcon />
                    </button>
                </div>

                <div class='filters-wrapper'>
                    <div class='pagination'>
                        <button
                            class='title_smaller page-cta'
                            classList={{
                                disable: state.filters.best === null,
                                green: state.filters.best === true,
                                red: state.filters.best === false,
                            }}
                            onClick={() => {
                                setState(
                                    produce(s => {
                                        if (s.filters.best === null) {
                                            s.filters.best = true
                                        } else if (s.filters.best === true) {
                                            s.filters.best = false
                                        } else {
                                            s.filters.best = null
                                        }
                                    })
                                )
                            }}
                        >
                            بهترین‌ها{' '}
                            {state.filters.best === null
                                ? ''
                                : state.filters.best === true
                                  ? 'باشه'
                                  : 'نباشه'}
                        </button>
                    </div>

                    <div class='ctas'>
                        <FilterCheckbox
                            holder='فقط صندلی'
                            checked={state.filters.onlyChair}
                            onCheck={checked => {
                                setState(
                                    produce(s => {
                                        s.filters.onlyChair = checked

                                        if (checked) {
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
                            onCheck={checked => {
                                setState(
                                    produce(s => {
                                        s.filters.onlyTable = checked

                                        if (checked) {
                                            s.filters.onlyChair = false
                                        }
                                    })
                                )
                            }}
                            class='title_smaller'
                        />
                    </div>
                </div>
            </div>

            <Show when={self.perms.check(Perms.A_PRODUCT)}>
                <button
                    class='add-product title_small'
                    disabled={state.loading}
                    onClick={() => popup_init(EMPTY_PRODUCT, 'add')}
                >
                    <PlusIcon />
                    <span>اضافه محصول</span>
                    <PlusIcon />
                </button>
            </Show>

            <div class='products-wrapper'>
                <Show when={!state.loading} fallback={<Loading />}>
                    <Show
                        when={products().length > 0}
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
export const FilterCheckbox: Component<FilterCheckboxProps> = P => {
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
