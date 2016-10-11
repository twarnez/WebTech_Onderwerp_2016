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

app.engine("handlebars",handlebars.engine);

app.set("view engine", "handlebars");

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

/*Homepage rendering*/
app.get("/",function(req,res){
	res.render("home");
});

app.get("/home",function(req,res){
	res.render("home");
});

/*Aboutpage rendering*/
app.get("/about",function(req,res){
	res.render("about");
})

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
