var express         = require ("express"),
    mysql           = require ("mysql"),
    app             = express(),
    bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    cookieParser    = require("cookie-parser"),
    flash           = require("connect-flash");

//=============================
// Authentication packages
//=============================
var session     = require("express-session"),
    passport    = require("passport"),
    MySQLStore = require('express-mysql-session')(session),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
// console.log(__dirname);

app.use(methodOverride("_method"));

app.use(cookieParser());

var options = {
    host: "localhost",
    user: "pussinboots20",
    port: 3306,
    password: "",
    database: "c9"
};

var sessionStore = new MySQLStore(options);

//session middleware should be written after all .use middlewares, specifically after cookieparser package (Convention)
app.use(session({
  store: sessionStore,
  secret: 'h|_|mpty 5at 0n a $m@ll F#t W@lL',   //used for salting or hashing the cookie that is being created so that it is gibberish to the outside world
  resave: false,                                //if set to true, the session and the cookie  will be updated even if the user hasn't made any specific change. Setting it to false would ensure that the cookie is resaved or updated once the user has made any specific change
  saveUninitialized: false                     //if set to true, the backend will create the session and return a cookie even if the user has not logged in (that means for every user who is just visiting the website). Setting it false will ensure that we are not creating an unneeded extra space on the server. P.S. Try checking the authentication cookie in console
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//=====================
//Requiring routes
//=====================
var projectRoutes = require("./routes/projects"),
    indexAuthRoutes    = require("./routes/index");
    
app.use("/", indexAuthRoutes);
app.use("/projects", projectRoutes);

//====================================
//local strategies for log in purpose
//====================================

passport.use("mentor-local", new LocalStrategy(
  function(username, password, done) {
        //console.log(username);
        //console.log(password);
        //console.log("mentor local strategy");
        var connection = require("./db");
        connection.query('select * from mentors where m_username = ?', [username], function(error, row, fields){
            if(error){
                done(error); //done has been provided by passport and will take care of all error management. Just have to pass error object through it if error is occuring.
            }
            if(row.length == 0){
               return done(null, false);
            }
            const hash = row[0].m_pwd.toString();
            //console.log(hash);
            bcrypt.compare(password, hash, function(error, res) {
                if (res === true) {
                    return done(null, {user_id: row[0].m_id, username: row[0].m_username, mentor: "yes"});
                }else{
                    return done(null, false);
                }
            });
        });
  }
));

passport.use("student-local", new LocalStrategy(
  function(username, password, done) {
        //console.log(username);
        //console.log(password);
        //console.log("student local strategy");
        var connection = require("./db");
        connection.query('select * from students where s_username = ?', [username], function(error, row, fields){
            if(error){
                done(error); //done has been provided by passport and will take care of all error management. Just have to pass error object through it if error is occuring.
            }
            if(row.length == 0){
               return done(null, false);
            }
            const hash = row[0].s_pwd.toString();
            //console.log(hash);
            bcrypt.compare(password, hash, function(error, res) {
                if (res === true) {
                    return done(null, {user_id: row[0].s_id, username: row[0].s_username, mentor: "no"});
                }else{
                    return done(null, false);
                }
            });
        });
  }
));

app.listen(process.env.PORT, process.env.IP,function(){
	console.log("DBMS Server started.");
});

