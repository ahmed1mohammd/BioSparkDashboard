/**
 * BioSpark Router - Handles view changes with Async support
 */
const Router = {
    routes: {
        dashboard: { title: 'Dashboard', render: async () => UI.renderDashboard('content-area', await API.getStats()) },
        profile: { title: 'My Profile', render: async () => UI.renderProfile('content-area', await API.getProfile()) },
        users: { title: 'Manage Administrators', render: () => Router.renderAdminsPage() },
        programs: { title: 'School Programs', render: () => Router.renderDataPage('programs') },
        'school-inquiries': { title: 'School Booking Requests', render: () => Router.renderSchoolInquiriesPage() },
        products: { title: 'Products', render: () => Router.renderDataPage('products') },
        workshops: { title: 'Workshops', render: () => Router.renderDataPage('workshops') },
        camps: { title: 'Camps', render: () => Router.renderDataPage('camps') },
        carousels: { title: 'Hero Carousels', render: () => Router.renderDataPage('carousels') },
        'board-members': { title: 'Board Members', render: () => Router.renderDataPage('board-members') },
        events: { title: 'Events', render: () => Router.renderDataPage('events') },
        articles: { title: 'Articles', render: () => Router.renderDataPage('articles') },
        gallery: { title: 'Photo Gallery / Moments', render: () => Router.renderDataPage('gallery') },
        customers: { title: 'Our Customers / Partners', render: () => Router.renderDataPage('customers') },
        reviews: { title: 'Customer Feedback', render: () => Router.renderDataPage('reviews') },
        visitors: { title: 'Visitors Email List', render: () => Router.renderVisitorsPage() },
        messages: { title: 'Contact Messages', render: () => Router.renderMessagesPage() }
    },

    currentRoute: 'dashboard',

    init() {
        document.body.addEventListener('click', e => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('href').replace('#', '');
                this.navigateTo(route);
            }
        });

        window.addEventListener('hashchange', () => {
            const route = window.location.hash.replace('#', '');
            if (route && route !== this.currentRoute && this.routes[route]) {
                this.navigateTo(route, false);
            }
        });

        const initialRoute = window.location.hash.replace('#', '');
        this.navigateTo(initialRoute || this.currentRoute);
    },

    async navigateTo(route, updateHash = true) {
        if (!route || !this.routes[route]) route = 'dashboard';
        
        // Security Check for Manage Admins
        if (route === 'users' && !Auth.isSuperAdmin()) {
            UI.showToast('Access Denied: Super Admin only.', 'danger');
            this.navigateTo('dashboard');
            return;
        }

        this.currentRoute = route;
        if (updateHash && window.location.hash !== `#${route}`) {
            window.location.hash = `#${route}`;
        }

        document.getElementById('page-title').textContent = this.routes[route].title;
        
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            const linkRoute = link.getAttribute('href').replace('#', '');
            if (linkRoute === route) {
                link.classList.add('active');
            }
        });

        if (window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            if(sidebar) sidebar.classList.remove('show');
        }

        // Show loading state
        document.getElementById('content-area').innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
                <div class="spinner-border text-success" role="status"></div>
            </div>
        `;

        try {
            await this.routes[route].render();
        } catch (err) {
            UI.showToast('Error loading page: ' + err.message, 'danger');
        }
    },

    async renderAdminsPage() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="fade-in">
                <div class="mb-4">
                    <h4 class="fw-bold mb-1">Manage Administrators</h4>
                    <p class="text-muted small">Approve new registrations or block accounts.</p>
                </div>
                <div class="card border-0 shadow-sm overflow-hidden">
                    <div id="users-table-container">
                        <div class="p-5 text-center"><div class="spinner-border text-success"></div></div>
                    </div>
                </div>
            </div>
        `;

        const refreshUsers = async () => {
            try {
                const users = await API.getUsers();
                UI.renderUsersTable('users-table-container', users, 
                    async (id, status) => {
                        try {
                            await API.updateUserStatus(id, status);
                            UI.showToast(`User marked as ${status}`);
                            refreshUsers();
                        } catch (err) { UI.showToast(err.message, 'danger'); }
                    },
                    async (id) => {
                        if (confirm('Are you sure you want to permanently delete this user?')) {
                            try {
                                await API.deleteUser(id);
                                UI.showToast('User deleted', 'warning');
                                refreshUsers();
                            } catch (err) { UI.showToast(err.message, 'danger'); }
                        }
                    }
                );
            } catch (err) {
                UI.showToast('Failed to load users', 'danger');
            }
        };

        await refreshUsers();
    },

    async renderDataPage(collection) {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="fw-bold mb-0">Manage ${collection}</h4>
                    <button class="btn btn-success d-flex align-items-center fw-bold" id="add-new-btn">
                        <i class="bi bi-plus-lg me-2"></i> Add New
                    </button>
                </div>
                <div class="card border-0 shadow-sm overflow-hidden">
                    <div id="table-container">
                        <div class="p-5 text-center"><div class="spinner-border text-success"></div></div>
                    </div>
                </div>
            </div>
        `;

        const refreshTable = async () => {
            try {
                const items = await API.getData(collection);
                UI.renderTable('table-container', collection, items, 
                    (id) => App.openEditModal(collection, id, refreshTable), 
                    (id) => App.confirmDelete(collection, id, refreshTable)
                );
            } catch (err) {
                UI.showToast(err.message, 'danger');
            }
        };

        await refreshTable();

        const addBtn = document.getElementById('add-new-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                App.openAddModal(collection, refreshTable);
            };
        }
    },

    async renderVisitorsPage() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="fade-in">
                <div class="mb-4">
                    <h4 class="fw-bold mb-1">Visitors List (الزائرين)</h4>
                    <p class="text-muted small">List of emails collected from website visitors.</p>
                </div>
                <div class="card border-0 shadow-sm overflow-hidden">
                    <div id="visitors-table-container">
                        <div class="p-5 text-center"><div class="spinner-border text-success"></div></div>
                    </div>
                </div>
            </div>
        `;

        const refreshVisitors = async () => {
            try {
                const visitors = await API.getData('visitors');
                UI.renderVisitorsTable('visitors-table-container', visitors, 
                    async (id) => {
                        if (confirm('Are you sure you want to remove this email?')) {
                            try {
                                await API.deleteItem('visitors', id);
                                UI.showToast('Visitor removed', 'warning');
                                refreshVisitors();
                            } catch (err) { UI.showToast(err.message, 'danger'); }
                        }
                    }
                );
            } catch (err) {
                UI.showToast('Failed to load visitors', 'danger');
            }
        };

        await refreshVisitors();
    },

    async renderMessagesPage() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="fade-in">
                <div class="mb-4">
                    <h4 class="fw-bold mb-1">Contact Messages</h4>
                    <p class="text-muted small">Messages received through the website contact form.</p>
                </div>
                <div class="card border-0 shadow-sm overflow-hidden">
                    <div id="messages-table-container">
                        <div class="p-5 text-center"><div class="spinner-border text-success"></div></div>
                    </div>
                </div>
            </div>
        `;

        const refreshMessages = async () => {
            try {
                const messages = await API.getContactSubmissions();
                UI.renderMessagesTable('messages-table-container', messages, 
                    async (id, newStatus) => {
                        try {
                            await API.updateContactStatus(id, newStatus);
                            UI.showToast(`Status updated to ${newStatus}`);
                            refreshMessages();
                        } catch (err) { UI.showToast(err.message, 'danger'); }
                    },
                    async (id) => {
                        if (confirm('Are you sure you want to delete this message?')) {
                            try {
                                await API.deleteContactSubmission(id);
                                UI.showToast('Message deleted', 'warning');
                                refreshMessages();
                            } catch (err) { UI.showToast(err.message, 'danger'); }
                        }
                    }
                );
            } catch (err) {
                UI.showToast('Failed to load messages: ' + err.message, 'danger');
            }
        };

        await refreshMessages();
    },

    async renderSchoolInquiriesPage() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="fade-in">
                <div class="mb-4">
                    <h4 class="fw-bold mb-1">School Booking Requests (طلبات حجز المدارس)</h4>
                    <p class="text-muted small">Inquiries and requests submitted by schools through the "For Schools" page.</p>
                </div>
                <div class="card border-0 shadow-sm overflow-hidden">
                    <div id="school-inquiries-table-container">
                        <div class="p-5 text-center"><div class="spinner-border text-success"></div></div>
                    </div>
                </div>
            </div>
        `;

        const refreshInquiries = async () => {
            try {
                const inquiries = await API.getSchoolInquiries();
                UI.renderSchoolInquiriesTable('school-inquiries-table-container', inquiries, 
                    async (id, newStatus) => {
                        try {
                            await API.updateSchoolInquiryStatus(id, newStatus);
                            UI.showToast(`Status updated to ${newStatus}`);
                            refreshInquiries();
                        } catch (err) { UI.showToast(err.message, 'danger'); }
                    },
                    async (id) => {
                        if (confirm('Are you sure you want to delete this school inquiry?')) {
                            try {
                                await API.deleteSchoolInquiry(id);
                                UI.showToast('School inquiry deleted', 'warning');
                                refreshInquiries();
                            } catch (err) { UI.showToast(err.message, 'danger'); }
                        }
                    }
                );
            } catch (err) {
                UI.showToast('Failed to load school inquiries: ' + err.message, 'danger');
            }
        };

        await refreshInquiries();
    }
};
