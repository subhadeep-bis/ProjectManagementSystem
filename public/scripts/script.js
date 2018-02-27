// $("progress").attr("value", "100");
$("span").css("paddingLeft", "1em");

function pwdCheck(a) {
    var x = $("#fpwd");
    var y = $("#fpwd2");
    if(x.val() != a){
    	alert("Password Has to be same. Try again!");
        x.val("");
        y.val("");
    }
}

function OnSubmitForm()
{
  if(document.myform.mentor[0].checked == true)
  {
    document.myform.action ="/login/mentor";
  }
  else
  if(document.myform.mentor[1].checked == true)
  {
    document.myform.action ="/login/student";
  }
  return true;
}

function nospaces(t){

    if(t.value.match(/\s/g)){

        alert('Username Cannot Have Spaces or Full Stops');

        t.value=t.value.replace(/\s/g,'');

    }

}
