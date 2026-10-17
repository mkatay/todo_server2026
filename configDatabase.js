import dotenv from 'dotenv'


const envFile =process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';

dotenv.config({ path: envFile });


export const myConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:process.env.DB_PORT,
    connectionLimit: 10
};