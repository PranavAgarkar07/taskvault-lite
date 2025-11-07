import axios from 'axios'

const API=axios.create({
    baseURL:"https://taskvault-lite.onrender.com/api/"
});

export default API;