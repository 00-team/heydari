export type UserModel = {
    id: number
    name: string | null
    phone: string
    token: string | null
    photo: string | null
    banned: boolean
    admin: number[]
}

export type ProductTagModel = {
    id: number
    name: string
    kind: 'chair' | 'table'
    part: 'leg' | 'bed'
    count: number
}

export type ProductModel = {
    id: number
    slug: string
    kind: ProductTagModel['kind']
    name: string
    code: string
    detail: string
    created_at: number
    updated_at: number
    thumbnail: string | null
    photos: string[]
    tag_leg: number | null
    tag_bed: number | null
    best: boolean
    description: string
    specification: { [key: string]: string }
    price: number
    count: number

    loading: boolean
}

export const EMPTY_PRODUCT: ProductModel = {
    loading: true,
    best: false,
    code: null,
    count: null,
    created_at: null,
    description: '',
    detail: '',
    id: null,
    kind: null,
    name: '',
    photos: [],
    price: 0,
    slug: '',
    specification: {},
    tag_bed: null,
    tag_leg: null,
    thumbnail: '',
    updated_at: null,
}

export type MaterialModel = {
    count: number
    created_at: number
    created_by: number
    detail: string
    id: number
    name: string
    photo: string
    updated_at: number
    updated_by: number
}
