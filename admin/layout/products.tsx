import { createStore } from 'solid-js/store'
import './style/products.scss'
import { ProductModel } from 'models'
import { useSearchParams } from '@solidjs/router'
import {
    Component,
    Match,
    Show,
    Switch,
    createEffect,
    createMemo,
} from 'solid-js'
import { httpx } from 'shared'
import {
    ArmchairIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ImageIcon,
    PlusIcon,
    RotateCcwIcon,
    SaveIcon,
    TableIcon,
    TrashIcon,
    WrenchIcon,
} from 'icons'
import { Confact } from 'comps'

type ProductsState = {
    products: ProductModel[]
    page: number
}

export default () => {
    const [params, setParams] = useSearchParams()

    const [state, setState] = createStore<ProductsState>({
        products: [],
        page: 0,
    })

    createEffect(() => fetch_products(parseInt(params.page || '0') || 0))

    function fetch_products(page: number) {
        setParams({ page })
        setState({ page })

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
        <div class='products-fnd'>
            <div class='product-list'>
                <AddProduct update={() => fetch_products(0)} />
                {state.products.map((p, i) => (
                    <Product
                        product={p}
                        update={() => fetch_products(state.page)}
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
    update(): void
}
const Product: Component<ProductProps> = P => {
    type State = {
        edit: boolean
        name: string
        code: string
        detail: string
        // thumbnail: string | null
        // photos: string[]
        tag_leg: number | null
        tag_bed: number | null
    }
    const [state, setState] = createStore<State>({
        edit: P.product.id == 13,
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
                P.update()
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
            state.detail != P.product.detail
    )

    function thumbnail_update() {
        let el = document.createElement('input')
        el.setAttribute('type', 'file')
        el.setAttribute('accept', 'image/*')
        el.onchange = () => {
            if (!el.files || !el.files[0]) return

            let data = new FormData()
            data.set('photo', el.files[0])

            httpx({
                url: `/api/admin/products/${P.product.id}/thumbnail/`,
                method: 'PUT',
                data,
                onLoad(x) {
                    if (x.status != 200) return
                    P.update()
                },
            })
        }
        el.click()
    }

    return (
        <div class='product'>
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
                    <span>thumbnail:</span>
                    <div class='thumbnail' onClick={thumbnail_update}>
                        <Show
                            when={P.product.thumbnail}
                            fallback={<ImageIcon />}
                        >
                            <img
                                src={`/record/pt:${P.product.id}:${P.product.thumbnail}`}
                            />
                        </Show>
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
