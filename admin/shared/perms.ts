/* bit, byte */
export type Perm = [number, number]

var _perm_count_bit = 0
var _perm_count_byte = 0
const auto = () => {
    let perm: Perm = [_perm_count_bit++, _perm_count_byte]
    if (_perm_count_bit > 7) {
        _perm_count_bit = 0
        _perm_count_byte++
    }
    return perm
}
export class Perms {
    static MASTER: Perm = auto()

    static V_USER: Perm = auto()
    static A_USER: Perm = auto()
    static C_USER: Perm = auto()
    static D_USER: Perm = auto()

    static V_PRODUCT: Perm = auto()
    static A_PRODUCT: Perm = auto()
    static C_PRODUCT: Perm = auto()
    static D_PRODUCT: Perm = auto()

    static V_PRODUCT_TAG: Perm = auto()
    static A_PRODUCT_TAG: Perm = auto()
    static C_PRODUCT_TAG: Perm = auto()
    static D_PRODUCT_TAG: Perm = auto()

    static V_MATERIAL: Perm = auto()
    static A_MATERIAL: Perm = auto()
    static C_MATERIAL_INFO: Perm = auto()
    static C_MATERIAL_COUNT: Perm = auto()
    static D_MATERIAL: Perm = auto()

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

    get([bit, byte]: Perm): boolean {
        if (this.#perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        let n = this.#perms[byte]!
        return (n & f) == f
    }

    set([bit, byte]: Perm, value: boolean) {
        if (this.#perms.length <= byte) {
            throw new Error('invalid byte')
        }
        let f = 1 << bit
        if (value) {
            this.#perms[byte]! |= f
        } else {
            this.#perms[byte]! &= ~f
        }
    }

    get perms(): number[] {
        return this.#perms
    }
}
// @ts-ignore
delete globalThis._perm_count_bit
// @ts-ignore
delete globalThis._perm_count_byte
// @ts-ignore
delete globalThis.auto

export type PermDisplay = { perm: Perm; name: string }
export const PERMS_DISPLAY: PermDisplay[] = [
    { perm: Perms.MASTER, name: 'استاد' },

    { perm: Perms.V_USER, name: 'نمایش کاربران' },
    { perm: Perms.A_USER, name: 'افزایش کاربران' },
    { perm: Perms.C_USER, name: 'تغییر کاربران' },
    { perm: Perms.D_USER, name: 'حذف کاربران' },

    { perm: Perms.V_PRODUCT, name: 'نمایش محصولات' },
    { perm: Perms.A_PRODUCT, name: 'افزایش محصولات' },
    { perm: Perms.C_PRODUCT, name: 'تغییر محصولات' },
    { perm: Perms.D_PRODUCT, name: 'حذف محصولات' },

    { perm: Perms.V_PRODUCT_TAG, name: 'نمایش تگ محصولات' },
    { perm: Perms.A_PRODUCT_TAG, name: 'افزایش تگ محصولات' },
    { perm: Perms.C_PRODUCT_TAG, name: 'تغییر تگ محصولات' },
    { perm: Perms.D_PRODUCT_TAG, name: 'حذف تگ محصولات' },

    { perm: Perms.V_MATERIAL, name: 'نمایش انبار' },
    { perm: Perms.A_MATERIAL, name: 'اضافه به انبار' },
    { perm: Perms.C_MATERIAL_INFO, name: 'تغییر اطلاعات کالای انبار' },
    { perm: Perms.C_MATERIAL_COUNT, name: 'تغییر تعداد کالای انبار' },
    { perm: Perms.D_MATERIAL, name: 'حذف از انبار' },
]
