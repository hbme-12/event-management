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
});

