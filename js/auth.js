/**
 * BioSpark Auth - Real Authentication with JWT
 */
const Auth = {
    async login(email, password) {
        try {
            const defaultUrl = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') ? 'http://localhost:5000/api' : 'https://bio-spark-t7a9.vercel.app/api';
            const baseUrl = typeof API !== 'undefined' ? API.BASE_URL : defaultUrl;
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                // If account is pending or blocked (403)
                if (response.status === 403) {
                    const msg = result.error || result.message || '';
                    if (msg.toLowerCase().includes('pending')) {
                        throw { 
                            status: 403, 
                            message: "حسابك قيد المراجعة، يرجى انتظار موافقة المدير الرئيسي." 
                        };
                    } else if (msg.toLowerCase().includes('blocked')) {
                        throw { 
                            status: 403, 
                            message: "تم حظر هذا الحساب، يرجى التواصل مع الإدارة." 
                        };
                    }
                }
                throw new Error(result.error || result.message || 'Login failed');
            }

            const userData = {
                id: result.data?.id || result.data?._id,
                name: result.data?.name || 'Admin User',
                email: result.data?.email || email,
                role: result.data?.role || 'admin',
                isSuperAdmin: !!result.data?.isSuperAdmin,
                status: result.data?.status || 'active',
                token: result.token
            };

            localStorage.setItem('biospark_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    async register(name, email, password) {
        try {
            const defaultUrl = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') ? 'http://localhost:5000/api' : 'https://bio-spark-t7a9.vercel.app/api';
            const baseUrl = typeof API !== 'undefined' ? API.BASE_URL : defaultUrl;
            const response = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Registration failed');
            }

            return result;
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('biospark_user');
        window.location.reload();
    },

    isLoggedIn() {
        const user = this.getUser();
        return !!(user && user.token);
    },

    isSuperAdmin() {
        const user = this.getUser();
        return !!(user && user.isSuperAdmin);
    },

    getUser() {
        try {
            const user = localStorage.getItem('biospark_user');
            return user ? JSON.parse(user) : null;
        } catch (err) {
            return null;
        }
    }
};
