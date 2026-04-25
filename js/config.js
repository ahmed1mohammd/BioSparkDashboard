// config.js
const CONFIG = {
    API_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:5000/api' 
        : '/api' // Or the production URL if known, but '/api' works if dashboard is hosted with backend
};
