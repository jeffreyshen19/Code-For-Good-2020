// Initialize Calendar

const LIBRARY = 0,
      FULLER = 1,
      roomNames = ["library", "fuller"];

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

    // Create calendar
    var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        plugins: ['timeGrid', 'interaction'],
        defaultView: 'timeGridWeek',
        themeSystem: 'standard',
        minTime: "08:00",
        maxTime: "22:00",
        timeZone: 'America/New_York',
        height: "parent",
        allDaySlot: false,
        selectable: true,
        selectMirror: true,
        selectConstraint: "businessHours",
        selectOverlap: false,
        nowIndicator: true, //Show current time
        businessHours: availability[roomSelected] //get availability, based on the room selected;
    });

    calendar.render();

    // Grab existing events and put them on calendar
    $.ajax({
        type: "GET",
        url: "https://spreadsheets.google.com/feeds/cells/1aRHFRnlOkbo58w0KxJwqJhazj1nEr8FxzcCyl9hdgg4/1/public/values?alt=json-in-script",
        dataType: "text",
        success: function(data){
            data = JSON.parse(data.replace("gdata.io.handleScriptLoaded(", "").replace(");", "")).feed.entry;
            var table = [], headers = [];

            // Parse data into a JSON object
            for(var r = 0; r < data.length; r++){
                var cell = data[r]["gs$cell"],
                    row = cell.row - 1,
                    col = cell.col - 1;
                var val = cell["$t"];

                if(row == 0) headers.push(val);
                else{
                    if(col == 0) table.push({}) // New row
                    table[row - 1][headers[col]] = val;
                }
            }

            // Add to calendar
            table.forEach(function(d){
                if(d.room == roomNames[roomSelected]){
                    calendar.addEvent({
                        title: d.approved == "TRUE" ? "Already Booked" : "Pending Booking Request",
                        start: d.date + "T" + d.start_time.trim(),
                        end: d.date + "T" + d.end_time.trim(),
                        className: d.approved == "TRUE" ? "booked" : "pending"
                    })
                }
            });
        }
     });
}

function changeCalendar(e){
    roomSelected = roomNames.indexOf(e.value);
    $("#calendar").empty();
    generateCalendar();
}

$(document).ready(function() {
    generateCalendar();
})
