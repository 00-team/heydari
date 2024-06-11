import { createStore } from 'solid-js/store'
import './style/product-tags.scss'
import { ProductTagModel } from 'models'
import { useSearchParams } from '@solidjs/router'
import { Component, Match, Show, Switch, createEffect } from 'solid-js'
import { httpx } from 'shared'
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
    TableIcon,
    TrashIcon,
    WrenchIcon,
} from 'icons'
import { Confact } from 'comps'

export default () => {
    type State = {
        tags: ProductTagModel[]
        page: number
    }
    const [state, setState] = createStore<State>({
        tags: [],
        page: 0,
    })
    const [params, setParams] = useSearchParams()

    createEffect(() => fetch_tags(parseInt(params.page || '0') || 0))

    function fetch_tags(page: number) {
        setParams({ page })

        httpx({
            url: '/api/admin/product-tags/',
            params: { page },
            method: 'GET',
            onLoad(x) {
                if (x.status != 200) return
                setState({ tags: x.response, page })
            },
        })
    }

    return (
        <div class='product-tags-fnd'>
            <div class='tag-list'>
                <AddTag update={() => fetch_tags(0)} />
                {state.tags.map(t => (
                    <Tag tag={t} update={() => fetch_tags(state.page)} />
                ))}
            </div>
            <Show when={state.page != 0 || state.tags.length >= 64}>
                <div class='actions'>
                    <button
                        class='styled'
                        disabled={state.page <= 0}
                        onClick={() => fetch_tags(state.page - 1)}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        class='styled'
                        disabled={state.tags.length < 64}
                        onClick={() => fetch_tags(state.page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </Show>
        </div>
    )
}

type TagProps = {
    tag: ProductTagModel
    update(): void
}
const Tag: Component<TagProps> = P => {
    type State = {
        edit: boolean
        name: string
    }
    const [state, setState] = createStore<State>({
        edit: false,
        name: P.tag.name,
    })

    function tag_delete() {
        httpx({
            url: `/api/admin/product-tags/${P.tag.id}/`,
            method: 'DELETE',
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    function tag_update() {
        httpx({
            url: `/api/admin/product-tags/${P.tag.id}/`,
            method: 'PATCH',
            json: {
                name: state.name,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    return (
        <div class='tag'>
            <div class='top'>
                <div class='info'>
                    <span>{P.tag.id}</span>
                    <Switch>
                        <Match when={P.tag.kind == 'chair'}>
                            <ArmchairIcon />
                        </Match>
                        <Match when={P.tag.kind == 'table'}>
                            <TableIcon />
                        </Match>
                    </Switch>
                    <span>{P.tag.part}</span>
                    <span>{P.tag.name}</span>
                    <span>{P.tag.count}</span>
                </div>
                <div class='actions'>
                    <Show when={state.edit && state.name != P.tag.name}>
                        <Confact
                            icon={RotateCcwIcon}
                            timer_ms={700}
                            onAct={() => setState({ name: P.tag.name })}
                            color='var(--yellow)'
                        />
                    </Show>
                    <Show when={state.edit && state.name != P.tag.name}>
                        <Confact
                            icon={SaveIcon}
                            timer_ms={1200}
                            onAct={tag_update}
                            color='var(--green)'
                        />
                    </Show>
                    <button
                        class='styled icon'
                        onClick={() =>
                            open(
                                `/products/?kind=${P.tag.kind}&${P.tag.part}=${P.tag.id}`
                            )
                        }
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
                        onAct={tag_delete}
                        timer_ms={1300}
                    />
                </div>
            </div>
            <Show when={state.edit}>
                <div class='bottom'>
                    <span>Name:</span>
                    <input
                        class='styled'
                        placeholder='tag name'
                        dir='auto'
                        maxLength={255}
                        value={state.name}
                        onInput={e => {
                            let name = e.currentTarget.value.slice(0, 255)
                            setState({ name })
                        }}
                    />
                </div>
            </Show>
        </div>
    )
}

type AddTagProps = {
    update(): void
}
const AddTag: Component<AddTagProps> = P => {
    type State = Pick<ProductTagModel, 'kind' | 'name' | 'part'> & {
        show: boolean
    }
    const [state, setState] = createStore<State>({
        show: false,
        kind: 'chair',
        name: '',
        part: 'leg',
    })

    function add() {
        httpx({
            url: '/api/admin/product-tags/',
            method: 'POST',
            json: {
                kind: state.kind,
                name: state.name,
                part: state.part,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update()
            },
        })
    }

    return (
        <div class='tag'>
            <div class='top'>
                <div class='info'>Add a Tag</div>
                <div class='actions'>
                    <Show when={state.show && state.name}>
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
                        placeholder='tag name'
                        dir='auto'
                        maxLength={255}
                        value={state.name}
                        onInput={e => {
                            let name = e.currentTarget.value.slice(0, 255)
                            setState({ name })
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
                    <span>Part:</span>
                    <button
                        class='styled'
                        onClick={() =>
                            setState(s => ({
                                part: s.part == 'leg' ? 'bed' : 'leg',
                            }))
                        }
                    >
                        {state.part}
                    </button>
                </div>
            </Show>
        </div>
    )
}
