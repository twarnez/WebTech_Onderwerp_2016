'use strict'
/************************
**** Setup of server ****
************************/
var express = require("express");

var app = express();
var info = require("./lib/info.js");
var handlebars = require("express3-handlebars").create(
	{
		defaultLayout: "main",
		helpers: {
			section: function(name,options)
			{
				if(!this._sections)
				{
					this._sections = {};
				}
				this._sections[name] = options.fn(this);
				return null;
			}
		}
	});

var bodyParser = require("body-parser");

var formidable = require("formidable");
var fs = require("fs");
var credentials = require("./credentials.js");

var session = require("express-session");

app.engine("handlebars",handlebars.engine);

app.set("view engine", "handlebars");
var dataDir = __dirname +"/data";
var photoDir = dataDir + "/photo";
var mv = require("mv");

if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if(!fs.existsSync(photoDir)) fs.mkdirSync(photoDir);

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {};
  res.locals.partials.info = info.getInfo();
  next();
});

/*Port setup and listen to that port*/
app.set("port", process.env.PORT||8000);

app.listen(app.get("port"),function(){
	console.log("Server started on http://localhost:" + app.get("port"));
});

/**************************************
********** Rendering of pages *********
**************************************/
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret:credentials.cookieSecret,
  resave: false,
  saveUninitialized: false
}));


/*Homepage rendering*/
app.get("/",function(req,res){
	res.render("home");
});

app.get("/home",function(req,res){
	res.render("home");
});
/*A mini game page*/
app.get("/minigame", function(req, res){

	res.render("minigame");
})
app.post("/chatmachine", function(req, res){
  req.session.command = req.body.command;
	console.log("Form: " + req.query.form);
  console.log("CSRF: " + req.body._csrf);
  console.log("Command: " + req.body.command);
	res.redirect(303,"/thank-you");
});
/*A chat machine page*/
app.get("/chatmachine", function(req, res){
	var commandFromSession = req.session.command;
	res.render("chatmachine",{crsf:"CSRF token goes here",
                            cookieCommand:commandFromSession
													});

})





/*login form handling*/
app.post("/process", function(req, res){
  req.session.name = req.body.name;
  req.session.email =  req.body.email;
	req.session.pasword = req.body.pasword;
	console.log("Form: " + req.query.form);
  console.log("CSRF: " + req.body._csrf);
  console.log("Name: " + req.body.name);
  console.log("Email: " + req.body.email);
	console.log("Pasword: " + "ok");
  res.redirect(303, "/thank-you");
});
/*A login page*/
app.get("/login", function(req, res){
	var nameFromSession = req.session.name;
	var emailFromSession = req.session.email;
	var paswordFromSession = req.session.pasword;
	res.render("login",{csrf:"CSRF token goes here",
                            cookieName:nameFromSession,
                            cookieEmail:emailFromSession,
														cookiePasword:paswordFromSession
													});
})



/*A mini game page*/
app.get("/lookatprettypictures", function(req, res){
	var now = new Date();
	res.render("lookatprettypictures",
	{year:now.getFullYear(), month:now.getMonth()});
})
//Upload form handling
app.post("/upload/:year/:month", function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, "/error");
			const photo = files.photo;
	    const dir = photoDir + "/" + Date.now();
	    const path = dir + "/" + "uploadedphoto.jpg";
	    fs.mkdirSync(dir);
	    mv(photo.path.toString(), path.toString(), (err) =>{
	      if(err) console.log("Error - moving resource from tmp to data directory");
	    });
    res.redirect(303, "/thank-you");
  });
});

/*Aboutpage rendering*/
app.get("/about",function(req,res){
	res.render("about");
})
/* succes form page*/
app.get("/thank-you",(req,res)=>{
	res.render("thank-you");
}
)

/* error page*/
app.get("/error",(req,res)=>{
	res.render("500");
}
)
/*Custom 404 error page*/
app.use(function(req,res,next){
	res.status(404);
	res.render("404");
})

/*Custom 500 error page*/
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500);
	res.render("500");
})
