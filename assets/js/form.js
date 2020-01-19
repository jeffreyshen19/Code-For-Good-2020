// serializeObject function
$.fn.serializeObject = function()
{
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};

var names = ["email", "room", "table-chair-rental", "num-chair-table", "description", "num-people", "organization", "mailing-address", "contact-name", "verification", "signature"]
var $form = $("form")
var url = "https://script.google.com/a/mit.edu/macros/s/AKfycbyLQE1QcJTIZ80Ex8FqvMwyZfzMvz64zk4lhHy_/exec"

// validate form
function validateForm(){
  return validateEmail() && validateNumTableChairs() && validateRooms() && validateName() && validatePhone();
}

function validateEmail(){
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  var validEmail = regex.test($("input[name='email']").val().toLowerCase());
  if(validEmail){
    $("#wrong-email").hide();
  } else {
    $("#wrong-email").show();
  }
  return validEmail;
}

function validateTableChairs(){
  var checkedVal = $("input[name='table-chair-rental']");
  var rental = ""
  for(var i = 0; i < checkedVal.length; i++){
    if(checkedVal[i].checked){
      rental = checkedVal[i].getAttribute("value");
      break;
    }
  }
  if(rental == "yes"){
    $("#div-num-table-chair").show();
    return true;
  } else {
    $("#wrong-num-table-chair").hide();
    $("#div-num-table-chair").hide();
    return false;
  }
}

function validateNumTableChairs(){
  var numRental = $("input[name='num-table-chair']").val();
  if(validateTableChairs() && numRental.length==0){
    $("#wrong-num-table-chair").show();
    return false;
  } else {
    $("#wrong-num-table-chair").hide();
    return true;
  }
}

function validateRooms(){
  // sees which room is checked
  var checkedRoom = $("input[name='room']");
  var room = ""
  for(var i = 0; i < checkedRoom.length; i++){
    if(checkedRoom[i].checked){
      room = checkedRoom[i].getAttribute("value");
      break;
    }
  }

  // sees how many people are checked
  var checkedNumPeople = $("input[name='num-people']");
  var numPeople = ""
  for(var i = 0; i < checkedNumPeople.length; i++){
    if(checkedNumPeople[i].checked){
      numPeople = checkedNumPeople[i].getAttribute("value");
      break;
    }
  }

  if(room == "library" && numPeople == "30-50"){
    $("#wrong-room").show();
    return false;
  } else {
    $("#wrong-room").hide();
    return true;
  }
}

function validateName(){
  var regex = /^[a-zA-Z]+ [a-zA-Z]+$/;
  var validName = regex.test($("input[name='contact-name']").val());
  if(validName){
    $("#wrong-contact-name").hide();
  } else {
    $("#wrong-contact-name").show();
  }
  return validName;
}

function validatePhone(){
  var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  var validPhone = regex.test($("input[name='contact-phone']").val());
  if(validPhone){
    $("#wrong-contact-phone").hide();
  } else {
    $("#wrong-contact-phone").show();
  }
  return validPhone;
}

function submitNewRequest(){
  $("#submitPage").hide();
  $("#wrapper").show();
}

// form
$form.on('submit',function(e){
  e.preventDefault();
  if(!validateForm()){
    return false;
  }
  var jqxhr = $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    data: $form.serializeObject()
  })

  function formatDate(d){
      console.log(d);
      let date = new Date(d.split(" ")[0]);
      let startTime = d.split(" ")[1].split("-")[0].replace(/\:00$/g, "");
      let endTime = d.split(" ")[1].split("-")[1].replace(/\:00$/g, "");

      function formatTime(t){
          var hours = parseInt(t.split(":")[0]);
          var hoursFormatted = hours % 12;
          hoursFormatted = hoursFormatted ? hoursFormatted : 12;

          var minutes = t.split(":")[1]

          return `${hoursFormatted}:${minutes} ${hours < 12 ? "AM" : "PM"}`
      }

      var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${formatTime(startTime)} - ${formatTime(endTime)} on ${mS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} `
  }

  var object = $form.serializeObject();
  $("#roomInfo").html(object.room);
  object.dates.split(", ").forEach(function(d){
    $("#datesInfo").append("<li>" + formatDate(d) + "</li>");
  });

  $("#wrapper").hide();
  $("#submitPage").show();
})
