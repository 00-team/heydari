import { UserModel } from 'models'
import { httpx } from 'shared'
import { createEffect, createRoot } from 'solid-js'
import { createStore } from 'solid-js/store'

type Perm = [number, number]
class Perms {
    static MASTER: Perm = [0, 0]

    static V_USER: Perm = [0, 1]
    static A_USER: Perm = [0, 2]
    static C_USER: Perm = [0, 3]
    static D_USER: Perm = [0, 4]

    static V_PRODUCT: Perm = [0, 5]
    static A_PRODUCT: Perm = [0, 6]
    static C_PRODUCT: Perm = [0, 7]
    static D_PRODUCT: Perm = [1, 0]

    static V_PRODUCT_TAG: Perm = [1, 1]
    static A_PRODUCT_TAG: Perm = [1, 2]
    static C_PRODUCT_TAG: Perm = [1, 3]
    static D_PRODUCT_TAG: Perm = [1, 4]

    perms: number[]
    constructor(perms: number[]) {
        for (let i = 32 - perms.length; i > 0; i--) {
            perms.push(0)
        }

        perms = perms.slice(0, 32)
        this.perms = perms
    }

    any(): boolean {
        for (let p of this.perms) {
            if (p != 0) return true
        }
        return false
    }

    check(...perms: Perm[]): boolean {
        if (this.get(Perms.MASTER)) return true

        for (let p of perms) {
            if (!this.get(p)) return false
        }

        return true
    }

    get([byte, bit]: Perm): boolean {
        if (this.perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        let n = this.perms[byte]
        return (n & f) == f
    }

    set([byte, bit]: Perm, value: boolean) {
        if (this.perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        if (value) {
            this.perms[byte] |= f
        } else {
            this.perms[byte] &= ~f
        }
    }
}

type SelfModel = {
    user: UserModel
    loged_in: boolean
    fetch: boolean
    perms: Perms
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
    }
}

const [self, setSelf] = createStore(await get_default())

createRoot(() => {
    createEffect(() => {
        if (!self.fetch && self.loged_in) return

        get_default().then(result => setSelf(result))
    })
})

export { self, setSelf }
