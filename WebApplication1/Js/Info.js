function Get(url) {
    return $.ajax({
        method: "Get",
        //cache: false,
        url: url,        
    });
}
function Post(url, data) {
    return $.ajax({
        method: "Post",
        url: url,
        data: data,//JSON.stringify(data),
       
    });
}
var objData = {
    name: "", email: "", phonenumber: ""

};
GetData();
function GetData() {
    var html =""
    Get('/Home/GetStudent').then(function (d) {
        if (d.Success) {
             for (var i = 0; i < d.Data.Form.length; i++) {
                html = html + '<tr><td>' + d.Data.Form[i].name + '</td><td>' + d.Data.Form[i].email + '</td><td>' + d.Data.Form[i].phonenumber +'</td></tr>';
            }             
            document.getElementById("table").innerHTML = html;            
        }
    });
}
function SubmitData() {    
    objData.name = document.getElementById("name").value;
    objData.email = document.getElementById("email").value;
    objData.phonenumber = document.getElementById("phone").value; debugger
    navigator.serviceWorker.controller.postMessage({ 'formdata': objData });
    Post("/Home/SaveData", { obj: objData }).then(function (d) {
        debugger
        if (d.Success) {
            GetData();
        }
    });

}