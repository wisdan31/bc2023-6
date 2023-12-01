const express = require('express');
const app = express();
const qrcode = require('qrcode');

let idCounter = 1;

const options = {
  type: 'png',
  errorCorrectionLevel: 'H',
  quality: 1,
  width: 300,
  height: 300,
}

const genQR = async (id) => {
  return await qrcode.toBuffer(("http://localhost:8000/devices/" + id), options)
}

class Device {
    constructor(name, description, serialNumber, manufacturer, id){
        this.name = name;
        this.description = description;
        this.serialNumber = serialNumber;
        this.manufacturer = manufacturer;
        this.id = id;
    }
}

class User {
  constructor (login, password){
    this.login = login;
    this.password = password;
  }
}

const registerDevice = (req, res) => {
  let name = req.query.name;
  let description = req.query.description;
  let serialNumber = req.query.serialNumber;
  let manufacturer = req.query.manufacturer;

  devicesList.push(new Device(name, description, serialNumber, manufacturer, idCounter));
  idCounter++;
  return res.status(201).send("Created");
}

let devicesList = [];
let usersList = []

app.listen(8000, (req, res) => {
    console.log("Server is running");
})

app.get("/", async (req, res) => {
    res.set("Content-Type", "image/png");
    const qrCodeBuffer = await genQR(123);
    return res.send(qrCodeBuffer);
})

app.get("/devices", (req, res) => {
  return res.status(200).send(devicesList);
})

app.post("/devices/add", registerDevice)

app.put("/devices/:id", (req, res) => {

})

app.get("/devices/:id", (req, res) => {
  
})








