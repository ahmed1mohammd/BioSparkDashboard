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

        // Image File Cloudinary Upload logic
        const fileInput = document.getElementById('item-image-file');
        const uploadStatus = document.getElementById('upload-status');
        if (fileInput) {
            fileInput.onchange = async () => {
                const file = fileInput.files[0];
                if (!file) return;

                try {
                    if (uploadStatus) {
                        uploadStatus.classList.remove('d-none', 'text-danger', 'text-success');
                        uploadStatus.classList.add('text-primary');
                        uploadStatus.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Uploading to Cloudinary...';
                    }

                    const uploadedUrl = await API.uploadImage(file);
                    
                    if (urlInput) {
                        urlInput.value = uploadedUrl;
                        urlInput.dispatchEvent(new Event('input'));
                    }

                    if (uploadStatus) {
                        uploadStatus.classList.remove('text-primary');
                        uploadStatus.classList.add('text-success');
                        uploadStatus.innerHTML = '<i class="bi bi-check-circle me-1"></i>Uploaded to Cloudinary!';
                    }
                    UI.showToast('Image uploaded successfully to Cloudinary', 'success');
                } catch (err) {
                    console.error('File Upload Error:', err);
                    if (uploadStatus) {
                        uploadStatus.classList.remove('text-primary');
                        uploadStatus.classList.add('text-danger');
                        uploadStatus.textContent = 'Upload failed: ' + err.message;
                    }
                    UI.showToast('Upload failed: ' + err.message, 'danger');
                }
            };
        }

        // Category selection change logic for custom category
        const catSelect = document.getElementById('item-category');
        const customCatInput = document.getElementById('item-custom-category');
        if (catSelect && customCatInput) {
            catSelect.onchange = () => {
                if (catSelect.value === '__custom__') {
                    customCatInput.classList.remove('d-none');
                    customCatInput.focus();
                } else {
                    customCatInput.classList.add('d-none');
                    customCatInput.value = '';
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
        
        const dynamicFields = ['item-role', 'item-agegroup', 'item-duration', 'item-price', 'item-saleprice', 'item-location', 'item-linkedin', 'item-facebook', 'item-tiktok', 'item-reg-link', 'item-date', 'item-size'];
        dynamicFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        const fileInput = document.getElementById('item-image-file');
        const uploadStatus = document.getElementById('upload-status');
        if (fileInput) fileInput.value = '';
        if (uploadStatus) { uploadStatus.classList.add('d-none'); uploadStatus.innerHTML = ''; }
        const urlInput = document.getElementById('item-image-url');
        if (urlInput) urlInput.dispatchEvent(new Event('input'));
        
        const catSelect = document.getElementById('item-category');
        const customCatInput = document.getElementById('item-custom-category');
        if (catSelect) catSelect.selectedIndex = 0;
        if (customCatInput) { customCatInput.classList.add('d-none'); customCatInput.value = ''; }

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
            document.getElementById('item-title').value = item.title || item.name || '';
            document.getElementById('item-desc').value = item.description || item.bio || item.shortDescription || item.desc || '';
            document.getElementById('item-image-url').value = item.imageUrl || item.image || '';

            const setField = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val || '';
            };

            setField('item-role', item.role);
            setField('item-agegroup', item.ageGroup || item.ageRange || item.targetGrades);
            setField('item-duration', item.duration);
            setField('item-price', item.price);
            setField('item-saleprice', item.salePrice);
            setField('item-location', item.location);
            setField('item-reg-link', item.registrationLink);
            setField('item-date', item.date || item.dates);
            setField('item-size', item.size || 'medium');

            setField('item-page', item.page || 'home');
            setField('item-eyebrow', item.eyebrow || '');
            setField('item-primary-btn-text', item.primaryBtnText || '');
            setField('item-primary-btn-link', item.primaryBtnLink || '');
            setField('item-secondary-btn-text', item.secondaryBtnText || '');
            setField('item-secondary-btn-link', item.secondaryBtnLink || '');

            if (item.socialLinks) {
                setField('item-linkedin', item.socialLinks.linkedin);
                setField('item-facebook', item.socialLinks.facebook);
                setField('item-tiktok', item.socialLinks.tiktok);
            } else {
                setField('item-linkedin', '');
                setField('item-facebook', '');
                setField('item-tiktok', '');
            }
            
            const catSelect = document.getElementById('item-category');
            const customCatInput = document.getElementById('item-custom-category');
            if (item.category && catSelect) {
                let exists = Array.from(catSelect.options).some(opt => opt.value === item.category);
                if (!exists) {
                    const customOpt = document.createElement('option');
                    customOpt.value = item.category;
                    customOpt.textContent = item.category;
                    const customOptionRef = catSelect.querySelector('option[value="__custom__"]');
                    if (customOptionRef) catSelect.insertBefore(customOpt, customOptionRef);
                    else catSelect.appendChild(customOpt);
                }
                catSelect.value = item.category;
                if (customCatInput) { customCatInput.classList.add('d-none'); customCatInput.value = ''; }
            }

            const fileInput = document.getElementById('item-image-file');
            const uploadStatus = document.getElementById('upload-status');
            if (fileInput) fileInput.value = '';
            if (uploadStatus) { uploadStatus.classList.add('d-none'); uploadStatus.innerHTML = ''; }
            const urlInputEl = document.getElementById('item-image-url');
            if (urlInputEl) urlInputEl.dispatchEvent(new Event('input'));

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
        const titleLabel = document.getElementById('title-label');
        const descLabel = document.getElementById('desc-label');

        const regContainer = document.getElementById('registration-container');
        const catContainer = document.getElementById('category-container');
        const titleContainer = document.getElementById('title-container');
        const descContainer = document.getElementById('description-container');
        const dateContainer = document.getElementById('date-container');
        const roleContainer = document.getElementById('role-container');
        const agegroupContainer = document.getElementById('agegroup-container');
        const durationContainer = document.getElementById('duration-container');
        const priceContainer = document.getElementById('price-container');
        const salepriceContainer = document.getElementById('saleprice-container');
        const locationContainer = document.getElementById('location-container');
        const socialsContainer = document.getElementById('socials-container');
        const sizeContainer = document.getElementById('size-container');
        const carouselContainer = document.getElementById('carousel-fields-container');

        if (titleLabel) titleLabel.textContent = collection === 'board-members' ? 'Member Name' : (collection === 'carousels' ? 'Headline / Slide Title' : 'Title');
        if (descLabel) descLabel.textContent = collection === 'board-members' ? 'Biography / Details' : (collection === 'carousels' ? 'Slide Subtitle / Description' : 'Description');

        if (carouselContainer) carouselContainer.classList.toggle('d-none', collection !== 'carousels');
        if (roleContainer) roleContainer.classList.toggle('d-none', collection !== 'board-members');
        if (socialsContainer) socialsContainer.classList.toggle('d-none', collection !== 'board-members');

        if (agegroupContainer) agegroupContainer.classList.toggle('d-none', !['workshops', 'camps', 'programs'].includes(collection));
        if (durationContainer) durationContainer.classList.toggle('d-none', !['workshops', 'camps', 'programs'].includes(collection));

        if (priceContainer) priceContainer.classList.toggle('d-none', !['products', 'workshops', 'camps'].includes(collection));
        if (salepriceContainer) salepriceContainer.classList.toggle('d-none', !['products', 'workshops', 'camps'].includes(collection));

        if (locationContainer) locationContainer.classList.toggle('d-none', !['workshops', 'camps'].includes(collection));

        if (dateContainer) dateContainer.classList.toggle('d-none', !['events', 'camps', 'news'].includes(collection));

        if (catContainer) catContainer.classList.toggle('d-none', ['customers', 'reviews', 'board-members', 'carousels'].includes(collection));
        if (sizeContainer) sizeContainer.classList.toggle('d-none', collection !== 'gallery');

        if (regContainer) regContainer.classList.toggle('d-none', !['workshops', 'events', 'camps'].includes(collection));

        if (titleContainer) titleContainer.classList.remove('d-none');
        if (descContainer) descContainer.classList.remove('d-none');

        const titleInput = document.getElementById('item-title');
        if (titleInput) titleInput.required = !['customers', 'reviews'].includes(collection);
    },

    getFormData(collection) {
        const catSelect = document.getElementById('item-category');
        const customCatInput = document.getElementById('item-custom-category');
        let categoryVal = catSelect ? catSelect.value : '';
        if (categoryVal === '__custom__' && customCatInput && customCatInput.value.trim()) {
            categoryVal = customCatInput.value.trim();
        }

        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        const titleVal = getVal('item-title');
        const descVal = getVal('item-desc');
        const imageVal = getVal('item-image-url');
        const roleVal = getVal('item-role');
        const agegroupVal = getVal('item-agegroup');
        const durationVal = getVal('item-duration');
        const priceVal = parseFloat(getVal('item-price')) || 0;
        const salepriceVal = parseFloat(getVal('item-saleprice')) || 0;
        const locationVal = getVal('item-location');
        const regLinkVal = getVal('item-reg-link');
        const dateVal = getVal('item-date');
        const sizeVal = getVal('item-size') || 'medium';

        const pageVal = getVal('item-page') || 'home';
        const eyebrowVal = getVal('item-eyebrow');
        const primaryBtnTextVal = getVal('item-primary-btn-text');
        const primaryBtnLinkVal = getVal('item-primary-btn-link');
        const secondaryBtnTextVal = getVal('item-secondary-btn-text');
        const secondaryBtnLinkVal = getVal('item-secondary-btn-link');

        const linkedinVal = getVal('item-linkedin');
        const facebookVal = getVal('item-facebook');
        const tiktokVal = getVal('item-tiktok');

        return {
            title: titleVal,
            headline: titleVal,
            name: titleVal,
            role: roleVal || descVal,
            description: descVal,
            shortDescription: descVal,
            bio: descVal,
            imageUrl: imageVal,
            image: imageVal,
            category: categoryVal,
            size: sizeVal,
            ageGroup: agegroupVal,
            ageRange: agegroupVal,
            targetGrades: agegroupVal,
            duration: durationVal,
            price: priceVal,
            salePrice: salepriceVal,
            location: locationVal,
            registrationLink: regLinkVal,
            date: dateVal,
            dates: dateVal,
            page: pageVal,
            eyebrow: eyebrowVal,
            primaryBtnText: primaryBtnTextVal,
            primaryBtnLink: primaryBtnLinkVal,
            secondaryBtnText: secondaryBtnTextVal,
            secondaryBtnLink: secondaryBtnLinkVal,
            socialLinks: {
                linkedin: linkedinVal,
                facebook: facebookVal,
                tiktok: tiktokVal
            }
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
