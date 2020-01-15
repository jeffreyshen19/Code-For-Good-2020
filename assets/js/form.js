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
  return validateEmail() && validateNumTableChairs() && validatePhone()
}

function validateEmail(){
  var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  var validEmail = regex.test($("input[name='email']").val().toLowerCase());
  if(!validEmail){
    $("#wrong-email").show();
  } else {
    $("#wrong-email").slideUp();
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
    return true;
  } else {
    $("#wrong-num-table-chair").hide();
    return false;
  }
}

function validateName(){
  var regex = /^[a-zA-Z]+ [a-zA-Z]+$/;
  var validName = regex.test($("input[name='contact-name']").val());
  if(!validName){
    $("#wrong-contact-name").show();
  } else {
    $("#wrong-contact-name").hide();
  }
  return validName;
}

function validatePhone(){
  var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  var validPhone = regex.test($("input[name='contact-phone']").val());
  if(!validPhone){
    $("#wrong-contact-phone").show();
  } else {
    $("#wrong-contact-phone").hide();
  }
  return validPhone;
}

// form
$form.on('submit',function(e){
  e.preventDefault();
  if(!validateForm()){
    alert("WRONG EMAIL")
    return false
  }
  var jqxhr = $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    data: $form.serializeObject()
  })
})
