export type UserModel = {
    id: number
    name: string | null
    phone: string
    token: string
    photo: string | null
    banned: boolean
    admin: boolean
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
}
