var express = require ("express"),
    router = express.Router(),
    bcrypt = require('bcrypt'),
    passport = require("passport");
const saltRounds = 10;
    
var connection = require("../db");

router.get("/", function(req, res){
  //console.log(req.session);
  console.log(req.user);
  console.log(req.isAuthenticated());
   res.redirect("/projects"); 
});

//register route
router.get("/register", function(req, res){
    res.render("register.ejs");
})

router.post("/register", function(req, res){
   //console.log(req.body);
   var FirstName   = req.body.m_firstname,
   LastName        = req.body.m_lastname,
   Email           = req.body.m_email,
   Username        = req.body.m_username,
   Pwd             = req.body.m_pwd[0],
   checkMentor      = req.body.mentor;
   if(checkMentor === 'yes'){
         bcrypt.hash(Pwd, saltRounds, function(err, hash) {
             if(err){
                 console.log(err);
                 res.redirect("/projects");
                 return;
             }
            connection.query("insert into mentors ( m_firstname, m_lastname, m_email, m_username, m_pwd) values (?, ?, ?, ?, ?)", [FirstName, LastName, Email, Username, hash], function(error, row, fields){
               if(error){
                   console.log(error);
                   res.redirect("/register");
               } else{
                  connection.query("Select last_insert_id() as user_id", function(error, row, fields){
                      if(error) throw error;
                      var user = {user_id: row[0].user_id, username: Username, mentor: checkMentor};
                      req.login(user, function(err){ //req.login creates a session for the user. login() is provided by the passport and updates the session by writing the values passed through the login function.
                            if(err) throw err;
                            req.flash("success", "You are now registered as mentor, enjoy your time with us!");
                            res.redirect("/"); 
                      });
                  });
               }
             });
         });
   } else{
       bcrypt.hash(Pwd, saltRounds, function(err, hash) {
             if(err){
                 console.log(err);
                 res.redirect("/projects");
                 return;
             }
            connection.query("insert into students ( s_firstname, s_lastname, s_email, s_username, s_pwd) values (?, ?, ?, ?, ?)", [FirstName, LastName, Email, Username, hash], function(error, row, fields){
               if(error){
                   console.log(error);
               } else{
                   connection.query("select last_insert_id() as user_id", function(error, row, fields){
                      if (error) throw error;
                      var user = {user_id: row[0].user_id, username: Username, mentor: checkMentor};
                      req.login(user, function(error){
                         if(error) throw error;
                         req.flash("success", "You are now registered as student, enjoy your time with us!");
                         res.redirect("/");
                      });
                   });
               }
             });
         });
   }
});

router.get("/login", function(req, res){
   res.render("login.ejs"); 
});

router.post("/login/mentor", passport.authenticate("mentor-local", {
    failureRedirect: "/login",
    successRedirect: "/"
}));

router.post("/login/student", passport.authenticate("student-local", {
    failureRedirect: "/login",
    successRedirect: "/"
}));

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out");
    req.session.destroy();
    res.redirect("/");
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = router;