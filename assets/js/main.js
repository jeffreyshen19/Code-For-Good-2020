// Initialize Calendar

const LIBRARY = 0,
      FULLER = 1;

let roomSelected = LIBRARY;

function generateCalendar(){
    // Store availability for both the library and fuller room
    let availability = [
        // Library
        [
            {
                daysOfWeek: [1, 2, 3, 4, 5], //Mon - Fri
                startTime: "08:30",
                endTime: "21:30"
            },
            {
                daysOfWeek: [0, 6], //Sat and Sun
                startTime: "08:30",
                endTime: "20:00"
            }
        ],

        //Fuller
        [
            {
                daysOfWeek: [1, 2, 3, 4, 5], //Mon - Fri
                startTime: "08:30",
                endTime: "16:00"
            },
            {
                daysOfWeek: [6], //Sat
                startTime: "15:00",
                endTime: "20:00"
            },
            {
                daysOfWeek: [0], //Sun
                startTime: "14:00",
                endTime: "20:00"
            },
        ]
    ];

    console.log(availability[roomSelected]);

    var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        plugins: ['timeGrid'],
        defaultView: 'timeGridWeek',
        themeSystem: 'standard',
        minTime: "08:00",
        maxTime: "22:00",
        nowIndicator: true, //Show current time
        businessHours: availability[roomSelected] //get availability, based on the room selected;
    });

    calendar.render();
}

$(document).ready(function() {
    generateCalendar();
})
