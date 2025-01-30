require('dotenv').config();

module.exports = {
    // Configuration du serveur
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Configuration MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/arrosage-intelligent',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || '7d6c0c68f1f16b244d428bf89a4d06d41073ce92cb624f87a05f2ad91599b176bb2b255a9b28ef8c62adf5317d408a06f60e9971fdfce8da964cf5d438df2c05',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',

    // // Configuration Email (Gmail)
    // EMAIL_USER: process.env.EMAIL_USER,
    // EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    // // Configuration Android SMS Gateway
    // ANDROID_SMS_GATEWAY_URL: process.env.ANDROID_SMS_GATEWAY_URL,
    // ANDROID_SMS_PHONE: process.env.ANDROID_SMS_PHONE,

    // // Configuration WhatsApp
    // WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    // WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    // WHATSAPP_RECIPIENT_PHONE: process.env.WHATSAPP_RECIPIENT_PHONE,

    // // Configuration Telegram
    // TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    // TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,

    // // Configuration des notifications actives
    // ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    // ENABLE_SMS_GATEWAY: process.env.ENABLE_SMS_GATEWAY === 'true',
    // ENABLE_WHATSAPP_NOTIFICATIONS: process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true',
    // ENABLE_TELEGRAM_NOTIFICATIONS: process.env.ENABLE_TELEGRAM_NOTIFICATIONS === 'true',

    // // Seuils d'alertes
    // SEUILS: {
    //     NIVEAU_EAU_MIN: parseInt(process.env.ALERT_WATER_LEVEL_MIN) || 20,
    //     TEMPERATURE_MAX: parseInt(process.env.ALERT_TEMPERATURE_MAX) || 35,
    //     HUMIDITE_MIN: parseInt(process.env.ALERT_HUMIDITY_MIN) || 30,
    //     HUMIDITE_MAX: 80,
    //     HUMIDITE_SOL_MIN: 20,
    //     HUMIDITE_SOL_MAX: 90
    // }
};