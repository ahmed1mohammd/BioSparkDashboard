/**
 * BioSpark API - Real Backend Integration
 */
const API = {
    BASE_URL: (window.location.port === '5000') 
        ? '/api'
        : 'http://localhost:5000/api',

    async request(endpoint, options = {}) {
        const user = Auth.getUser();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        try {
            console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const contentType = response.headers.get('content-type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                result = { message: await response.text() };
            }
            
            if (!response.ok) {
                // Return status code in error for specific handling (like 403)
                const error = new Error(result.error || result.message || `Server error: ${response.status}`);
                error.status = response.status;
                
                if (response.status === 401) {
                    Auth.logout();
                }
                throw error;
            }
            
            return result;
        } catch (error) {
            console.error('API Fetch Error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Connection failed! The cloud server might be waking up (Cold Start). Please wait a moment and try again.');
            }
            throw error;
        }
    },

    init() {
        console.log('API Client Initialized');
    },

    async getData(collection) {
        const result = await this.request(`/${collection}`);
        return result.data || [];
    },

    async saveItem(collection, item) {
        const id = item.id || item._id;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/${collection}/${id}` : `/${collection}`;
        
        const body = { ...item };
        delete body.id;
        delete body._id;

        const result = await this.request(url, {
            method,
            body: JSON.stringify(body)
        });
        return result.data || result;
    },

    async deleteItem(collection, id) {
        await this.request(`/${collection}/${id}`, {
            method: 'DELETE'
        });
        return true;
    },

    async getStats() {
        try {
            const result = await this.request('/dashboard/stats');
            return result.data || result;
        } catch (err) {
            console.error('Stats fetch failed:', err);
            return { visits: 0, products: 0, workshops: 0, events: 0, articles: 0 };
        }
    },

    async getProfile() {
        const result = await this.request('/auth/profile');
        return result.data || result;
    },

    // --- Admin Management Methods ---

    async getUsers() {
        const result = await this.request('/auth/users');
        return result.data || [];
    },

    async updateUserStatus(id, status) {
        const result = await this.request(`/auth/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        return result.data || result;
    },

    async deleteUser(id) {
        await this.request(`/auth/users/${id}`, {
            method: 'DELETE'
        });
        return true;
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const user = Auth.getUser();
        const headers = {};
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`${this.BASE_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Upload failed');
        }
        return result.data?.url || result.url;
    },

    async getSchoolInquiries() {
        const result = await this.request('/inquiries/school');
        return result.data || [];
    },

    async updateSchoolInquiryStatus(id, status) {
        const result = await this.request(`/inquiries/school/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return result.data || result;
    },

    async deleteSchoolInquiry(id) {
        await this.request(`/inquiries/school/${id}`, {
            method: 'DELETE'
        });
        return true;
    },

    async getContactSubmissions() {
        const result = await this.request('/inquiries/contact');
        return result.data || [];
    },

    async updateContactStatus(id, status) {
        const result = await this.request(`/inquiries/contact/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return result.data || result;
    },

    async deleteContactSubmission(id) {
        await this.request(`/inquiries/contact/${id}`, {
            method: 'DELETE'
        });
        return true;
    }
};
