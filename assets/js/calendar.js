document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    function generateDailySlots() {
        let slots = [];
        for (let i = 8; i < 18; i++) {
            slots.push(`${i}:00-${i + 1}:00`);
        }
        return slots;
    }

    function generateSimulatedSlots() {
        let today = new Date();
        let simulatedSlots = {};
        let allSlots = generateDailySlots();

        for (let i = 0; i < 30; i++) {
            let currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            let dateStr = currentDate.toISOString().split("T")[0];
            let occupiedPercentage = i < 3 ? 100 : Math.max(0, 100 - i * 10);
            let occupiedCount = Math.ceil((occupiedPercentage / 100) * allSlots.length);
            let occupiedSlots = allSlots.slice(0, occupiedCount);
            let freeSlots = allSlots.slice(occupiedCount);

            simulatedSlots[dateStr] = { available: freeSlots, booked: occupiedSlots };
        }

        return simulatedSlots;
    }

    var simulatedSlots = generateSimulatedSlots();

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        events: Object.keys(simulatedSlots).map(date => ({
            title: `Slobodnih: ${simulatedSlots[date].available.length}`,
            start: date
        })),
        dateClick: function (info) {
            var date = info.dateStr;
            var today = new Date().toISOString().split("T")[0];

            if (date < today) {
                alert('Nije moguće zakazati termine u prošlosti.');
                return;
            }

            var slots = simulatedSlots[date];
            if (slots && slots.available.length > 0) {
                showSlotsModal(date, slots);
            } else {
                alert('Nema slobodnih termina za ovaj datum.');
            }
        },
        eventClick: function (info) {
            var date = info.event.start.toISOString().split("T")[0];
            var slots = simulatedSlots[date];
            if (slots && slots.available.length > 0) {
                showSlotsModal(date, slots);
            } else {
                alert('Nema slobodnih termina za ovaj datum.');
            }
        }
    });

    calendar.render();

    function showSlotsModal(date, slots) {
        var container = document.getElementById('slotsContainer');
        container.innerHTML = '';

        slots.available.concat(slots.booked).forEach(function (slot) {
            var isAvailable = slots.available.includes(slot);
            var slotElement = document.createElement('button');
            slotElement.className = `list-group-item list-group-item-action ${isAvailable ? 'text-success' : 'text-danger'}`;
            slotElement.textContent = `${isAvailable ? 'Slobodan' : 'Zauzet'}: ${slot}`;
            slotElement.disabled = !isAvailable;

            if (isAvailable) {
                slotElement.onclick = function () {
                    showBookingModal(slot, date);
                };
            }

            container.appendChild(slotElement);
        });

        $('#slotsModal').modal('show');
    }

    function showBookingModal(slot, date) {
        $('#selectedTime').val(slot);
        $('#bookingDate').val(date);
        $('#slotsModal').modal('hide');
        $('#bookingModal').modal('show');
    }

    function submitAppointment() {
        var selectedTime = $('#selectedTime').val();
        var date = $('#bookingDate').val();
        var name = $('#name').val().trim();
        var phone = $('#phone').val().trim();
        var serviceType = $('#serviceType').val();

        if (!selectedTime || !name || !phone || !serviceType) {
            alert('Sva polja su obavezna!');
            return;
        }

        if (!/^\d{10,15}$/.test(phone)) {
            alert('Unesite validan broj telefona!');
            return;
        }

        simulatedSlots[date].available = simulatedSlots[date].available.filter(s => s !== selectedTime);
        simulatedSlots[date].booked.push(selectedTime);

        $('#bookingModal').modal('hide');
        alert('Termin je uspešno zakazan!');

        calendar.refetchEvents();
    }

    document.querySelector('#submitAppointmentButton').addEventListener('click', submitAppointment);
});
document.addEventListener('DOMContentLoaded', function () {
    // Dugme za zatvaranje modalnog prozora
    document.querySelectorAll('[data-bs-dismiss="modal"]').forEach(function (button) {
        button.addEventListener('click', function () {
            console.log('Modal zatvoren.');
        });
    });

    // Funkcija za zakazivanje termina
    function submitAppointment() {
        var selectedTime = document.getElementById('selectedTime').value;
        var name = document.getElementById('name').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var serviceType = document.getElementById('serviceType').value;

        if (!selectedTime || !name || !phone || !serviceType) {
            alert('Sva polja su obavezna!');
            return;
        }

        if (!/^\d{10,15}$/.test(phone)) {
            alert('Unesite validan broj telefona!');
            return;
        }

        console.log('Termin uspešno zakazan:', { selectedTime, name, phone, serviceType });

        // Zatvaranje modala
        var bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        bookingModal.hide();
    }

    // Povezivanje funkcije za zakazivanje
    document.getElementById('submitAppointmentButton').addEventListener('click', submitAppointment);
});
