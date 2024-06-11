import { SetStoreFunction, createStore } from 'solid-js/store'
import './style/products.scss'
import { ProductModel, UserModel } from 'models'
import { useSearchParams } from '@solidjs/router'
import {
    Component,
    JSX,
    Match,
    Show,
    Switch,
    createEffect,
    createSignal,
    onMount,
} from 'solid-js'
import { httpx } from 'shared'
import {
    ArmchairIcon,
    BanIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    CircleCheckBigIcon,
    HourglassIcon,
    TableIcon,
    UserIcon,
    WrenchIcon,
    XIcon,
} from 'icons'
import { Confact, Copiable, Fanel } from 'comps'

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

    // function update_product(id: number, status: UpdateProductStatus) {
    //     httpx({
    //         url: `/api/admin/products/${id}/`,
    //         method: 'PATCH',
    //         json: {
    //             status,
    //         },
    //         onLoad(x) {
    //             if (x.status == 200) {
    //                 fetch_products(state.page)
    //             }
    //         },
    //     })
    // }

    return (
        <div class='products-fnd'>
            <div
                class='product-list'
                classList={{ message: state.products.length == 0 }}
            >
                <Show when={state.products.length == 0}>No Product</Show>

                {state.products.map((p, i) => (
                    <Product
                        product={p}
                        idx={i}
                        update={() => fetch_products(state.page)}
                        state={state}
                        setState={setState}
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
    idx: number
    // update(id: number, status: UpdateProductStatus): void
    update(): void
    state: ProductsState
    setState: SetStoreFunction<ProductsState>
}
const Product: Component<ProductProps> = P => {
    // const [show_data, setShowData] = createSignal(P.product.status == 'wating')

    // const STATUS_ICON: { [k in Prod['status']]: () => JSX.Element } = {
    //     wating: HourglassIcon,
    //     done: CircleCheckBigIcon,
    //     refunded: BanIcon,
    // }

    return (
        <div class='product'>
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
                    {new Date(P.product.timestamp * 1e3).toLocaleDateString()}
                </span>
                <span>{P.product.code}</span>
                <span>{P.product.name}</span>
            </div>
            <div class='actions'>
                <button class='styled icon'>
                    <WrenchIcon />
                </button>
                {/*<Show when={Object.keys(P.product.data).length != 0}>
                        <button
                            class='btn-show-data styled icon'
                            onclick={() => setShowData(s => !s)}
                        >
                            <Show
                                when={show_data()}
                                fallback={<ChevronDownIcon />}
                            >
                                <ChevronUpIcon />
                            </Show>
                        </button>
                    </Show>
                    <Show when={P.product.status === 'wating'}>
                        <Confact
                            color='var(--red)'
                            timer_ms={1e3}
                            icon={BanIcon}
                            onAct={() => P.update(P.product.id, 'refunded')}
                        />
                        <Confact
                            color='var(--green)'
                            timer_ms={1e3}
                            icon={CircleCheckBigIcon}
                            onAct={() => P.update(P.product.id, 'done')}
                        />
                    </Show>*/}
            </div>
        </div>
    )
}
