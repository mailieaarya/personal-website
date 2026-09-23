// Store all events in this array.
// Events only exist while the page is open.
const events = [];

// Stores the index of the event currently being edited.
// null means we are creating a new event.
let editingEventIndex = null;


// Update the Location and Remote URL fields
// depending on the selected modality.
function updateLocationOptions(value) {
    const locationGroup = document.getElementById("event_location_group");
    const remoteUrlGroup = document.getElementById("event_remote_url_group");
    const locationInput = document.getElementById("event_location");
    const remoteUrlInput = document.getElementById("event_remote_url");

    if (value === "remote") {
        remoteUrlGroup.classList.remove("d-none");
        locationGroup.classList.add("d-none");

        remoteUrlInput.required = true;
        locationInput.required = false;

        locationInput.value = "";
    } else if (value === "in-person") {
        locationGroup.classList.remove("d-none");
        remoteUrlGroup.classList.add("d-none");

        locationInput.required = true;
        remoteUrlInput.required = false;

        remoteUrlInput.value = "";
    }
}


// Save a new event or update an existing event.
function saveEvent() {
    const eventForm = document.getElementById("event_form");

    // Check that all required fields are filled in.
    if (!eventForm.checkValidity()) {
        eventForm.classList.add("was-validated");
        eventForm.reportValidity();
        return;
    }

    const modality = document.getElementById("event_modality").value;

    // Create an object containing the event information.
    const eventDetails = {
        name: document.getElementById("event_name").value,
        weekday: document.getElementById("event_weekday").value,
        time: document.getElementById("event_time").value,
        modality: modality,

        location:
            modality === "in-person"
                ? document.getElementById("event_location").value
                : null,

        remote_url:
            modality === "remote"
                ? document.getElementById("event_remote_url").value
                : null,

        attendees: document
            .getElementById("event_attendees")
            .value
            .split(",")
            .map(function(name) {
                return name.trim();
            })
            .filter(function(name) {
                return name.length > 0;
            }),

        category: document.getElementById("event_category").value
    };


    // If editingEventIndex is null, this is a new event.
    if (editingEventIndex === null) {
        events.push(eventDetails);

        console.log("Events:", events);

        addEventToCalendarUI(eventDetails, events.length - 1);
    }

    // Otherwise, update the existing event.
    else {
        events[editingEventIndex] = eventDetails;

        console.log("Events:", events);

        refreshCalendar();
    }


    // Reset the editing state.
    editingEventIndex = null;

    // Reset the form.
    eventForm.reset();
    eventForm.classList.remove("was-validated");

    // Put the location fields back into their default state.
    document.getElementById("event_location_group").classList.remove("d-none");
    document.getElementById("event_remote_url_group").classList.add("d-none");

    document.getElementById("event_location").required = true;
    document.getElementById("event_remote_url").required = false;

    // Change the modal title back to Create Event.
    document.getElementById("event_modal_label").textContent = "Create Event";

    // Close the modal.
    const modalElement = document.getElementById("event_modal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
}


// Create the visual event card.
function createEventCard(eventDetails, eventIndex) {
    const eventElement = document.createElement("div");

    eventElement.className = "event row border rounded m-1 py-2";

    const eventContent = document.createElement("div");

    eventContent.className = "col";

    eventContent.innerHTML = `
        <strong>${eventDetails.name}</strong>
        <br>
        <strong>Time:</strong> ${eventDetails.time}
        <br>
        <strong>Modality:</strong> ${eventDetails.modality}
        <br>
        <strong>${eventDetails.modality === "in-person" ? "Location" : "URL"}:</strong>
        ${eventDetails.modality === "in-person"
            ? eventDetails.location
            : eventDetails.remote_url}
        <br>
        <strong>Attendees:</strong> ${eventDetails.attendees.join(", ")}
        <br>
        <strong>Category:</strong> ${eventDetails.category}
    `;


    // Apply a class based on the category.
    if (eventDetails.category === "academic") {
        eventElement.classList.add("category-academic");
    } else if (eventDetails.category === "work") {
        eventElement.classList.add("category-work");
    } else if (eventDetails.category === "personal") {
        eventElement.classList.add("category-personal");
    } else if (eventDetails.category === "social") {
        eventElement.classList.add("category-social");
    }


    eventElement.appendChild(eventContent);


    // Clicking an event opens it for editing.
    eventElement.addEventListener("click", function() {
        openEditModal(eventIndex);
    });

    return eventElement;
}


// Add an event to the correct weekday column.
function addEventToCalendarUI(eventInfo, eventIndex) {
    const eventCard = createEventCard(eventInfo, eventIndex);

    const calendarColumn = document.getElementById(eventInfo.weekday);

    calendarColumn.appendChild(eventCard);
}


// Remove all event cards and add them again.
// This is useful after an event has been edited.
function refreshCalendar() {
    const calendarColumns = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    // Remove existing event cards.
    calendarColumns.forEach(function(day) {
        const column = document.getElementById(day);

        const eventCards = column.querySelectorAll(".event");

        eventCards.forEach(function(card) {
            card.remove();
        });
    });


    // Add all events back to the calendar.
    events.forEach(function(eventDetails, index) {
        addEventToCalendarUI(eventDetails, index);
    });
}


// Open an existing event in the modal so it can be edited.
function openEditModal(eventIndex) {
    const eventDetails = events[eventIndex];

    // Remember which event we are editing.
    editingEventIndex = eventIndex;

    // Change the modal title.
    document.getElementById("event_modal_label").textContent = "Edit Event";

    // Fill in the existing event information.
    document.getElementById("event_name").value = eventDetails.name;
    document.getElementById("event_weekday").value = eventDetails.weekday;
    document.getElementById("event_time").value = eventDetails.time;
    document.getElementById("event_modality").value = eventDetails.modality;
    document.getElementById("event_attendees").value =
        eventDetails.attendees.join(", ");
    document.getElementById("event_category").value = eventDetails.category;


    // Fill in the correct location field.
    if (eventDetails.modality === "in-person") {
        document.getElementById("event_location").value =
            eventDetails.location;

        document.getElementById("event_remote_url").value = "";

        updateLocationOptions("in-person");
    } else {
        document.getElementById("event_remote_url").value =
            eventDetails.remote_url;

        document.getElementById("event_location").value = "";

        updateLocationOptions("remote");
    }


    // Show the modal.
    const modalElement = document.getElementById("event_modal");

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();
}