/**
 * BioSpark UI - Helper functions for DOM manipulation
 */
const UI = {
    showToast(message, type = 'success') {
        const toastEl = document.getElementById('liveToast');
        const toastMsg = document.getElementById('toast-message');
        
        if (toastEl && toastMsg) {
            toastEl.className = `toast align-items-center border-0 text-white bg-${type}`;
            toastMsg.textContent = message;
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!', 'info');
        }).catch(err => {
            console.error('Copy failed:', err);
            this.showToast('Failed to copy', 'danger');
        });
    },

    renderTable(containerId, collection, items, onEdit, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox text-muted display-1"></i>
                    <p class="text-muted mt-2">No items found in ${collection}.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-hover border-top">
                    <thead>
                        <tr>
                            <th class="ps-4">Image</th>
                            <th>Title</th>
                            <th>Date</th>
                    <th class="text-end pe-4" style="width: 1%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(item => {
            const img = item.imageUrl || item.image || 'https://via.placeholder.com/150';
            const displayDate = item.date ? new Date(item.date).toLocaleDateString() : (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A');
            const id = item._id || item.id;

            let titleDisplay = item.title || item.name || item.headline || 'Item';
            let subtitleDisplay = item.role || item.shortDescription || item.description || item.desc || item.eyebrow || '';

            if (collection === 'carousels') {
                const pageColors = {
                    home: 'bg-primary',
                    'for-schools': 'bg-success',
                    about: 'bg-info text-dark',
                    camps: 'bg-warning text-dark',
                    workshops: 'bg-purple'
                };
                const colorClass = pageColors[item.page] || 'bg-secondary';
                titleDisplay = `<span class="badge ${colorClass} text-uppercase me-2">${item.page || 'home'}</span> ${item.headline || titleDisplay}`;
                subtitleDisplay = `${item.eyebrow ? '[' + item.eyebrow + '] ' : ''}${item.description || ''}`;
            }

            html += `
                <tr>
                    <td class="ps-4">
                        <img src="${img}" class="item-img" alt="Item">
                    </td>
                    <td>
                        <div class="fw-bold text-dark">${titleDisplay}</div>
                        <small class="text-muted d-block text-truncate" style="max-width: 320px;">${subtitleDisplay}</small>
                    </td>
                    <td class="text-muted">${displayDate}</td>
                    <td class="text-end pe-4 text-nowrap">
                        <button class="btn btn-sm btn-light border btn-icon-small me-1 edit-btn" data-id="${id}">
                            <i class="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button class="btn btn-sm btn-light border btn-icon-small delete-btn" data-id="${id}">
                            <i class="bi bi-trash3 text-danger"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => onEdit(btn.getAttribute('data-id')));
        });
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => onDelete(btn.getAttribute('data-id')));
        });
    },

    renderDashboard(containerId, stats) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const s = {
            visits: stats.visits || 0,
            products: stats.products || 0,
            workshops: stats.workshops || 0,
            events: stats.events || 0,
            articles: stats.articles || 0
        };

        container.innerHTML = `
            <div class="row g-4 fade-in">
                <!-- Stat Cards -->
                ${this._createStatCard('Total Visits', s.visits.toLocaleString(), 'eye-fill', 'info')}
                ${this._createStatCard('Products', s.products, 'box-seam-fill', 'success')}
                ${this._createStatCard('Workshops', s.workshops, 'mortarboard-fill', 'primary')}
                ${this._createStatCard('Events', s.events, 'calendar-event-fill', 'warning')}
                ${this._createStatCard('Articles', s.articles, 'file-earmark-richtext-fill', 'danger')}
                ${this._createStatCard('Messages', stats.messages || 0, 'envelope-fill', 'secondary')}

                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold mb-0">Overview Analytics</h5>
                            <button class="btn btn-sm btn-outline-success">View Report</button>
                        </div>
                        <div class="card-body px-4">
                            <div class="py-5 text-center text-muted">
                                <i class="bi bi-graph-up display-1 opacity-25"></i>
                                <p class="mt-3">Activity Graph visualization would go here.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-header bg-transparent border-0 pt-4 px-4">
                            <h5 class="fw-bold mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body px-4">
                            <div class="list-group list-group-flush">
                                <a href="#products" class="list-group-item list-group-item-action border-0 px-0 py-3" data-link>
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle bg-light p-2 me-3"><i class="bi bi-plus-lg"></i></div>
                                        <span>Add New Product</span>
                                    </div>
                                </a>
                                <a href="#workshops" class="list-group-item list-group-item-action border-0 px-0 py-3" data-link>
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle bg-light p-2 me-3"><i class="bi bi-mortarboard"></i></div>
                                        <span>Create Workshop</span>
                                    </div>
                                </a>
                                <a href="#articles" class="list-group-item list-group-item-action border-0 px-0 py-3" data-link>
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle bg-light p-2 me-3"><i class="bi bi-journal-text"></i></div>
                                        <span>Write Article</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _createStatCard(title, val, icon, color) {
        return `
            <div class="col-md-6 col-lg-4 col-xl-2">
                <div class="card border-0 shadow-sm p-3 h-100 border-start border-4 border-${color}">
                    <div class="d-flex align-items-center">
                        <div class="icon-box bg-${color} bg-opacity-10 me-3">
                            <i class="bi bi-${icon} text-${color} fs-4"></i>
                        </div>
                        <div>
                            <small class="text-muted fw-medium d-block text-nowrap">${title}</small>
                            <h3 class="mb-0 fw-bold">${val}</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderProfile(containerId, profile) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="row justify-content-center fade-in">
                <div class="col-md-8 col-lg-6">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div class="bg-success py-5 text-center">
                            <img src="https://i.ibb.co/HTxXpcTM/logo.png" alt="Profile" class="rounded-circle border border-4 border-white shadow bg-white" width="128" height="128" style="object-fit: contain; padding: 10px;">
                        </div>
                        <div class="card-body p-4 text-center">
                            <h3 class="fw-bold mb-1">${profile.name}</h3>
                            <p class="text-muted mb-4">${profile.role?.toUpperCase() || (profile.isSuperAdmin ? 'SUPER ADMIN' : 'ADMINISTRATOR')}</p>
                            
                            <ul class="list-group list-group-flush text-start border-top pt-3">
                                <li class="list-group-item border-0 px-0 d-flex justify-content-between">
                                    <span class="text-muted">Email</span>
                                    <span class="fw-medium">${profile.email}</span>
                                </li>
                                <li class="list-group-item border-0 px-0 d-flex justify-content-between">
                                    <span class="text-muted">Account Status</span>
                                    <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3">${profile.status || 'Active'}</span>
                                </li>
                                <li class="list-group-item border-0 px-0 d-flex justify-content-between">
                                    <span class="text-muted">Join Date</span>
                                    <span class="fw-medium">${profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderUsersTable(containerId, users, onStatusChange, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No administrators found.</p></div>';
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table align-middle table-hover border-top mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">Admin</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th class="text-end pe-4" style="width: 1%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        users.forEach(user => {
            const statusClass = user.status === 'active' ? 'success' : (user.status === 'blocked' ? 'danger' : 'warning');
            const joined = new Date(user.createdAt || Date.now()).toLocaleDateString();
            const id = user._id || user.id;

            html += `
                <tr>
                    <td class="ps-4 py-3">
                        <div class="d-flex align-items-center">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random" class="rounded-circle me-3" width="40">
                            <div>
                                <div class="fw-bold text-dark">${user.name} ${user.isSuperAdmin ? '<span class="badge bg-primary ms-1" style="font-size: 10px;">Super</span>' : ''}</div>
                                <small class="text-muted">ID: ${id.slice(-6)}</small>
                            </div>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${statusClass} bg-opacity-10 text-${statusClass} rounded-pill px-3">${user.status}</span></td>
                    <td class="text-muted">${joined}</td>
                    <td class="text-end pe-4 text-nowrap">
                        <div class="btn-group btn-group-sm">
                            ${user.status === 'pending' ? `<button class="btn btn-outline-success approve-btn" data-id="${id}">Approve</button>` : ''}
                            ${user.status === 'active' ? `<button class="btn btn-outline-warning block-btn" data-id="${id}">Block</button>` : ''}
                            ${user.status === 'blocked' ? `<button class="btn btn-outline-success unblock-btn" data-id="${id}">Unblock</button>` : ''}
                            <button class="btn btn-outline-danger delete-user-btn" data-id="${id}" ${user.isSuperAdmin ? 'disabled' : ''}>Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        // Listeners
        container.querySelectorAll('.approve-btn').forEach(b => b.onclick = () => onStatusChange(b.dataset.id, 'active'));
        container.querySelectorAll('.block-btn').forEach(b => b.onclick = () => onStatusChange(b.dataset.id, 'blocked'));
        container.querySelectorAll('.unblock-btn').forEach(b => b.onclick = () => onStatusChange(b.dataset.id, 'active'));
        container.querySelectorAll('.delete-user-btn').forEach(b => b.onclick = () => onDelete(b.dataset.id));
    },

    renderVisitorsTable(containerId, visitors, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!visitors || visitors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-person-x text-muted display-1"></i>
                    <p class="text-muted mt-2">No visitors yet.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table align-middle table-hover border-top mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">Email Address</th>
                            <th>Date Subscribed</th>
                            <th class="text-end pe-4" style="width: 1%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        visitors.forEach(v => {
            const date = new Date(v.createdAt || Date.now()).toLocaleString();
            const id = v._id || v.id;

            html += `
                <tr>
                    <td class="ps-4 py-3">
                        <div class="d-flex align-items-center">
                            <div class="rounded-circle bg-success bg-opacity-10 text-success p-2 me-3">
                                <i class="bi bi-envelope-at"></i>
                            </div>
                            <div class="fw-bold text-dark">${v.email}</div>
                        </div>
                    </td>
                    <td class="text-muted">${date}</td>
                    <td class="text-end pe-4 text-nowrap">
                        <button class="btn btn-sm btn-outline-danger delete-visitor-btn" data-id="${id}">
                            <i class="bi bi-trash3 me-1"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        container.querySelectorAll('.delete-visitor-btn').forEach(b => {
            b.onclick = () => onDelete(b.dataset.id);
        });
    },

    renderMessagesTable(containerId, messages, onStatusChange, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!messages || messages.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-chat-left-dots text-muted display-1"></i>
                    <p class="text-muted mt-2">No messages received yet.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table align-middle table-hover border-top mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">From</th>
                            <th>Email</th>
                            <th>Message Preview</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th class="text-end pe-4" style="width: 1%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        messages.forEach(m => {
            const date = new Date(m.createdAt || Date.now()).toLocaleString();
            const id = m._id || m.id;
            const isReplied = m.status === 'replied';

            html += `
                <tr>
                    <td class="ps-4 py-3">
                        <div class="fw-bold text-dark">${m.name}</div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="me-2">${m.email}</span>
                            <button class="btn btn-sm btn-light border-0 py-0 px-1 copy-email-quick" data-email="${m.email}" title="Copy Email">
                                <i class="bi bi-copy scale-down"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="text-muted text-truncate" style="max-width: 250px; font-size: 0.9rem;">
                            ${m.message}
                        </div>
                    </td>
                    <td>
                        <span class="badge ${isReplied ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} rounded-pill px-3">
                            ${isReplied ? 'Replied' : 'Pending'}
                        </span>
                    </td>
                    <td class="text-muted" style="font-size: 0.85rem;">${date}</td>
                    <td class="text-end pe-4 text-nowrap">
                        <button class="btn btn-sm btn-outline-primary me-1 view-msg-btn" 
                                data-id="${id}" 
                                data-name="${m.name}" 
                                data-email="${m.email}" 
                                data-content="${m.message.replace(/"/g, '&quot;')}"
                                title="View Full Message">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-sm ${isReplied ? 'btn-success' : 'btn-outline-success'} me-1 reply-toggle-btn" 
                                data-id="${id}" 
                                data-status="${m.status}" 
                                title="${isReplied ? 'Mark as Unreplied' : 'Mark as Replied'}">
                            <i class="bi ${isReplied ? 'bi-check-lg' : 'bi-reply-fill'}"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-msg-btn" data-id="${id}" title="Delete Message">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        // Copy Email Quick
        container.querySelectorAll('.copy-email-quick').forEach(b => {
            b.onclick = (e) => {
                e.stopPropagation();
                this.copyToClipboard(b.dataset.email);
            };
        });

        // View Message Modal
        container.querySelectorAll('.view-msg-btn').forEach(b => {
            b.onclick = () => {
                document.getElementById('view-msg-name').textContent = b.dataset.name;
                document.getElementById('view-msg-email').textContent = b.dataset.email;
                document.getElementById('view-msg-content').textContent = b.dataset.content;
                
                document.getElementById('copy-email-btn').onclick = () => this.copyToClipboard(b.dataset.email);
                document.getElementById('copy-msg-btn').onclick = () => this.copyToClipboard(b.dataset.content);
                
                const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
                const modalBody = document.querySelector('#deleteModal .modal-body');
                const confirmBtn = document.getElementById('confirm-delete');
                
                modalBody.innerHTML = `
                    <div class="text-start">
                        <h5 class="fw-bold mb-1">${b.dataset.name}</h5>
                        <p class="text-muted small mb-3">${b.dataset.email}</p>
                        <div class="p-3 bg-light rounded border text-dark mb-2" style="white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
                            ${b.dataset.content}
                        </div>
                    </div>
                `;
                confirmBtn.style.display = 'none';
                modal.show();

                document.getElementById('deleteModal').addEventListener('hidden.bs.modal', function handler() {
                    confirmBtn.style.display = 'inline-block';
                    document.getElementById('deleteModal').removeEventListener('hidden.bs.modal', handler);
                });
            };
        });

        // Toggle Status
        container.querySelectorAll('.reply-toggle-btn').forEach(b => {
            b.onclick = () => {
                const currentStatus = b.dataset.status;
                const nextStatus = currentStatus === 'replied' ? 'pending' : 'replied';
                onStatusChange(b.dataset.id, nextStatus);
            };
        });

        // Delete
        container.querySelectorAll('.delete-msg-btn').forEach(b => {
            b.onclick = () => onDelete(b.dataset.id);
        });
    },

    renderSchoolInquiriesTable(containerId, inquiries, onStatusChange, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!inquiries || inquiries.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-clipboard-x text-muted display-1"></i>
                    <p class="text-muted mt-2">No school booking requests found.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table align-middle table-hover border-top mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">School & Contact</th>
                            <th>Program & Grade</th>
                            <th>Students & Date</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th class="text-end pe-4" style="width: 1%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        inquiries.forEach(inq => {
            const date = new Date(inq.createdAt || Date.now()).toLocaleDateString();
            const id = inq._id || inq.id;
            
            const statusBadges = {
                'New': 'bg-primary text-white',
                'Contacted': 'bg-info text-dark',
                'In Progress': 'bg-warning text-dark',
                'Closed': 'bg-success text-white'
            };

            const badgeClass = statusBadges[inq.status] || 'bg-secondary text-white';

            html += `
                <tr>
                    <td class="ps-4 py-3">
                        <div class="fw-bold text-dark">${inq.schoolName}</div>
                        <small class="text-muted d-block">${inq.contactPerson} (${inq.phone})</small>
                        <small class="text-primary d-block">${inq.email}</small>
                    </td>
                    <td>
                        <div class="fw-medium text-dark">${inq.interestedProgram || 'N/A'}</div>
                        <small class="text-muted d-block">${inq.studentGrade || ''}</small>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border me-1">${inq.studentCount || 'N/A'} Students</span>
                        <small class="text-muted d-block mt-1">${inq.preferredDate ? '📅 ' + inq.preferredDate : ''}</small>
                    </td>
                    <td>
                        <select class="form-select form-select-sm status-select" data-id="${id}" style="width: 130px;">
                            <option value="New" ${inq.status === 'New' ? 'selected' : ''}>🔵 New</option>
                            <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>ℹ️ Contacted</option>
                            <option value="In Progress" ${inq.status === 'In Progress' ? 'selected' : ''}>⏳ In Progress</option>
                            <option value="Closed" ${inq.status === 'Closed' ? 'selected' : ''}>✅ Closed</option>
                        </select>
                    </td>
                    <td class="text-muted" style="font-size: 0.85rem;">${date}</td>
                    <td class="text-end pe-4 text-nowrap">
                        <button class="btn btn-sm btn-outline-primary me-1 view-inq-btn" 
                                data-id="${id}" 
                                data-school="${inq.schoolName}" 
                                data-person="${inq.contactPerson}" 
                                data-email="${inq.email}" 
                                data-phone="${inq.phone}" 
                                data-program="${inq.interestedProgram}"
                                data-grade="${inq.studentGrade}"
                                data-count="${inq.studentCount}"
                                data-date="${inq.preferredDate}"
                                data-message="${(inq.message || '').replace(/"/g, '&quot;')}"
                                title="View Details">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-inq-btn" data-id="${id}" title="Delete Inquiry">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;

        // Status Change Handler
        container.querySelectorAll('.status-select').forEach(sel => {
            sel.onchange = () => {
                onStatusChange(sel.dataset.id, sel.value);
            };
        });

        // View Inquiry Details Modal
        container.querySelectorAll('.view-inq-btn').forEach(b => {
            b.onclick = () => {
                const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
                const modalBody = document.querySelector('#deleteModal .modal-body');
                const confirmBtn = document.getElementById('confirm-delete');
                
                modalBody.innerHTML = `
                    <div class="text-start">
                        <h4 class="fw-bold mb-1 text-success">${b.dataset.school}</h4>
                        <p class="text-muted mb-3"><strong>Contact:</strong> ${b.dataset.person} | ${b.dataset.phone} | ${b.dataset.email}</p>
                        
                        <div class="row g-2 mb-3">
                            <div class="col-6"><div class="p-2 bg-light rounded border"><strong>Program:</strong> ${b.dataset.program}</div></div>
                            <div class="col-6"><div class="p-2 bg-light rounded border"><strong>Grade:</strong> ${b.dataset.grade}</div></div>
                            <div class="col-6"><div class="p-2 bg-light rounded border"><strong>Students:</strong> ${b.dataset.count}</div></div>
                            <div class="col-6"><div class="p-2 bg-light rounded border"><strong>Preferred Date:</strong> ${b.dataset.date || 'Not specified'}</div></div>
                        </div>

                        <label class="fw-bold mb-1">Educational Goals & Message:</label>
                        <div class="p-3 bg-light rounded border text-dark mb-2" style="white-space: pre-wrap; max-height: 250px; overflow-y: auto;">
                            ${b.dataset.message || 'No additional details provided.'}
                        </div>
                        
                        <div class="mt-3">
                            <a href="https://wa.me/${b.dataset.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi ' + b.dataset.person + ', regarding your school inquiry for ' + b.dataset.school + ' at BioSpark...')}" target="_blank" class="btn btn-success btn-sm w-100 fw-bold">
                                <i class="bi bi-whatsapp me-1"></i> Contact via WhatsApp
                            </a>
                        </div>
                    </div>
                `;
                confirmBtn.style.display = 'none';
                modal.show();

                document.getElementById('deleteModal').addEventListener('hidden.bs.modal', function handler() {
                    confirmBtn.style.display = 'inline-block';
                    document.getElementById('deleteModal').removeEventListener('hidden.bs.modal', handler);
                });
            };
        });

        // Delete Handler
        container.querySelectorAll('.delete-inq-btn').forEach(b => {
            b.onclick = () => onDelete(b.dataset.id);
        });
    }
};
