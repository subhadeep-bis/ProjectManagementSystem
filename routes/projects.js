var express = require ("express"),
    router = express.Router(),
    passport = require("passport");

var connection = require("../db");

//index route
router.get("/", function(req, res){
    connection.query("select * from projects", function(error, row, fields){
       if(error){
           console.log(error);
       } else{
           //console.log(row);
           res.render("projects", {projects: row});
       }
    });
});

//about
router.get("/about", function(req, res){
    res.render("about");    
});

//new route
router.get("/new", authenticationMiddleware(),function(req, res){
   res.render("new"); 
});

//create route
router.post("/", function(req, res){
  var m_id = req.user.user_id;
//   console.log(m_id);
  var over =req.body.overview;
  var name = req.body.p_name;
  var maxm = req.body.p_maxm;
  var progress = req.body.progress;
  var req = req.body.p_req;
  //console.log(name+","+maxm+","+progress+","+req+","+over);
  connection.query("insert into projects (p_name, overview, p_date, progress, p_req, p_maxm, m_id) values (?, ?, CURDATE(), ?, ?, ?, ?)", [name, over, progress, req, maxm, m_id], function(error, row, fields){
      if(error){
          console.log(error);
      } else{
          res.redirect("/projects");
      }
  });
});

//show route
router.get("/:id", function(req, res){
   connection.query("select * from projects where p_id = " + req.params.id, function(error, row, fields){
       if(error){
           console.log(error);
           res.redirect("/projects");
       }else{
           //console.log(row[0].m_id);
           connection.query("select * from mentors where m_id="+row[0].m_id, function(error, result, fields){
              if(error){
                  console.log(error);
                  res.redirect("/projects");
              }
              if(req.isAuthenticated()){
                 connection.query("select * from student_project where s_id = ?", [req.user.user_id], function(error, registered, fields){
                 if (error) throw error;
                console.log(registered);
                 connection.query("select students.* from students inner join student_project on student_project.s_id = students.s_id and student_project.p_id = ?", [req.params.id], function(error, values, fields){
                    connection.query("select count(*) as count from student_project where p_id = ?", [req.params.id], function(error, value1, fields){
                       if (error) throw error;
                       //console.log(value1[0].count);
                       res.render("show", {foundProject: row[0], foundMentor: result[0], registeredProjects: registered, students: values, value1: value1[0].count});
                    });
                 });
              });
              }
              else{
                  var registered = [];
                  //console.log(registered);
                  connection.query("select students.* from students inner join student_project on student_project.s_id = students.s_id and student_project.p_id = ?", [req.params.id], function(error, values, fields){
                    res.render("show", {foundProject: row[0], foundMentor: result[0], registeredProjects: registered, students: values});
                  });
              }
           });
       }
   })
});

//Edit route
router.get("/:id/edit", authenticationMiddleware (),function(req, res){
   connection.query("select * from projects where p_id=" + req.params.id, function(error, row, fields){
      if(error){
          console.log(error);
          res.redirect("/projects");
      } else{
          //console.log(row[0]);
          res.render("edit", {foundProject: row[0]});
      }
   });
});

//update route
router.put("/:id", function(req, res){
  var id = req.params.id;
  var over =req.body.overview;
  var name = req.body.p_name;
  var maxm = req.body.p_maxm;
  var progress = req.body.progress;
  var req = req.body.p_req;
  connection.query("Update projects set p_name=?, overview=?, progress=?, p_req=?, p_maxm=? where p_id="+id, [name, over, progress, req, maxm], function(error, row, fields){
      if(error){
          console.log("error");
          res.redirect("/projects");
      } else{
          res.redirect("/projects");
      }
  });
});

//delete route
router.delete("/:id", authenticationMiddleware (),function(req, res){
  connection.query("delete from projects where p_id="+req.params.id, function(error, row, fields){
      if(error){
          console.log(error);
          res.redirect("/projects");
      } else{
          res.redirect("/projects");
      }
  }); 
});

//mentor projects route
router.get("/mentor/:id", function(req, res){
   connection.query("select * from projects where m_id="+req.params.id, function(error, row, fields){
      if(error){
        console.log(error);
        res.redirect("/projects");
      } else{
        connection.query("select * from mentors where m_id="+req.params.id, function(error, results, fields){
            if (error) throw error;
            // console.log(row);
            // console.log(results[0]);
            res.render("mentorProjects", {mentorProjects: row, mentor: results[0]});
        });
      }
   });
});

//student projects route
router.get("/student/:id", function(req, res){
   connection.query("select projects.* from projects inner join student_project on student_project.p_id = projects.p_id and student_project.s_id = ?", [req.params.id], function(error, row, fields){
        if (error) throw error;
        connection.query("select * from students where s_id = ?", [req.params.id], function(error, results, fields){
          if (error) throw error;
          res.render("studentProjects", {studentProjects: row, student: results[0]});
        }); 
   });
});


//join route
router.get("/join/:id", authenticationMiddleware(),function(req, res){
    connection.query("insert into student_project (p_id, s_id) values (?,?)", [req.params.id, req.user.user_id], function(error, row, fields){
        if(error) throw error;
        res.redirect("/projects/"+req.params.id);
    });
});

//registration remove by student and mentor
router.get("/registered/remove/:pid/:sid", function(req, res){
   connection.query("delete from student_project where p_id = ? and s_id = ?", [req.params.pid, req.params.sid], function(error, row, fields){
       if (error) throw error;
       res.redirect("/projects/"+req.params.pid);
   }) ;
});

function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

module.exports = router;