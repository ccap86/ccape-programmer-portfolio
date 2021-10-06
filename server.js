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

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
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

// create application/json parser



app.post('/api/shorturl', urlencodedParser, function (req, res) {
  const UrlSchema = new Schema({
    orignal_url:  String, // String is shorthand for {type: String}
    short_id: String,
    placeHolder:   String,
  });
 const shortUrl = mongoose.model('shortUrl', UrlSchema);

  // create user in req.body
  let originalUrl = req.body.url
  let shortIdGen = shortid.generate();
  res.json({
    "url": req.headers["host"],
    "orignal_url": originalUrl,
    "short_id": shortIdGen
  })
})

// app.post('/api/shorturl',(req, res) =>{
//   res.json({
//     "url": req.headers["host"]
//   })
// })





// listen for requests :)
// var listener = app.listen(process.env.PORT, function () {
//   console.log('Your app is listening on port ' + listener.address().port);
// });

var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
