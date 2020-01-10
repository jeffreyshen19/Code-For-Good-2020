// Initialize Calendar
$(document).ready(function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridWeek',
        slotDuration: '00:30:00'
    });

    calendar.render();
})
