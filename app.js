const mqtt = require("mqtt");
const express = require("express");
const session = require("express-session");
const http = require("http");      
const path = require("path");      
const { Server } = require("socket.io");
const { log } = require("console");
const app = express() ; 
const server = http.createServer(app);
const io = new Server(server);
const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.SESSION_SECRET);


mongoose.connect('mongodb+srv://daffahaibanmuzakki:4RBFIvsq9tSkQxw8@cluster0.eimhiyd.mongodb.net/Database_Article')
  .then(() => console.log('Connected!')).catch(err => { console.log(err);
  });

  const AlarmSchema = new mongoose.Schema({
  humidity: String,
  password: String
});

// 3. Buat Model (hubungkan ke collection, misalnya "articles")
const humid = mongoose.model("humid", AlarmSchema,"humids");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret : "tes", 
  resave : false , 
  saveUninitialized : false 
}));
app.use(express.static("public"));

function checkAuth(req,res,next) {
  if (req.session && req.session.loggedIn) {
    console.log("Ini checkAut");
    next() ;
  }
  else{
    res.redirect("/login")
  }
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


let alarmValue = 0;

const options = {
  host: "0cb34925a1694f5697d87fe0f2314ab9.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "Daffa_Haiban_Muzakki",
  password: "Babakankoda123"
};

app.get("/", checkAuth, async (req, res) => {

  let humidity_data = await humid.findOne();


  
  if (typeof req.session.alarmValue == 'undefined') {
    alarmValue = parseInt(humidity_data.humidity)
  }else{
    alarmValue = req.session.alarmValue > 100 ? undefined : req.session.alarmValue
  }

  delete req.session.alarmValue;
  res.render('humidity', {alarmValue})  ;
});

app.get("/login", (req, res) => {
  
  res.render('login', {})  ;
});


app.post("/login", async(req, res) => {

  let humidity_data = await humid.findOne();
  

  if (req.body.password == humidity_data.password) {
    console.log("Benar");
    req.session.loggedIn = true ;
    res.redirect('/') ; 
  }else{
    res.redirect('/login')
  }

});


app.post("/set_alarm", async(req, res) => {

  const input = req.body.alarm;

  
  // cek apakah angka
  if (!isNaN(input) && input.trim() !== "") {
    const alarmValue = parseInt(input, 10);

    // simpan ke session
    req.session.alarmValue = alarmValue;

    await humid.updateOne({humidity : alarmValue});

    
  } else {
    return res.status(400).send("Input harus berupa angka");
  }

  res.redirect("/");


});

const client = mqtt.connect(options);

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud ✅");
  
  client.subscribe("iot/dht11/hum", (err) => {
    if (!err) {
      console.log("Subscribed to iot/dht11/hum");
    }
  });
  

});

client.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());;
  
  
  console.log(`Topic: ${topic}, Message: ${message.toString()}`); 

  
  

  if (data.humidity > alarmValue) {
    client.publish("iot/dht11/alarm","1");
  }else{
    client.publish("iot/dht11/alarm","0");
  }


  io.emit("")
  
  io.emit("mqtt_data", {data, alarmValue} );

});










server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});