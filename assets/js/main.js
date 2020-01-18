// Initialize Calendar

const LIBRARY = 0,
      FULLER = 1,
      roomNames = ["library", "fuller"];

let roomSelected = LIBRARY,
    events = [];

function handleSelection(selectionInfo){
    //Clear all previous tooltips
    $(".tooltip").remove();

    //Add new tooltip and position
    let tooltip = `<div class = 'tooltip'>
        <p>Book this time slot?</p>
        <button>Yes</button><button class = 'light'>No</button>
    </div>`;

    $("a.fc-time-grid-event.fc-event.fc-start.fc-end.fc-mirror").append(tooltip);
    let h1 = $("a.fc-time-grid-event.fc-event.fc-start.fc-end.fc-mirror").outerHeight(),
        h2 = $(".tooltip").outerHeight();

    console.log(h1);
    console.log(h2);

    $(".tooltip").css({
        top: (h1 - h2) / 2 + "px",
    })
    // $(selectionInfo.jsEvent.toElement).append("")
    // let date = `${selectionInfo.start.getFullYear()}-${('0' + (selectionInfo.start.getMonth() + 1)).slice(-2)}-${('0' + selectionInfo.start.getDate()).slice(-2)}`;
    // let startTime = selectionInfo.startStr.split("T")[1];
    // let endTime = selectionInfo.endStr.split("T")[1];
    // $('#date-input').prop('readonly',false);
    // $('#date-input').val(`${date} ${startTime}-${endTime}`);
    // $('#date-input').prop('readonly',true);
}

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
        height: "parent",
        allDaySlot: false,
        selectable: true,
        selectMirror: true,
        selectConstraint: "businessHours",
        selectOverlap: false,
        select: handleSelection,
        timeZone: "America/New_York",
        unselectAuto: false,
        nowIndicator: true, //Show current time
        businessHours: availability[roomSelected] //get availability, based on the room selected;
    });

    calendar.render();

    // Grab existing events and put them on calendar
    events.forEach(function(d){
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

function changeCalendar(e){
    roomSelected = roomNames.indexOf(e.value);
    $("#calendar").empty();
    generateCalendar();
}

$(document).ready(function() {
    //Grab data
    $.ajax({
        type: "GET",
        url: "https://spreadsheets.google.com/feeds/cells/1aRHFRnlOkbo58w0KxJwqJhazj1nEr8FxzcCyl9hdgg4/1/public/values?alt=json-in-script",
        dataType: "text",
        success: function(data){
            data = JSON.parse(data.replace("gdata.io.handleScriptLoaded(", "").replace(");", "")).feed.entry;
            var headers = [];

            // Parse data into a JSON object
            for(var r = 0; r < data.length; r++){
                var cell = data[r]["gs$cell"],
                    row = cell.row - 1,
                    col = cell.col - 1;
                var val = cell["$t"];

                if(row == 0) headers.push(val);
                else{
                    if(col == 0) events.push({}) // New row
                    events[row - 1][headers[col]] = val;
                }
            }

            generateCalendar();

        }
     });
})
