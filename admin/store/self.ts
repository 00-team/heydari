import { UserModel } from 'models'
import { Perms, httpx } from 'shared'
import { createEffect, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'

type SelfModel = {
    user: UserModel
    loged_in: boolean
    fetch: boolean
    perms: Perms
    loading: boolean
}

async function get_default(): Promise<SelfModel> {
    try {
        const [u, p] = await new Promise<[UserModel, Perms]>((ok, reject) => {
            httpx({
                url: '/api/user/',
                method: 'GET',
                reject,
                show_messages: false,
                onLoad(x) {
                    if (x.status != 200) return reject()
                    let user = x.response as UserModel
                    ok([user, new Perms(user.admin)])
                },
            })
        })

        return {
            user: u,
            loged_in: true,
            fetch: false,
            perms: p,
            loading: false,
        }
    } catch {}

    return {
        loged_in: false,
        fetch: true,
        perms: new Perms([]),
        user: {
            id: 0,
            phone: '',
            name: '',
            token: null,
            photo: null,
            admin: [],
            banned: false,
        },
        loading: false,
    }
}

const [self, setSelf] = createStore(await get_default())

createRoot(() => {
    createEffect(() => {
        if (!self.fetch && self.loged_in) return

        setSelf({ loading: true })

        get_default()
            .then(result => setSelf(result))
            .finally(() => setSelf({ loading: false }))
    })
})

export { self, setSelf, Perms }
