import { useSearchParams } from '@solidjs/router'
import { Confact } from 'comps'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    RotateCcwIcon,
    SaveIcon,
    UserIcon,
    WrenchIcon,
} from 'icons'
import { UserModel } from 'models'
import { PERMS_DISPLAY, Perms, httpx } from 'shared'
import { Component, createEffect, createMemo, Show } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import './style/users.scss'

export default () => {
    const [params, setParams] = useSearchParams()
    type State = {
        users: UserModel[]
        page: number
        loading: boolean
    }
    const [state, setState] = createStore<State>({
        users: [],
        page: 0,
        loading: true,
    })

    createEffect(() => fetch_users(parseInt(params.page || '0') || 0))

    function fetch_users(page: number) {
        setParams({ page })
        setState({ loading: true })

        httpx({
            url: '/api/admin/users/',
            params: { page },
            method: 'GET',
            onLoad(x) {
                if (x.status != 200) return
                setState({ users: x.response, page, loading: false })
            },
        })
    }

    return (
        <div class='users-fnd' classList={{ loading: state.loading }}>
            <Show when={state.loading}>
                <span class='message'>Loading ...</span>
            </Show>

            <div class='actions'>
                <div class='left'></div>
                <div class='right'>
                    <button
                        class='styled icon'
                        disabled={state.page <= 0}
                        onClick={() => fetch_users(state.page - 1)}
                    >
                        <ChevronLeftIcon />
                    </button>
                    <button
                        class='styled icon'
                        disabled={state.users.length < 32}
                        onClick={() => fetch_users(state.page + 1)}
                    >
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>

            <div class='user-list'>
                {state.users.map((p, i) => (
                    <User
                        user={p}
                        update={p => {
                            if (!p) return fetch_users(state.page)

                            setState(
                                produce(s => {
                                    s.users[i] = p
                                })
                            )
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

type UserProps = {
    user: UserModel
    update(user?: UserModel): void
}
const User: Component<UserProps> = P => {
    type State = {
        loading: boolean
        edit: boolean
        name: string
        perms: Perms
        banned: boolean
        changed: number
    }
    const [state, setState] = createStore<State>({
        loading: false,
        edit: false,
        name: P.user.name,
        perms: new Perms(P.user.admin),
        banned: P.user.banned,
        changed: 0,
    })

    function user_update() {
        httpx({
            url: `/api/admin/users/${P.user.id}/`,
            method: 'PATCH',
            json: {
                banned: state.banned,
                name: state.name,
                perms: state.perms.perms,
            },
            onLoad(x) {
                if (x.status != 200) return
                P.update(x.response)
            },
        })
    }

    function reset() {
        setState({
            banned: P.user.banned,
            name: P.user.name,
            perms: new Perms(P.user.admin),
        })
    }

    const changed = createMemo(() => {
        state.changed
        let change = state.banned != P.user.banned || state.name != P.user.name
        if (!change) {
            if (state.perms.perms.length != P.user.admin.length) return true

            for (let [i, p] of state.perms.perms.entries()) {
                if (p != P.user.admin[i]) return true
            }
        }

        return change
    })

    return (
        <div class='user' classList={{ loading: state.loading }}>
            <Show when={state.loading}>
                <span class='message'>Loading...</span>
            </Show>
            <div class='top'>
                <div class='info'>
                    <UserIcon />
                    <span>{P.user.id}</span>
                    <span>{P.user.phone}</span>
                    <span>{P.user.name}</span>
                    <span>banned: {P.user.banned + ''}</span>
                    <span>admin: {new Perms(P.user.admin).any() + ''}</span>
                </div>
                <div class='user-actions'>
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
                            onAct={user_update}
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
                </div>
            </div>
            <Show when={state.edit}>
                <div class='bottom'>
                    <span>Name:</span>
                    <input
                        class='styled'
                        placeholder='user name'
                        maxLength={255}
                        value={state.name}
                        onInput={e => {
                            let name = e.currentTarget.value.slice(0, 255)
                            setState({ name })
                        }}
                    />
                    <span>Banned:</span>
                    <input
                        disabled={state.perms.get(Perms.MASTER)}
                        type='checkbox'
                        class='styled'
                        checked={state.banned}
                        onChange={e => {
                            let banned = e.currentTarget.checked
                            setState({ banned })
                        }}
                    />
                    <span>Perms</span>
                    <div
                        class='user-perms'
                        classList={{ disabled: state.perms.get(Perms.MASTER) }}
                    >
                        {PERMS_DISPLAY.map((p, pid) => (
                            <div class='perm'>
                                <label for={`${P.user.id}-perm-${pid}`}>
                                    {p.name}
                                </label>
                                <input
                                    id={`${P.user.id}-perm-${pid}`}
                                    disabled={
                                        p.perm == Perms.MASTER ||
                                        state.perms.get(Perms.MASTER)
                                    }
                                    type='checkbox'
                                    checked={state.perms.get(p.perm)}
                                    onChange={e => {
                                        setState(
                                            produce(s => {
                                                s.changed++
                                                s.perms.set(
                                                    p.perm,
                                                    e.currentTarget.checked
                                                )
                                            })
                                        )
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <Show when={P.user.photo}>
                        <span>Photo</span>
                        <div class='image'>
                            <img
                                draggable={false}
                                loading='lazy'
                                decoding='async'
                                src={`/record/up-${P.user.id}-${P.user.photo}`}
                            />
                        </div>
                    </Show>
                </div>
            </Show>
        </div>
    )
}
