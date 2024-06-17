import { createStore, produce } from 'solid-js/store'
import './style/products.scss'
import { ProductModel, ProductTagModel } from 'models'
import { useSearchParams } from '@solidjs/router'
import {
    Component,
    Match,
    Show,
    Switch,
    createEffect,
    createMemo,
    onMount,
} from 'solid-js'
import { httpx } from 'shared'
import {
    ArmchairIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ExternalLinkIcon,
    ImageIcon,
    PlusIcon,
    RotateCcwIcon,
    SaveIcon,
    TableIcon,
    TrashIcon,
    WrenchIcon,
    XIcon,
} from 'icons'
import { Confact, Select } from 'comps'

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
            params: { page },
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
            <Show when={state.page != 0 || state.products.length >= 32}>
                <div class='actions'>
                    <button
                        class='styled'
                        disabled={state.page <= 0}
                        onClick={() => fetch_products(state.page - 1)}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        class='styled'
                        disabled={state.products.length < 32}
                        onClick={() => fetch_products(state.page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </Show>
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
        name: string
        code: string
        detail: string
        tag_leg: number | null
        tag_bed: number | null
    }
    const [state, setState] = createStore<State>({
        loading: false,
        edit: false,
        name: P.product.name,
        code: P.product.code,
        detail: P.product.detail,
        tag_leg: P.product.tag_leg,
        tag_bed: P.product.tag_bed,
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
                name: state.name,
                code: state.code,
                detail: state.detail,
                tag_leg: state.tag_leg,
                tag_bed: state.tag_bed,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update(x.response)
            },
        })
    }

    function reset() {
        setState({
            name: P.product.name,
            code: P.product.code,
            detail: P.product.detail,
            tag_leg: P.product.tag_leg,
            tag_bed: P.product.tag_bed,
        })
    }

    const changed = createMemo(
        () =>
            state.name != P.product.name ||
            state.code != P.product.code ||
            state.detail != P.product.detail ||
            state.tag_leg != P.product.tag_leg ||
            state.tag_bed != P.product.tag_bed
    )

    function thumbnail_update() {
        let el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('accept', 'image/*')
        el.onchange = () => {
            if (!el.files || !el.files[0]) return

            setState({ loading: true })
            let data = new FormData()
            data.set('photo', el.files[0])

            httpx({
                url: `/api/admin/products/${P.product.id}/thumbnail/`,
                method: 'PUT',
                data,
                onLoad(x) {
                    if (x.status != 200) return

                    setState({ loading: false })
                    P.update(x.response)
                },
            })
        }
        el.click()
    }

    function thumbnail_delete() {
        httpx({
            url: `/api/admin/products/${P.product.id}/thumbnail/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return
                P.update(x.response)
            },
        })
    }

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
                            P.product.timestamp * 1e3
                        ).toLocaleDateString()}
                    </span>
                    <span>{P.product.code}</span>
                    <span>{P.product.name}</span>
                </div>
                <div class='actions'>
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
                        onClick={() => open('/products/' + P.product.id)}
                    >
                        <ExternalLinkIcon />
                    </button>
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
                    <span>Detail:</span>
                    <textarea
                        rows={4}
                        dir='auto'
                        class='styled'
                        placeholder='product detail'
                        maxLength={2047}
                        value={state.detail}
                        onInput={e => {
                            let detail = e.currentTarget.value.slice(0, 2047)
                            setState({ detail })
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
                    <span>Banner:</span>
                    <div class='thumbnail' onClick={thumbnail_update}>
                        <Show
                            when={P.product.thumbnail}
                            fallback={<ImageIcon />}
                        >
                            <>
                                <img
                                    draggable={false}
                                    loading='lazy'
                                    decoding='async'
                                    src={`/record/pt-${P.product.id}-${P.product.thumbnail}`}
                                />
                                <button
                                    class='styled icon remove'
                                    onClick={e => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        thumbnail_delete()
                                    }}
                                >
                                    <XIcon />
                                </button>
                            </>
                        </Show>
                    </div>
                    <span>Photos:</span>
                    <div class='photos'>
                        <button class='styled icon' onClick={photo_add}>
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

type AddProductProps = {
    update(): void
}
const AddProduct: Component<AddProductProps> = P => {
    type State = Pick<ProductModel, 'kind' | 'name' | 'code'> & {
        show: boolean
    }
    const [state, setState] = createStore<State>({
        show: false,
        kind: 'chair',
        name: '',
        code: '',
    })

    function add() {
        httpx({
            url: '/api/admin/products/',
            method: 'POST',
            json: {
                kind: state.kind,
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
                <div class='actions'>
                    <Show when={state.show && state.name && state.code}>
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
