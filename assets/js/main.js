// Initialize Calendar

const LIBRARY = 0,
      FULLER = 1,
      roomNames = ["library", "fuller room"];

let roomSelected = LIBRARY,
    events = [],
    currentSelection,
    calendar,
    allSelections = [],
    requestFinished = false;

function handleSelection(selectionInfo){
    currentSelection = selectionInfo;

    //Clear all previous tooltips
    $(".tooltip").remove();

    let left = selectionInfo.start.getDay() < 4;

    //Add new tooltip and position
    let tooltip = `<div class = 'tooltip tooltip-${left ? "left" : "right"}'>
        <p>Book this time slot?</p>
        <span onclick = 'confirmSelection()' class = 'button'>Yes</span><span class = 'button light' onclick = 'cancelSelection()'>No</span>
    </div>`;

    $("a.fc-time-grid-event.fc-event.fc-start.fc-end.fc-mirror").parent().append(tooltip);
    let h0 = $("a.fc-time-grid-event.fc-event.fc-start.fc-end.fc-mirror").position().top,
        h1 = $("a.fc-time-grid-event.fc-event.fc-start.fc-end.fc-mirror").outerHeight(),
        h2 = $(".tooltip").outerHeight();

    $(".tooltip").css("top", (h0 + (h1 - h2) / 2) + "px");
    $(".tooltip").css((left ? "left" : "right"), "calc((100% + 8px))");

}

function confirmSelection(){
    let date = `${currentSelection.start.getFullYear()}-${('0' + (currentSelection.start.getMonth() + 1)).slice(-2)}-${('0' + currentSelection.start.getDate()).slice(-2)}`;
    let startTime = currentSelection.startStr.split("T")[1];
    let endTime = currentSelection.endStr.split("T")[1];
    allSelections.push(`${date} ${startTime}-${endTime}`);

    $('#date-input').prop('readonly',false);
    $('#date-input').val(allSelections.join(", "));
    $('#date-input').prop('readonly',true);

    $(".tooltip").remove();
    calendar.unselect();
    calendar.addEvent({
        id: `${date} ${startTime}-${endTime}`,
        title: "Your Booking Request",
        start: currentSelection.start,
        end: currentSelection.end,
        className: "event-selected",
        extendedProps: {
            deletable: true
        }
    })
    currentSelection = null;
}

function cancelSelection(){
    $(".tooltip").remove();
    calendar.unselect();
    currentSelection = null;
}

function deleteSelection(id){
    //Delete event from calendar
    let event = calendar.getEventById(id)
    if(event) event.remove();

    //Remove event from selections
    let index = allSelections.indexOf(id);
    if (index > -1) allSelections.splice(index, 1);

    //Update form
    $('#date-input').prop('readonly',false);
    $('#date-input').val(allSelections.join(", "));
    $('#date-input').prop('readonly',true);
}

function updateEvents(){
    // Grab existing events and put them on calendar
    events.forEach(function(d){
        if(d.room.toLowerCase() == roomNames[roomSelected] && d.carols_approval != "FALSE"){
            if(d.start_time && d.date && d.end_time && d.approved) calendar.addEvent({
                title: d.approved == "TRUE" ? "Already Booked" : "Pending Booking Request",
                start: d.date + "T" + d.start_time.trim(),
                end: d.date + "T" + d.end_time.trim(),
                className: d.approved == "TRUE" ? "booked" : "pending"
            })
        }
    });
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
    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
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
        selectAllow: function(){
            return requestFinished;
        },
        timeZone: "America/New_York",
        unselectAuto: false,
        nowIndicator: true, //Show current time
        businessHours: availability[roomSelected], //get availability, based on the room selected;,
        eventRender: function (info) { //Add ability to delete if the element was created by the user
            if(info.event.extendedProps.deletable){
                $(info.el).append("<i class = 'fas fa-times' onclick = 'deleteSelection(\"" + info.event.id + "\")'></i>");
            }
        }
    });

    calendar.render();

    updateEvents();
}

function changeCalendar(e){
    roomSelected = roomNames.indexOf(e.value.toLowerCase());
    $("#calendar").empty();
    allSelections = [];
    $('#date-input').prop('readonly',false);
    $('#date-input').val(allSelections.join(", "));
    $('#date-input').prop('readonly',true);
    generateCalendar();
}

$(document).ready(function() {
    generateCalendar();
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

                try{
                    if(row == 0) headers.push(val);
                    else{
                        if(col == 0) events.push({}) // New row
                        events[row - 1][headers[col]] = val;
                    }
                }
                catch(e){
                    if(val == "FALSE") break;
                }
            }

            console.log(events);

            requestFinished = true;
            updateEvents();
        }
     });
})
