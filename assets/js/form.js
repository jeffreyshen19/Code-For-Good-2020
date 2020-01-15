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

var $form = $("form"),
url = "https://script.google.com/a/mit.edu/macros/s/AKfycbyLQE1QcJTIZ80Ex8FqvMwyZfzMvz64zk4lhHy_/exec"

$form.on('submit',function(e){
  e.preventDefault();
  var jqxhr = $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    data: $form.serializeObject()
  })
  console.log("YEET")
})
