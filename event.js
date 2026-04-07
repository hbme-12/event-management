document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn");
    const detailsEmpty = document.getElementById("detailsEmpty");

    const eventKicker = document.getElementById("eventKicker");
    const eventTitle = document.getElementById("eventTitle");
    const eventSubtitle = document.getElementById("eventSubtitle");
    const eventStatusPill = document.getElementById("eventStatusPill");
    const eventDescription = document.getElementById("eventDescription");
    const eventDate = document.getElementById("eventDate");
    const eventTime = document.getElementById("eventTime");
    const eventSpeaker = document.getElementById("eventSpeaker");

    backBtn.addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "index.html";
    });

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    let events = [];
    try {
        events = JSON.parse(localStorage.getItem("eventsData") || "[]");
    } catch (_) {
        events = [];
    }

    const evt = events.find(e => String(e.id) === String(id));
    if (!evt) {
        detailsEmpty.classList.remove("hidden");
        return;
    }

    const statusText = evt.status === "upcoming" ? "Upcoming" : "Completed";
    const statusClass = evt.status === "upcoming" ? "status-upcoming" : "status-completed";

    eventKicker.textContent = (evt.type || "Event").toUpperCase();
    eventTitle.textContent = evt.title || "Event";
    eventSubtitle.textContent = statusText;

    eventStatusPill.textContent = statusText;
    eventStatusPill.className = `event-status ${statusClass}`;

    eventDescription.textContent = evt.description || "";
    eventDate.textContent = evt.date || "";
    eventTime.textContent = evt.time || "";
    eventSpeaker.textContent = evt.speaker || "";

    const resourcesCard = document.getElementById("resourcesCard");
    const resourcesList = document.getElementById("resourcesList");
    
    let resourcesHtml = "";
    if (evt.automationFolder) resourcesHtml += `<div class="meta-item" style="font-size: 1rem;"><i class='bx bx-folder'></i> <a href="${evt.automationFolder}" target="_blank" style="color: var(--primary-color); text-decoration: none;">Automation Folder</a></div>`;
    if (evt.emailTemplates) resourcesHtml += `<div class="meta-item" style="font-size: 1rem;"><i class='bx bx-envelope'></i> <a href="${evt.emailTemplates}" target="_blank" style="color: var(--primary-color); text-decoration: none;">Email Templates</a></div>`;
    if (evt.whatsappTemplate) resourcesHtml += `<div class="meta-item" style="font-size: 1rem;"><i class='bx bxl-whatsapp'></i> <a href="${evt.whatsappTemplate}" target="_blank" style="color: var(--primary-color); text-decoration: none;">WhatsApp Template</a></div>`;
    if (evt.slackChannel) resourcesHtml += `<div class="meta-item" style="font-size: 1rem;"><i class='bx bxl-slack'></i> <a href="${evt.slackChannel}" target="_blank" style="color: var(--primary-color); text-decoration: none;">Slack Channel</a></div>`;
    if (evt.googleSheet) resourcesHtml += `<div class="meta-item" style="font-size: 1rem;"><i class='bx bx-table'></i> <a href="${evt.googleSheet}" target="_blank" style="color: var(--primary-color); text-decoration: none;">Google Sheet</a></div>`;

    if (resourcesHtml) {
        resourcesList.innerHTML = resourcesHtml;
        resourcesCard.style.display = "block";
    }

    const editEventBtn = document.getElementById("editEventBtn");
    const editEventModal = document.getElementById("editEventModal");
    const closeEditModalBtn = document.getElementById("closeEditModalBtn");
    const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");
    const editEventForm = document.getElementById("editEventForm");
    const editEventError = document.getElementById("editEventError");

    function parseDateForInput(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return '';
    }

    function parseTimeForInput(timeStr) {
        if (!timeStr) return '';
        const today = new Date().toISOString().split('T')[0];
        const d = new Date(`${today} ${timeStr}`);
        if (!isNaN(d.getTime())) {
            return d.toTimeString().split(' ')[0].substring(0, 5);
        }
        return '';
    }

    function openEditModal() {
        if (!editEventModal) return;
        editEventError.classList.add('hidden');
        
        document.getElementById('editTitle').value = evt.title || '';
        document.getElementById('editType').value = evt.type || '';
        document.getElementById('editDescription').value = evt.description || '';
        document.getElementById('editDate').value = parseDateForInput(evt.date);
        document.getElementById('editTime').value = parseTimeForInput(evt.time);
        document.getElementById('editSpeaker').value = evt.speaker || '';
        document.getElementById('editStatus').value = evt.status || 'upcoming';
        
        document.getElementById('editAutomationFolder').value = evt.automationFolder || '';
        document.getElementById('editEmailTemplates').value = evt.emailTemplates || '';
        document.getElementById('editWhatsappTemplate').value = evt.whatsappTemplate || '';
        document.getElementById('editSlackChannel').value = evt.slackChannel || '';
        document.getElementById('editGoogleSheet').value = evt.googleSheet || '';

        editEventModal.classList.remove("hidden");
    }

    function closeEditModal() {
        if (!editEventModal) return;
        editEventModal.classList.add("hidden");
    }

    editEventBtn?.addEventListener('click', openEditModal);
    closeEditModalBtn?.addEventListener('click', closeEditModal);
    cancelEditModalBtn?.addEventListener('click', closeEditModal);
    editEventModal?.addEventListener('click', (e) => {
        if (e.target === editEventModal) closeEditModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editEventModal && !editEventModal.classList.contains('hidden')) {
            closeEditModal();
        }
    });

    editEventForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fd = new FormData(editEventForm);
        const dateRaw = String(fd.get('date') || '').trim();
        const timeRaw = String(fd.get('time') || '').trim();
        
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

        evt.title = String(fd.get('title') || '').trim();
        evt.type = String(fd.get('type') || '').trim();
        evt.description = String(fd.get('description') || '').trim();
        evt.date = formatDateForCard(dateRaw);
        evt.time = formatTimeForCard(timeRaw);
        evt.speaker = String(fd.get('speaker') || '').trim();
        evt.status = String(fd.get('status') || '').trim();
        evt.automationFolder = String(fd.get('automationFolder') || '').trim();
        evt.emailTemplates = String(fd.get('emailTemplates') || '').trim();
        evt.whatsappTemplate = String(fd.get('whatsappTemplate') || '').trim();
        evt.slackChannel = String(fd.get('slackChannel') || '').trim();
        evt.googleSheet = String(fd.get('googleSheet') || '').trim();
        
        const idx = events.findIndex(e => String(e.id) === String(id));
        if (idx > -1) {
            events[idx] = evt;
            localStorage.setItem("eventsData", JSON.stringify(events));
            window.location.reload();
        }
    });
});

