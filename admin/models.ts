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

export type MaterialsResponseModel = {
    materials: MaterialModel[]
    users: UserModel[]
}
