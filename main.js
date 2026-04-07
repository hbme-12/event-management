document.addEventListener("DOMContentLoaded", () => {
    // Seed data (used only when no saved events exist yet)
    const seedEvents = [
        {
            id: 1,
            title: "Q3 Strategy Planning & Roadmap",
            type: "Masterclass",
            description: "Deep dive into our Q3 product roadmap, covering key OKRs, engineering timelines, and marketing alignments.",
            date: "Nov 15, 2026",
            time: "10:00 AM - 12:00 PM EST",
            speaker: "Sarah Jenkins, CPO",
            status: "upcoming"
        },
        {
            id: 2,
            title: "Intro to Advanced React Patterns",
            type: "Webinar",
            description: "Learn modern React design patterns including Compound Components, Render Props (legacy review), and Custom Hooks.",
            date: "Nov 20, 2026",
            time: "2:00 PM - 3:30 PM EST",
            speaker: "Alex Rivera, Lead Dev",
            status: "upcoming"
        },
        {
            id: 3,
            title: "Team Building workshop: Communication",
            type: "Workshop",
            description: "Interactive session on cross-team communication, resolving conflicts early, and building a stronger remote culture.",
            date: "Dec 05, 2026",
            time: "1:00 PM - 4:00 PM EST",
            speaker: "HR Dept",
            status: "upcoming"
        },
        {
            id: 4,
            title: "Q2 Townhall & Performance Review",
            type: "Townhall",
            description: "Company-wide meeting discussing our stellar Q2 performance.",
            date: "Jul 10, 2026",
            time: "11:00 AM - 12:30 PM EST",
            speaker: "David Chen, CEO",
            status: "completed"
        },
        {
            id: 5,
            title: "Security & Compliance 101",
            type: "Webinar",
            description: "Mandatory training on new data handling policies, GDPR requirements, and internal security protocols.",
            date: "Aug 22, 2026",
            time: "3:00 PM - 4:00 PM EST",
            speaker: "Elena Rostova, CISO",
            status: "completed"
        }
    ];

    const STORAGE_KEY = 'eventsData';

    let eventsData = loadEvents();
    let currentTab = 'upcoming';
    let searchQuery = '';

    // DOM Elements
    const eventsContainer = document.getElementById("eventsContainer");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const searchInput = document.getElementById("searchInput");
    const upcomingCount = document.getElementById("upcomingCount");
    const completedCount = document.getElementById("completedCount");
    const emptyState = document.getElementById("emptyState");
    const addEventBtn = document.getElementById("addEventBtn");
    const newEventModal = document.getElementById("newEventModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const newEventForm = document.getElementById("newEventForm");
    const newEventError = document.getElementById("newEventError");
    const evtTitle = document.getElementById("evtTitle");

    // Initialize View
    updateCounts();
    renderEvents();

    // New event modal listeners
    addEventBtn?.addEventListener('click', openNewEventModal);
    closeModalBtn?.addEventListener('click', closeNewEventModal);
    cancelModalBtn?.addEventListener('click', closeNewEventModal);

    newEventModal?.addEventListener('click', (e) => {
        if (e.target === newEventModal) closeNewEventModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newEventModal && !newEventModal.classList.contains('hidden')) {
            closeNewEventModal();
        }
    });

    newEventForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        newEventError.classList.add('hidden');
        newEventError.textContent = '';

        const fd = new FormData(newEventForm);
        const title = String(fd.get('title') || '').trim();
        const type = String(fd.get('type') || '').trim();
        const description = String(fd.get('description') || '').trim();
        const dateRaw = String(fd.get('date') || '').trim(); // yyyy-mm-dd
        const timeRaw = String(fd.get('time') || '').trim(); // HH:MM
        const speaker = String(fd.get('speaker') || '').trim();
        const status = String(fd.get('status') || '').trim();
        const automationFolder = String(fd.get('automationFolder') || '').trim();
        const emailTemplates = String(fd.get('emailTemplates') || '').trim();
        const whatsappTemplate = String(fd.get('whatsappTemplate') || '').trim();
        const slackChannel = String(fd.get('slackChannel') || '').trim();
        const googleSheet = String(fd.get('googleSheet') || '').trim();

        if (!title || !type || !description || !dateRaw || !timeRaw || !speaker || !status) {
            showFormError('Please fill in all fields.');
            return;
        }

        if (status !== 'upcoming' && status !== 'completed') {
            showFormError('Invalid status.');
            return;
        }

        const newEvt = {
            id: Date.now(),
            title,
            type,
            description,
            date: formatDateForCard(dateRaw),
            time: formatTimeForCard(timeRaw),
            speaker,
            status,
            automationFolder,
            emailTemplates,
            whatsappTemplate,
            slackChannel,
            googleSheet
        };

        eventsData.unshift(newEvt);
        saveEvents();
        updateCounts();
        renderEvents();
        closeNewEventModal();
    });

    // Setup Tab Listeners
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            // Set current tab & re-render
            currentTab = btn.getAttribute('data-tab');
            renderEvents();
        });
    });

    // Setup Search Listener
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderEvents();
    });

    // Card action handling (event delegation)
    eventsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.getAttribute('data-action');
        const eventId = btn.getAttribute('data-event-id');

        if (action === 'edit' && eventId) {
            window.location.href = `event.html?id=${encodeURIComponent(eventId)}`;
        }
    });

    // --- Core Functions ---
    function loadEvents() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEvents));
                return [...seedEvents];
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [...seedEvents];
        } catch (_) {
            return [...seedEvents];
        }
    }

    function saveEvents() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsData));
        } catch (_) {
            // ignore
        }
    }

    function openNewEventModal() {
        if (!newEventModal) return;
        newEventModal.classList.remove('hidden');
        newEventError.classList.add('hidden');
        newEventError.textContent = '';
        newEventForm?.reset();
        setTimeout(() => evtTitle?.focus(), 0);
    }

    function closeNewEventModal() {
        if (!newEventModal) return;
        newEventModal.classList.add('hidden');
    }

    function showFormError(message) {
        if (!newEventError) return;
        newEventError.textContent = message;
        newEventError.classList.remove('hidden');
    }

    function formatDateForCard(yyyyMmDd) {
        const d = new Date(`${yyyyMmDd}T00:00:00`);
        if (Number.isNaN(d.getTime())) return yyyyMmDd;
        const parts = d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).split(' ');
        return parts.join(' ').replace(',', '');
    }

    function formatTimeForCard(hhMm) {
        const d = new Date(`1970-01-01T${hhMm}:00`);
        if (Number.isNaN(d.getTime())) return hhMm;
        return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }

    function getFilteredEvents() {
        return eventsData.filter(evt => {
            const matchesTab = evt.status === currentTab;
            const matchesSearch = evt.title.toLowerCase().includes(searchQuery) || 
                                  evt.description.toLowerCase().includes(searchQuery) ||
                                  evt.type.toLowerCase().includes(searchQuery) ||
                                  evt.speaker.toLowerCase().includes(searchQuery);
            return matchesTab && matchesSearch;
        });
    }

    function updateCounts() {
        // Just counting the base arrays, ignoring search query for the tab badges
        const upcoming = eventsData.filter(e => e.status === 'upcoming').length;
        const completed = eventsData.filter(e => e.status === 'completed').length;
        
        upcomingCount.textContent = upcoming;
        completedCount.textContent = completed;
    }

    function renderEvents() {
        const filtered = getFilteredEvents();
        
        // Clear container
        eventsContainer.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            // Render each card
            filtered.forEach((evt, index) => {
                const card = createEventCard(evt, index);
                eventsContainer.appendChild(card);
            });
        }
    }

    function createEventCard(evt, animDelayIndex) {
        const div = document.createElement("div");
        div.className = `event-card ${evt.status}`;
        div.style.animationDelay = `${animDelayIndex * 0.05}s`;

        const statusClass = evt.status === 'upcoming' ? 'status-upcoming' : 'status-completed';
        const statusText = evt.status === 'upcoming' ? 'Upcoming' : 'Completed';
        
        const actionButtons = evt.status === 'upcoming' 
            ? `<button class="btn btn-primary" data-action="edit" data-event-id="${evt.id}">
                    <i class='bx bx-edit-alt'></i> Edit
               </button>
               <button class="btn btn-secondary" data-action="calendar" data-event-id="${evt.id}">
                    <i class='bx bx-calendar-event'></i> Add to Cal
               </button>`
            : `<button class="btn btn-secondary" data-action="calendar" data-event-id="${evt.id}">
                    <i class='bx bx-calendar-event'></i> Calendar
               </button>
               <button class="btn btn-secondary" data-action="edit" data-event-id="${evt.id}">
                    <i class='bx bx-edit-alt'></i> Edit
               </button>`;

        const hasLinks = evt.automationFolder || evt.emailTemplates || evt.whatsappTemplate || evt.slackChannel || evt.googleSheet;
        const gridClass = hasLinks ? 'card-meta-grid' : 'card-meta';

        div.innerHTML = `
            <div class="card-header">
                <div>
                    <span class="event-type">${evt.type}</span>
                    <h3 class="card-title">${evt.title}</h3>
                </div>
                <span class="event-status ${statusClass}">${statusText}</span>
            </div>
            
            <p class="card-desc">${evt.description}</p>
            
            <div class="${gridClass}">
                <div class="meta-column">
                    <div class="meta-item">
                        <i class='bx bx-calendar'></i>
                        <span>${evt.date}</span>
                    </div>
                    <div class="meta-item">
                        <i class='bx bx-time-five'></i>
                        <span>${evt.time}</span>
                    </div>
                    <div class="meta-item">
                        <i class='bx bx-user'></i>
                        <span>${evt.speaker}</span>
                    </div>
                    <div class="meta-item">
                        <i class='bx bx-info-circle'></i>
                        <span style="text-transform: capitalize;">${evt.status}</span>
                    </div>
                </div>
                ${hasLinks ? `
                <div class="meta-column">
                    ${evt.automationFolder ? `<div class="meta-item"><i class='bx bx-folder'></i> <a href="${evt.automationFolder}" target="_blank" style="color: inherit; text-decoration: underline;" title="${evt.automationFolder}">Automation Folder</a></div>` : ''}
                    ${evt.emailTemplates ? `<div class="meta-item"><i class='bx bx-envelope'></i> <a href="${evt.emailTemplates}" target="_blank" style="color: inherit; text-decoration: underline;" title="${evt.emailTemplates}">Email Templates</a></div>` : ''}
                    ${evt.whatsappTemplate ? `<div class="meta-item"><i class='bx bxl-whatsapp'></i> <a href="${evt.whatsappTemplate}" target="_blank" style="color: inherit; text-decoration: underline;" title="${evt.whatsappTemplate}">WhatsApp Template</a></div>` : ''}
                    ${evt.slackChannel ? `<div class="meta-item"><i class='bx bxl-slack'></i> <a href="${evt.slackChannel}" target="_blank" style="color: inherit; text-decoration: underline;" title="${evt.slackChannel}">Slack Channel</a></div>` : ''}
                    ${evt.googleSheet ? `<div class="meta-item"><i class='bx bx-table'></i> <a href="${evt.googleSheet}" target="_blank" style="color: inherit; text-decoration: underline;" title="${evt.googleSheet}">Google Sheet</a></div>` : ''}
                </div>
                ` : ''}
            </div>

            <div class="card-actions">
                ${actionButtons}
            </div>
        `;
        
        return div;
    }
});
