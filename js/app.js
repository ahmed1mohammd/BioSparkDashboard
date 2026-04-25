/**
 * BioSpark App - Main Application Controller
 */
const App = {
    async init() {
        try {
            console.log('App Initializing...');
            API.init();
            
            this.handleAuth();
            this.handleRegistration();
            this.initEventListeners();
            
            if (Auth.isLoggedIn()) {
                Router.init();
                this.updateProfileHTML();
            }
        } catch (err) {
            console.error('Critical Init Error:', err);
            UI.showToast('Failed to initialize application: ' + err.message, 'danger');
        }
    },

    handleAuth() {
        const loginPage = document.getElementById('login-page');
        const dashboardShell = document.getElementById('dashboard-shell');
        const loginForm = document.getElementById('login-form');

        const loggedIn = Auth.isLoggedIn();

        if (loggedIn) {
            if(loginPage) loginPage.classList.add('d-none');
            if(dashboardShell) dashboardShell.classList.remove('d-none');
            document.body.className = 'bg-light';
            this.updateProfileHTML();
        } else {
            if(loginPage) loginPage.classList.remove('d-none');
            if(dashboardShell) dashboardShell.classList.add('d-none');
            document.body.className = 'bg-success bg-opacity-10';
        }

        if (loginForm) {
            loginForm.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const submitBtn = loginForm.querySelector('button[type="submit"]');

                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
                    
                    await Auth.login(email, password);
                    UI.showToast('Welcome back!', 'success');
                    setTimeout(() => window.location.reload(), 800);
                } catch (err) {
                    // Check if specifically a 403 status (pending/blocked) via custom error object or status property
                    const errMsg = err.message || 'Login failed';
                    if (err.status === 403) {
                        UI.showToast(errMsg, 'warning');
                    } else {
                        UI.showToast(errMsg, 'danger');
                    }
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Sign In';
                }
            };
        }

        const logoutHandler = (e) => {
            e.preventDefault();
            Auth.logout();
        };

        const logoutBtn = document.getElementById('logout-btn');
        const logoutDrop = document.getElementById('logout-dropdown');
        if (logoutBtn) logoutBtn.onclick = logoutHandler;
        if (logoutDrop) logoutDrop.onclick = logoutHandler;
    },

    handleRegistration() {
        const showRegBtn = document.getElementById('show-register');
        const regModalEl = document.getElementById('registerModal');
        const regForm = document.getElementById('register-form');

        if (showRegBtn && regModalEl) {
            const regModal = new bootstrap.Modal(regModalEl);
            showRegBtn.onclick = (e) => { e.preventDefault(); regModal.show(); };

            if (regForm) {
                regForm.onsubmit = async (e) => {
                    e.preventDefault();
                    const name = document.getElementById('reg-name').value;
                    const email = document.getElementById('reg-email').value;
                    const password = document.getElementById('reg-password').value;
                    const submitBtn = regForm.querySelector('button[type="submit"]');

                    try {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Requesting Access...';
                        
                        await Auth.register(name, email, password);
                        
                        UI.showToast('Success! Your account is pending administrator approval.', 'success');
                        regModal.hide();
                        regForm.reset();
                    } catch (err) {
                        UI.showToast(err.message, 'danger');
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Register Admin';
                    }
                };
            }
        }
    },

    updateProfileHTML() {
        const user = Auth.getUser();
        if (user) {
            const profileName = document.querySelector('.dropdown .fw-medium');
            if (profileName) profileName.textContent = user.name;

            // Super Admin Visibility Control
            const manageAdminsLink = document.getElementById('nav-manage-admins');
            if (manageAdminsLink) {
                if (user.isSuperAdmin === true || user.role === 'admin') {
                    manageAdminsLink.classList.remove('d-none');
                } else {
                    manageAdminsLink.classList.add('d-none');
                }
            }
        }
    },

    initEventListeners() {
        const toggleSidebar = document.getElementById('toggle-sidebar');
        const closeSidebar = document.getElementById('close-sidebar');
        const sidebar = document.getElementById('sidebar');

        if (toggleSidebar) toggleSidebar.onclick = () => sidebar.classList.toggle('show');
        if (closeSidebar) closeSidebar.onclick = () => sidebar.classList.remove('show');

        // Image Preview logic
        const urlInput = document.getElementById('item-image-url');
        if (urlInput) {
            urlInput.oninput = () => {
                const url = urlInput.value.trim();
                const preview = document.getElementById('image-preview');
                const container = document.getElementById('image-preview-container');
                const placeholder = document.getElementById('upload-placeholder');
                
                if (url && preview) {
                    preview.src = url;
                    if(container) container.classList.remove('d-none');
                    if(placeholder) placeholder.classList.add('d-none');
                } else {
                    if(container) container.classList.add('d-none');
                    if(placeholder) placeholder.classList.remove('d-none');
                }
            };
        }
    },

    // --- CRUD Actions ---
    
    openAddModal(collection, callback) {
        const modalEl = document.getElementById('itemModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);
        
        document.getElementById('itemModalLabel').textContent = `Add New ${collection.slice(0, -1)}`;
        document.getElementById('itemForm').reset();
        document.getElementById('item-id').value = '';
        
        this.toggleModalFields(collection);

        const form = document.getElementById('itemForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('save-btn');
            try {
                submitBtn.disabled = true;
                await API.saveItem(collection, this.getFormData(collection));
                modal.hide();
                UI.showToast('Created successfully');
                callback();
            } catch (err) { UI.showToast(err.message, 'danger'); }
            finally { submitBtn.disabled = false; }
        };
        modal.show();
    },

    async openEditModal(collection, id, callback) {
        try {
            const items = await API.getData(collection);
            const item = items.find(i => (i._id || i.id) == id);
            if (!item) return;

            const modalEl = document.getElementById('itemModal');
            const modal = new bootstrap.Modal(modalEl);
            document.getElementById('itemModalLabel').textContent = `Edit ${collection.slice(0, -1)}`;
            
            document.getElementById('item-id').value = item._id || item.id;
            document.getElementById('item-title').value = item.title || '';
            document.getElementById('item-desc').value = item.description || item.desc || '';
            document.getElementById('item-image-url').value = item.imageUrl || item.image || '';
            
            if (item.category) document.getElementById('item-category').value = item.category;

            this.toggleModalFields(collection);

            const form = document.getElementById('itemForm');
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('save-btn');
                try {
                    submitBtn.disabled = true;
                    const data = this.getFormData(collection);
                    data.id = id;
                    await API.saveItem(collection, data);
                    modal.hide();
                    UI.showToast('Updated successfully');
                    callback();
                } catch (err) { UI.showToast(err.message, 'danger'); }
                finally { submitBtn.disabled = false; }
            };
            modal.show();
        } catch (err) { UI.showToast(err.message, 'danger'); }
    },

    toggleModalFields(collection) {
        const regContainer = document.getElementById('registration-container');
        const catContainer = document.getElementById('category-container');
        const titleContainer = document.getElementById('title-container');
        const descContainer = document.getElementById('description-container');
        const dateContainer = document.getElementById('date-container');

        if (collection === 'customers' || collection === 'reviews') {
            if(regContainer) regContainer.classList.add('d-none');
            if(catContainer) catContainer.classList.add('d-none');
            if(titleContainer) titleContainer.classList.add('d-none');
            if(descContainer) descContainer.classList.add('d-none');
            if(dateContainer) dateContainer.classList.add('d-none');
            
            // Remove required attribute for hidden fields to allow empty submission
            document.getElementById('item-title').required = false;
            document.getElementById('item-date').required = false;
        } else {
            if(regContainer) regContainer.classList.toggle('d-none', collection !== 'workshops' && collection !== 'events');
            if(catContainer) catContainer.classList.toggle('d-none', collection !== 'products');
            if(titleContainer) titleContainer.classList.remove('d-none');
            if(descContainer) descContainer.classList.remove('d-none');
            if(dateContainer) dateContainer.classList.remove('d-none');
            
            document.getElementById('item-title').required = true;
            document.getElementById('item-date').required = true;
        }
    },

    getFormData(collection) {
        return {
            title: document.getElementById('item-title').value,
            description: document.getElementById('item-desc').value,
            imageUrl: document.getElementById('item-image-url').value,
            date: document.getElementById('item-date').value,
            category: document.getElementById('item-category').value,
            registrationLink: document.getElementById('item-reg-link').value
        };
    },

    confirmDelete(collection, id, callback) {
        const modalEl = document.getElementById('deleteModal');
        const modal = new bootstrap.Modal(modalEl);
        document.getElementById('confirm-delete').onclick = async () => {
            try {
                await API.deleteItem(collection, id);
                modal.hide();
                UI.showToast('Deleted successfully', 'warning');
                callback();
            } catch (err) { UI.showToast(err.message, 'danger'); }
        };
        modal.show();
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
