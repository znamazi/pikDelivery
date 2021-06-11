import axios from 'axios';

const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/0.1`,
    timeout: 5000,
    // proxy: {
    //     host: process.env.NEXT_PUBLIC_HOST,
    //     port: process.env.NEXT_PUBLIC_API_PORT
    // },
    headers: {'X-Custom-Header': 'foobar'}
});

module.exports = instance;
