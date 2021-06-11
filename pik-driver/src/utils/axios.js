import axios from 'axios';
import {API_BASE_URL} from '@env';

const instance = axios.create({
    baseURL: `${API_BASE_URL}/api/0.1/`,
    timeout: 30000,
    // proxy: {
    //     host: API_HOST,
    //     port: API_PORT,
    // },
    headers: {'X-Custom-Header': 'foobar'},
});

module.exports = instance;
