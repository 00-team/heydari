import { useSearchParams } from '@solidjs/router'
import { Confact, Select } from 'comps'
import { addAlert } from 'comps/alert'
import {
    ArmchairIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ExternalLinkIcon,
    PlusIcon,
    RotateCcwIcon,
    SaveIcon,
    SquareCheckBigIcon,
    SquareIcon,
    StarIcon,
    TableIcon,
    TrashIcon,
    WrenchIcon,
} from 'icons'
import { ProductModel, ProductTagModel } from 'models'
import { httpx } from 'shared'
import {
    Component,
    createEffect,
    createMemo,
    Match,
    onMount,
    Show,
    Switch,
} from 'solid-js'
import { createStore, produce } from 'solid-js/store'
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

export default () => {
    const [params, setParams] = useSearchParams()
    type State = {
        products: ProductModel[]
        page: number
        loading: boolean
        best?: true
    }
    const [state, setState] = createStore<State>({
        products: [],
        page: 0,
        loading: true,
    })

    onMount(() => load_tags(0))

    function load_tags(page: number) {
        httpx({
            url: '/api/admin/product-tags/',
            method: 'GET',
            params: { page },
            onLoad(x) {
                if (x.status != 200) return setState({ loading: false })
                let tags: ProductTagModel[] = x.response
                if (tags.length == 0) return setState({ loading: false })
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
                setState({ loading: false })
            },
        })
    }

    createEffect(() => fetch_products(parseInt(params.page || '0') || 0))

    function fetch_products(page: number) {
        setParams({ page })

        httpx({
            url: '/api/admin/products/',
            params: { page, best: state.best },
            method: 'GET',
            onLoad(x) {
                if (x.status != 200) return
                setState({ products: x.response, page })
            },
        })
    }

    return (
        <div class='products-fnd' classList={{ loading: state.loading }}>
            <Show when={state.loading}>
                <span class='message'>Loading ...</span>
            </Show>

            <div class='actions'>
                <div class='left'>
                    <div class='row'>
                        Best:
                        <button
                            class='styled icon'
                            onClick={() => {
                                setState(s => ({
                                    best: s.best ? undefined : true,
                                }))
                                fetch_products(state.page)
                            }}
                        >
                            <Show when={state.best} fallback={<SquareIcon />}>
                                <SquareCheckBigIcon />
                            </Show>
                        </button>
                    </div>
                </div>
                <div class='right'>
                    <button
                        class='styled icon'
                        disabled={state.page <= 0}
                        onClick={() => fetch_products(state.page - 1)}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        class='styled icon'
                        disabled={state.products.length < 32}
                        onClick={() => fetch_products(state.page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            <div class='product-list'>
                <AddProduct update={() => fetch_products(0)} />
                {state.products.map((p, i) => (
                    <Product
                        product={p}
                        update={p => {
                            if (!p) return fetch_products(state.page)

                            setState(
                                produce(s => {
                                    s.products[i] = p
                                })
                            )
                        }}
                    />
                ))}
            </div>
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
            state.price != P.product.price

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
                        {new Date(
                            P.product.updated_at * 1e3
                        ).toLocaleDateString()}
                    </span>
                    <span>{P.product.code}</span>
                    <span>{P.product.slug}</span>
                    <span>{P.product.name}</span>
                </div>
                <div class='product-actions'>
                    <Show when={state.edit && changed()}>
                        <Confact
                            icon={RotateCcwIcon}
                            timer_ms={700}
                            onAct={reset}
                            color='var(--yellow)'
                        />
                    </Show>
                    <Show when={state.edit && changed()}>
                        <Confact
                            icon={SaveIcon}
                            timer_ms={1200}
                            onAct={product_update}
                            color='var(--green)'
                        />
                    </Show>
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
                        onClick={() => setState(s => ({ edit: !s.edit }))}
                    >
                        <Show when={state.edit} fallback={<WrenchIcon />}>
                            <ChevronUpIcon />
                        </Show>
                    </button>
                    <Confact
                        icon={TrashIcon}
                        color='var(--red)'
                        onAct={product_delete}
                        timer_ms={1300}
                    />
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
