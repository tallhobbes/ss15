//serving pages and function related to consent forms
//can use previous class creation etc functions?


var baseHead = 'Survo'
	, Models = require('../models/models')
	, Classroom = Models.classroom;
	

exports.view = function(req, res) {
	console.log('req user: ', req.user);
	if (req.user) {var user = req.user.username}
	else { var user = null }
	Classroom.find({owner: req.user}).exec(function(err, db) {	
		console.log('classes! ', db);
		res.render('consent', {
			title:  baseHead +' | consent forms',
			user: user,
			classes: db
		});
	});
}

exports.cites = function(req, res) {
	Classroom.find({owner: req.user}).exec(function(err, db) {
		res.render('_classList', {classes: db[0]});
	});
}

exports.add = function(req, res) {
	var rAddRaw = req.body.rAdd
		, rAdd = []
		, consenters = [];

	//console.log('rAddRaw is: ',rAddRaw);
	for (i=0;i<rAddRaw.length;i++) {
		rAdd[i] = rAddRaw[i].toLowerCase();
		consenters.push({email:rAdd[i], status:'w'});
		//console.log('em is: ', em);
		// console.log('i is: ', i);
		// //em = rAdd[i];
		// Classroom.find({owner: req.user, name: req.body.name}).where('consents.email').in([em]).exec(function(err, db){
		// //Classroom.find({owner: req.user, name: req.body.name}).populate('consents.email').exec(function(err, db){
		// 	if(db){
		// 		console.log('db from search is', db);
		// 	}else{
		// 		console.log('this name appears unique: ', db);
		// 		consenters.push({email:em,status:'w'});
		// 		console.log('new consenters list:', consenters);
		// 	}
		// });
		// delete(em);
	};

	if (consenters.length) {
		console.log('attempting to do this consenters: ', consenters);
		Classroom.update({owner: req.user, name: req.body.name}, {$addToSet: {consents: {$each: consenters}}}).exec(function(err) {
			if(err) { console.log("Error in consents update: ", err); return false}
			else {
		        console.log("Successfully updated consents!");
		        res.send({success:true});
			}
		});
	}
}

exports.edit = function(req, res) {
	//try adding consent data?
	var consenter = {email: 'dum@dum.pop', status: 'w'};
	console.log('consenter: ', consenter);
	Classroom.find({owner: req.user, name: req.query.name}).where('consents.email').in(['dum@um.pop']).exec(function(err, db){
		console.log('db from search is', db);
	});
	// Classroom.update({owner: req.user, name: req.query.name},{ $push: {consents: consenter}}).populate('consents').exec(function(err){
	// 	if(err) { console.log("Error in consent update: ", err); return false}
	// });
	//console.log('demo is type: ', typeof(demo));
	//console.log('demo after push: ', demo);
	console.log('user: ', req.user);
	console.log('req.query: ',req.query);
	Classroom.find({owner: req.user, name: req.query.name}).exec(function(err, db) {
		console.log('db: ', db);
		console.log('consents? ', db[0].consents);
		res.render('_consentEdit', {cite: db, consents: db[0].consents, name: req.query.name})
	});
}