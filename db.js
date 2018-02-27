var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "pussinboots20",
    port: 3306,
    password: "",
    database: "c9"
});

connection.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log("connected");
    }
});

module.exports = connection;