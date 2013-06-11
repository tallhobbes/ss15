
/*
 * GET users listing.
 */

var baseHead = 'Stolk-vey'
	, Models = require('../models/models')
	, Survey = Models.survey;

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.about = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('about', {
		title:  baseHead +' | About AHL',
		user: user
	});
}

exports.survey = function(req, res){
  if (req.user) { var user = req.user.username }
  else { var user = null }
  res.render('survey', {
        title: baseHead + ' | SIMS',
        user: user
  });
};

exports.create = function(req, res) {
	Survey.find({creator: req.user}).exec(function(err, user_surveys) {
		res.render('create', {
			title: baseHead + ' | Create New Survey',
			user: req.user.username,
			surveys: user_surveys
		});
	});
}

exports.splash = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('splash', {
		title: baseHead + ' | About SIMS',
		user: user
	});
}

exports.exportcsv = function(req, res) {
	if (req.user) { var user = req.user.username }
	else { var user = null }
	res.render('exportcsv', {
		title: baseHead + ' | Export CSV',
		user: req.user.username
	});
}

// Handle auth

exports.login = function(req, res) {
	res.render("login", {
		title: baseHead + ' | Log In',
		message: req.session.messages
	})
	req.session.messages = null;
}