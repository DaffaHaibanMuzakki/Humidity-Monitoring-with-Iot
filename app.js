const mqtt = require("mqtt");
const express = require("express");
const http = require("http");      
const path = require("path");      
const { Server } = require("socket.io");
const app = express() ; 
const server = http.createServer(app);
const io = new Server(server);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


let alarmValue = null;

const options = {
  host: "0cb34925a1694f5697d87fe0f2314ab9.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "Daffa_Haiban_Muzakki",
  password: "Babakankoda123"
};

app.get("/", (req, res) => {
  res.render('humidity', {})  ;
});

app.post("/login", (req, res) => {




  res.render('humidity', {})  ;
});


app.post("/set_alarm", (req, res) => {
  console.log(req.body);
  alarmValue = parseInt(req.body.alarm);
res.redirect("/", {alarmValue});
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
  const data = message.toString();
  console.log(`Topic: ${topic}, Message: ${message.toString()}`); 

  client.publish("iot/dht11/alarm", "1"); 


  

  if(alarmValue !== null && data > alarmValue) {
    console.log("⚠️ WARNING! Humidity above threshold:", data);
    io.emit("alarm_triggered", { value: data, threshold: alarmValue });
    client.publish("iot/dht11/alarm", "1"); 
  } else {
    client.publish("iot/dht11/alarm", "0");
  }

  io.emit("mqtt_data", { topic, data });

});










server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});