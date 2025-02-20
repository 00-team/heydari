import { ProductModel, ProductTagModel } from 'models'
import { createStore } from 'solid-js/store'

type TagState = {
    [k in ProductTagModel['kind']]: {
        [k in ProductTagModel['part']]: ProductTagModel[]
    }
}
export const [tags, setTags] = createStore<TagState>({
    chair: { leg: [], bed: [] },
    table: { leg: [], bed: [] },
})

type popupType = {
    show: boolean
    type: 'edit' | 'add'
    product: ProductModel | null
    advanced: boolean

    errorSec: 'name' | 'slug' | 'code' | 'id' | 'img' | 'description'
    errorText: string

    files: File[]
}

type filtersType = {
    best: boolean
    onlyChair: boolean
    onlyTable: boolean
}

type stateType = {
    search: string

    filters: filtersType

    popup: popupType

    products: ProductModel[]
    page: number
    loading: boolean
}
export const [state, setState] = createStore<stateType>({
    search: '',
    filters: {
        best: false,
        onlyChair: false,
        onlyTable: false,
    },
    popup: {
        show: false,
        type: 'add',
        product: null,
        advanced: false,

        errorSec: 'name',
        errorText: '',

        files: [],
    },

    products: [],
    page: 0,
    loading: true,
})
