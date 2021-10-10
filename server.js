// server.js
// where your node app starts
// delete databae_uri before pushing to prod
// database_uri = 'mongodb+srv://ThaneCap:Pharmacy2121!@cluster0.rsnwo.mongodb.net/Cluster0?retryWrites=true&w=majority'

// init project
require('dotenv').config()
var express = require('express');
var app = express();
var mongo = require('mongodb')
var mongoose = require('mongoose')
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser')

const { Schema } = mongoose;
//const { nanoid } = require('nanoid')
const shortid = require('shortid');
///check db connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});


//import { nanoid } from 'nanoid'
//used for prod
//mongoose.connect(process.env.MONGODB_URI)
//used for testing local
mongoose.connect(process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/urlShortener", function (req, res) {
  res.sendFile(__dirname + '/views/urlShortener.html');
});



// your first API endpoint...
app.get("/api/hello", function (req, res) {
  console.log({greeting: 'hello API'})
  res.json({greeting: 'hello API'});
});

//////////////////////////////
// ---- Timestap ----      //
////////////////////////////
app.get("/api/timestamp/",(req, res)=>{
  let nowDate = new Date();
  res.json({
    "unix": nowDate.getTime(),
    "utc": nowDate.toUTCString()
  });
})

app.get("/api/timestamp/:date", function (req, res)  {
  let date = req.params.date;
  let pdate = parseInt(date);
  let npud = new Date(pdate)
  let passedInValue = new Date(date);
  if(date.length === 13){
    res.json({
      "unix": npud.getTime(),
      "utc": npud.toUTCString()
  })
}
  if(passedInValue == "Invalid Date"){
    res.json({
      "error": "Invalid Date"
    })
  }else{
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }
});
/////////////////////////////////////
// Request Header Parser ----------//
/////////////////////////////////////
app.get('/api/whoami',(req,res)=>{

  res.json({
    "ipaddress": req.ip,
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  })
})

/////////////////////////////////////
// URL urlShortener      ----------//
/////////////////////////////////////

// create schema and model to save data to db //
const UrlSchema = new Schema({
    short_url: String,
    original_url: String,
    suffix:  String, // String is shorthand for {type: String}

  });
// create model
const ShortURL = mongoose.model('ShortURL', UrlSchema);

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//get user info from endpoint
app.post('/api/shorturl/', urlencodedParser,  (req, res) => {

  let client_requested_url = req.body.url
  let suffix = shortid.generate();
  let newShortURL= suffix

  let newURL = new ShortURL({
    short_url: __dirname + '/api/shorturl/' + suffix,
    original_url: client_requested_url,
    suffix: suffix
  })

//save to db
  newURL.save((err, doc) => {
    if (err) return console.error(err);
    res.json({
      "saved": true,
      "short_url": newURL.short_url,
      "original_url": newURL.original_url,
      "suffix": newURL.suffix
    });
  });
});

//lookup orig from db and redirect to orig link given by user
app.get('/api/shorturl/:suffix', (req,res) => {
  let userGeneratedSuffix = req.params.suffix;
  ShortURL.find({suffix: userGeneratedSuffix}).then((foundUrls) => {
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url)
  });
});


// listen for requests :)
// var listener = app.listen(process.env.PORT, function () {
//   console.log('Your app is listening on port ' + listener.address().port);
// });

var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
