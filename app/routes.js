var Asciimoji = require("./models/asciimoji");
var User = require("./models/user");
var path = require("path");
var passport = require("passport");

module.exports = function(app) {
	
	// server routes ===========================================================
	var asciimojiRouteWithId = "/api/asciimoji/:id";
	var asciimojiRoute = "/api/asciimoji";
	
	var checkAuthentication = function(req, res, next) {
		if(!req.isAuthenticated()) {
			res.sendStatus(401);
		} else {
			next();
		}
	};
	
	app.get( asciimojiRouteWithId, function(req, res) {
		Asciimoji.findById(req.params.id, function(err, asciimoji) {
			if(err) {
				res.send(err);
			}
			
			res.json(asciimoji);
		});
	});
	
	app.delete(asciimojiRouteWithId,
		checkAuthentication,
		function(req, res) {
			Asciimoji.findByIdAndRemove(req.params.id, {}, function(err, asciimoji) {
				if(err) {
					res.send(err);
				}
				
				res.json(asciimoji);
			});
		}
	);
	
	app.get(asciimojiRoute, function(req, res) {
		Asciimoji.find(function(err, asciimojis) {
			if(err) {
				res.send(err);
			}
			
			res.json(asciimojis);
		});
	});
	
	app.post(asciimojiRoute,
		checkAuthentication,
		function(req, res) {
			var newObj = {
				name: req.body.name,
				ascii: req.body.ascii
			};

			Asciimoji.create(newObj, function(err, asciimoji) {
				if(err) {
					res.send(err);
				}

				res.json(asciimoji);
			});
		}
	);
	
	app.post("/login", passport.authenticate("local"), function(req, res) {
		User.findOne({ email: req.user.email }, function(err, user) {
			if(err) {
				res.send(err);
			}
			if(!user) {
				res.send("No user found.");
			}

			res.json(user.getClientJson());
		});
	});
	
	app.get("/logout", function(req, res) {
		req.logout();
		res.sendStatus(200);
	});
	
	app.get("/loggedin", function(req, res) {
		if(req.isAuthenticated()) {
			User.findOne({ email: req.user.email }, function(err, user) {
				if(err) {
					res.send(err);
				}
				if(!user) {
					res.send("No user found.");
				}

				res.json(user.getClientJson());
			});
		} else {
			res.send("0");
		}
	});
	
	// frontend routes =========================================================
	var deferToAngularRouter = function(req, res) {
		res.sendFile(path.join(__dirname, "../public", "index.html"));
	};
	
	// restricted urls check auth first
	app.get("/admin", checkAuthentication, deferToAngularRouter);
	
	// route to handle all angular requests
	app.get("*", deferToAngularRouter);

};