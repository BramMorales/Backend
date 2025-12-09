require('dotenv').config();

module.exports = {
    environment: "development",
    app: {
        port: process.env.PORT || 4000
    },
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'postgres',
        password: process.env.MYSQL_PASSWORD || '@ADMINtij20',
        database: process.env.MYSQL_DB || 'postgres',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'notasecreta!',
        expiration: process.env.JWT_EXPIRATION || '7d',
        cookieExpires: process.env.JWT_COOKIE_EXPIRES || 1,
    }
}