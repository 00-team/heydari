import { Locale } from './types'

export default {
    BOOL: {
        false: 'خیر',
        true: 'بله',
    },
    SORT_ORDER: {
        // desc: 'نزولی',
        // asc: 'صعودی',
        desc: 'پایین به بالا',
        asc: 'بالا به پایین',
        // desc: 'بالا به پایین',
        // asc: 'پایین به بالا',
    },
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

        password_mismatch: 'رمز عبور اشتباه است!',
        rate_limited: 'تعداد درخواست های شما از حد رد شده',
        bad_phone: 'شماره تلفن نامعتبر',

        user_banned: 'کاربر بن شده',

        bad_image: 'عکس نامعتبر',
        bad_search_args: 'جستجوی نامعتبر',
        bad_username: '',
        forbidden_self_edit: 'خود را نمی توان ادیت کرد',
        hxr_already_exists: 'این درخواست قبلا ثبت شده و در انتظار است',
        not_unique: 'مشابه این مورد پیداشد',
        password_too_long: 'رمز بسیار طولانی',
        password_weak: 'رمز خیلی ضعیف',
        string_too_long: 'متن خیلی طولانی',
    },
} satisfies Locale
