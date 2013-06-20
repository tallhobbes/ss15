
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , classroom = require('./routes/classroom')
  , survey = require('./routes/survey')
  , mail = require('./routes/mail')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , Models = require('./models/models')
  , User = Models.User;



// Seed the admin
var admin = new User({
    username: 'stolktacular',
    email: "Whoop@gmail.com",
    password: "jsizzle",
    classes: []
  });
admin.save(function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("admin: " + user.username + " saved");
  }
});

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

// Passport set up local strategy
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {return done(null, false, { message: 'Unknown user ' + username}); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err)
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password'});
      }
    })
  })
}))

var app = express();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/sumsurv');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('secret', process.env.SESSION_SECRET || 'terrible, terrible secret')
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(app.get('secret')));
  app.use(express.session({ secret: '2fast2furious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// static page routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/about', user.about);
app.get('/splash', ensureDate, user.splash);
app.get('/survey', ensureDate, user.survey);
app.get('/survey/create', ensureAuthenticated, user.create);
app.get('/export', ensureAuthenticated, user.exportcsv);
app.get('/mail', user.mail);
app.get('/classes', ensureAuthenticated, user.my_classes);

// Mail routes
app.get('/mail/send', mail.test_mail);

// user routes
app.get('/login', user.login);
app.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/')
})

//redirect to rejection page
app.get('/reject', user.reject);

// Survey creation partials
app.get('/pages/current', survey.current_pages);
app.get('/surveys/all', survey.all_surveys);

// Class creation partials
app.get('/class/all', classroom.all);
app.get('/class/roster', classroom.roster);
app.get('/class/survey', classroom.survey);

//import text file
app.get('/import', ensureAuthenticated, user.import);

//get that text file's data
app.post('/import', survey.import);

//exporting page route(s)
app.get('/export/csv', survey.exportcsv1);

// handling survey objects
app.post('/survey/create', survey.create);
app.post('/survey/success', survey.save_response);

// handling classroom objects
app.post('/class/create', classroom.new_class);
app.post('/class/roster/update', classroom.roster_update);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Login middleware
function ensureAuthenticated(req, res, next) {
  console.log(req.route);
  if (req.isAuthenticated()) {return next()}
  req.session.nextpath = req.route.path;
  res.redirect('/login');
}

//date confirmation middleware
function ensureDate(req, res, next) {
  var datedata = new Date();
  if (datedata.getDay() == 4 || datedata.getDay() == 5 || datedata.getDay() == 6 || datedata.getDay() == 0) {return next()}
  res.redirect('/reject');
}

// Login auth @ post /login
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log('user', user)
    if (err) { return next(err) }
    if (!user) {
      console.log('login failed')
      req.session.messages = [info.message];
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      console.log('successful login')
      if (err) { return next(err); }
      req.session.user = user;
      console.log(req.session.nextpath);
      if (req.session.nextpath) {
        res.redirect(req.session.nextpath);
        req.session.nextpath = false;
      }
      else {
        res.redirect('/');
      }
    });
  })(req, res, next);
});

// Handle new user creation
app.post('/user/create', function(req, res, next) {
  var r = req.body
  if (r.username.length === 0|| r.email.length === 0 || r.password.length === 0 || r.passwordCheck.length === 0) {
    req.session.userMessage = "Missing credentials!";
    return res.redirect('/login');
  }
  else if (r.password !== r.passwordCheck) {
    req.session.userMessage = "Passwords did not match!";
    return res.redirect('/login');
  }
  User.find({email: r.email}).exec(function(err, user_db) {
    if (user_db.length > 0) {
      req.session.userMessage = "Email already registered!";
      return res.redirect('/login');
    }
    for (i=0;i<user_db.length;i++) {
      if (user_db[i].username === r.username) {
        req.session.userMessage = "Username already in use!";
        return res.redirect('/login');
      }
    }
    var newUser = new User({
      username: r.username,
      email: r.email,
      password: r.password
    });
    newUser.save(function(err) {
      if(err) {
        console.log("Error: ", err)
        req.session.userMessage = "Unable to save your credentials. Please try again!"
        return res.redirect('/login');
      }
      else {
        req.session.userMessage = "Successfully saved your credentials!"
        res.render('/login');
      }
    });
  });
})