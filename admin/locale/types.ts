import {
    ErrorCode,
} from 'abi'
// import { UiEaterySectionKind } from 'pages/db/eatery'
// import { MenuFilters } from 'pages/db/eatery/menu/shared'

export type LocaleUnion<T extends string> = { [k in T]: string }

export const DAYS_OF_WEEK = [
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
] as const

export type DaysOfWeek = (typeof DAYS_OF_WEEK)[number]

type Table = {
    bool: 'true' | 'false'
    days_of_week: DaysOfWeek
    error_code: ErrorCode 
}

export type Locale = {
    [k in keyof Table as Uppercase<string & k>]: LocaleUnion<Table[k]>
}

export type GetterComp = {
    [k in keyof Table]: Table[k]
}

export type GetterGet = {
    [k in keyof Table]: (value: Table[k]) => string
}

export type GetterList = {
    [k in keyof Table as `${k}_list`]: () => LocaleUnion<Table[k]>
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]]
}[keyof T][]
export type GetterEntries = {
    [k in keyof Table as `${k}_entries`]: () => Entries<LocaleUnion<Table[k]>>
}

export type Getter = GetterGet & GetterList & GetterEntries
