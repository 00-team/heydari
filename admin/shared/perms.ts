export type Perm = [number, number]
export class Perms {
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

    static V_MATERIAL: Perm = [1, 5]
    static A_MATERIAL: Perm = [1, 6]
    static C_MATERIAL: Perm = [1, 7]
    static D_MATERIAL: Perm = [2, 0]

    #perms: number[]
    constructor(perms: number[]) {
        perms = perms.map(p => Math.min(p, 255))

        for (let i = 32 - perms.length; i > 0; i--) {
            perms.push(0)
        }

        perms = perms.slice(0, 32)
        this.#perms = perms
    }

    any(): boolean {
        for (let p of this.#perms) {
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
        if (this.#perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        let n = this.#perms[byte]
        return (n & f) == f
    }

    set([byte, bit]: Perm, value: boolean) {
        if (this.#perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        if (value) {
            this.#perms[byte] |= f
        } else {
            this.#perms[byte] &= ~f
        }
    }

    get perms(): number[] {
        return this.#perms
    }
}

export type PermDisplay = { perm: Perm; name: string }
export const PERMS_DISPLAY: PermDisplay[] = [
    { perm: Perms.MASTER, name: 'استاد' },

    { perm: Perms.V_USER, name: 'نمایش کاربران' },
    { perm: Perms.A_USER, name: 'افرایش کاربران' },
    { perm: Perms.C_USER, name: 'تغییر کاربران' },
    { perm: Perms.D_USER, name: 'حذف کاربران' },

    { perm: Perms.V_PRODUCT, name: 'نمایش محصولات' },
    { perm: Perms.A_PRODUCT, name: 'افرایش محصولات' },
    { perm: Perms.C_PRODUCT, name: 'تغییر محصولات' },
    { perm: Perms.D_PRODUCT, name: 'حذف محصولات' },

    { perm: Perms.V_PRODUCT_TAG, name: 'نمایش تگ محصولات' },
    { perm: Perms.A_PRODUCT_TAG, name: 'افرایش تگ محصولات' },
    { perm: Perms.C_PRODUCT_TAG, name: 'تغییر تگ محصولات' },
    { perm: Perms.D_PRODUCT_TAG, name: 'حذف تگ محصولات' },

    { perm: Perms.V_MATERIAL, name: 'نمایش انبار' },
    { perm: Perms.A_MATERIAL, name: 'افرایش به انبار' },
    { perm: Perms.C_MATERIAL, name: 'تغییر کالای انبار' },
    { perm: Perms.D_MATERIAL, name: 'حذف از انبار' },
]
