import { Locale } from './types'

export default {
    BOOL: {
        false: 'خیر',
        true: 'بله',
    },
    // SORT_ORDER: {
    //     // desc: 'نزولی',
    //     // asc: 'صعودی',
    //     desc: 'پایین به بالا',
    //     asc: 'بالا به پایین',
    //     // desc: 'بالا به پایین',
    //     // asc: 'پایین به بالا',
    // },
    DAYS_OF_WEEK: {
        saturday: 'شنبه',
        sunday: 'یک شنبه',
        monday: 'دوشنبه',
        tuesday: 'سه شنبه',
        wednesday: 'چهارشنبه',
        thursday: 'پنج شنبه',
        friday: 'جمعه',
    },
    ERROR_CODE: {
        unknown: 'خطایی ناشناخته رخ داد',
        forbidden: 'درخواست غیرمجاز',
        bad_auth: 'احراز هویت نامعتبر',
        not_found: 'این مورد یافت نشد',
        server_error: 'خطای سرور',
        database_error: 'خطای پایگاه داده',

        index_out_of_bounds: 'آیتم از بازه خارج است',
        encode_webp_error: 'تبدیل تصویر به فرمت webp ناموفق بود',

        rate_limited: 'تعداد درخواست های شما از حد رد شده',
        bad_phone: 'شماره تلفن نامعتبر',

        user_banned: 'کاربر بن شده',

        bad_image: 'عکس نامعتبر',
        not_unique: 'مشابه این مورد پیداشد',
        bad_slug_abc: 'نشانه باید تمامن حروف انگلیسی باشد',
        bad_slug_len: 'حداقل طول نشانه 3 و حداکثر 250 است',
        bad_verification: 'تایید کد نامعتبر است',
        too_many_photos: 'تعداد عکس از حداکثر مجاز بیشتر است',
        count_min: 'حداقل تعداد را رعایت کنید!',
    },
} satisfies Locale
