//hämta nödvändiga node packets 
const express = require('express');                                  
const expbs = require('express-handlebars');                
const path = require('path');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const Worker = require('./models/workers')
const app = express();
const bodyParser = require('body-parser');
//cookies, express session
const session = require("express-session");
const mongoDBSession = require('connect-mongodb-session')(session);
const https = require('https');
const fs = require('fs');
const { resolveSoa } = require('dns');


//tillåter använding av req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


//flytta viktig data till .env fil, require dotenv package
const dbURI;

//Cookies, skapar mySessions collection
const store = new mongoDBSession({
    uri: dbURI,
    collection: "mySessions"
});

//cookies, för encryption(?), ändra secret till randomgenererad string
app.use(session({
    secret: "EY8GYK5dnZroHsgQPWRizKgulqf1C5jnrzfiVEWgw10hcwZ55YDJ62VWwKBUGYHUsT06pOKnKA6tuvOjS2sS9stFSj5AFWqcZYJE",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3
      }
}));

//UPDATE cookie-session
const updateSessionCookie = (req, res, next) => {
    req.session.touch();
    next();
};

//AUTHENTICATION
const isWorkerAuth = (req, res, next) => {
    if(req.session.isWorkerAuth) {
        next();
    } else {
        res.redirect("/home");
    }
};

//AUTHENTICATION
const isAdminAuth = (req, res, next) => {
    if(req.session.isAdminAuth) {
        next();
    } else {
        res.redirect("/home");
    }
};

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology:true })
.then((result) => console.log('beep beep boop boop connected to db'))
.catch((err) => console.log(err));

app.get('/add-worker', (req, res) => {
    const worker = new Worker({
        name: 'Malin',
        username: 'malin1',
        password: '123abc'
    });

    worker.save()
    .then((result) => {
        res.send(result)
    })
    .catch((err) =>{
        console.log(err);
    })
})

app.get('/all-workers', (req, res) => {
    Worker.find()
    .then((result) => {
        res.send(result);
    })
    .catch((err) =>{
        console.log(err);
    })
})

const hbs = expbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/mainLayout'),
    partialsDir: path.join(__dirname, 'views/pieces'),

});

app.use(express.static('public'));
app.engine('handlebars', hbs.engine);                                  //säg att express-handlebars är view engine
app.set('view engine', 'handlebars');                               //sätt express-handlebars som view engine som vi använder

app.use('/', require('./routes/home'));
app.use('/home', require('./routes/home'));
app.use('/admin', isAdminAuth, updateSessionCookie, require('./routes/admin'));

app.use('/worker', isWorkerAuth, updateSessionCookie, require('./routes/worker'));
app.use('/registration',isAdminAuth, require('./routes/registration'));

app.get('*', (req, res) =>{
    res.status(404).render('404');
});

https.createServer({
    key: fs.readFileSync('private.key.pem'),
    cert: fs.readFileSync('domain.cert.pem')
  }, app)
  .listen(3000, function () {
    console.log('listening on port 3000!')
  })
