const express = require('express');
const app = express();
const qrcode = require('qrcode');

const options = {
  type: 'png',
  errorCorrectionLevel: 'H',
  quality: 1,
  width: 300,
  height: 300,
}

const genQR = async (text) => {
  await qrcode.toBuffer(text, options)
}


class Device {
    constructor(name, description, serialNumber, manufacturer){
        this.name = name;
        this.description = description;
        this.serialNumber = serialNumber;
        this.manufacturer = manufacturer;
    }
}

class User {
  constructor (login, password){
    this.login = login;
    this.password = password;
  }
}

let devicesList = [];
let usersList = []

app.listen(8000, (req, res) => {
    console.log("Server is running");
})

app.get("/", async (req, res) => {
    res.set("Content-Type", "image/png");
    const qrCodeBuffer = await qrcode.toBuffer("meow", options);
    return res.send(qrCodeBuffer);
})

app.get("/devices", (req, res) => {
  return res.status(200).send(devicesList);
})

app.post("/devices/add", (req, res) => {
  let name = req.query.name;
  let description = req.query.description;
  let serialNumber = req.query.serialNumber;
  let manufacturer = req.query.manufacturer;

  devicesList.push(new Device(name, description, serialNumber, manufacturer));

  return res.status(201).send("Created");

  //...
})








