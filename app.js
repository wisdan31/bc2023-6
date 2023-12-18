const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger-specs");
const qrcode = require("qrcode");

let devicesList = [];
let usersList = [];
let currentDeviceId = null;
let idCounter = 1;

const options = {
  type: "png",
  errorCorrectionLevel: "H",
  quality: 1,
  width: 300,
  height: 300,
};

class Device {
  constructor(name, description, serialNumber, manufacturer, id) {
    this.name = name;
    this.description = description;
    this.serialNumber = serialNumber;
    this.manufacturer = manufacturer;
    this.id = id;
    this.image = null;
    this.takenBy = null;
  }
}

class User {
  constructor(login, password) {
    this.login = login;
    this.password = password;
  }
}

function entryExists(deviceName, array) {
  return array.some((obj) => obj["name"] == deviceName);
}

const genQR = async (id) => {
  return await qrcode.toBuffer(String(id), options);
};

const registerDevice = (req, res) => {
  let name = req.query.name;
  let description = req.query.description;
  let serialNumber = req.query.serialNumber;
  let manufacturer = req.query.manufacturer;

  if (entryExists(name, devicesList)) {
    return res.status(409).send("Conflict: Device already exists");
  }

  devicesList.push(
    new Device(name, description, serialNumber, manufacturer, idCounter)
  );
  currentDeviceId = idCounter;
  idCounter++;
  res.set("Content-Type", "image/png");
  qrcode.toBuffer(String(currentDeviceId), options, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }
    res.send(buffer);
  });
};

app.listen(8000, (req, res) => {
  console.log("Server is running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const qrCodeBuffer = await genQR(123);
  res.set("Content-Type", "image/png");
  res.send(qrCodeBuffer);
});

app.get("/qrcode", async (req, res) => {
  const qrCodeBuffer = await genQR(currentDeviceId);
  res.set("Content-Type", "image/png");
  res.send(qrCodeBuffer);
});

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get a list of device names
 *     description: Retrieve the names of all devices.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               - "Device1"
 *               - "Device2"
 */

app.get("/devices", (req, res) => {
  let deviceNames = [];
  devicesList.forEach((element) => {
    deviceNames.push(element["name"]);
  });
  return res.status(200).send(deviceNames);
});

/**
 * @swagger
 * /devices/add:
 *   post:
 *     summary: Register a new device
 *     description: Register a new device with the specified details.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the device.
 *       - in: query
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *         description: The description of the device.
 *       - in: query
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The serial number of the device.
 *       - in: query
 *         name: manufacturer
 *         required: true
 *         schema:
 *           type: string
 *         description: The manufacturer of the device.
 *     responses:
 *       201:
 *         description: Device registered successfully
 *       409:
 *         description: Conflict - Device already exists
 */

app.post("/devices/add", registerDevice);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Update device by ID
 *     description: Update the details of a device with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the device to be updated.
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The updated name of the device.
 *       - in: query
 *         name: description
 *         required: true
 *         schema:
 *           type: string
 *         description: The updated description of the device.
 *       - in: query
 *         name: serialNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The updated serial number of the device.
 *       - in: query
 *         name: manufacturer
 *         required: true
 *         schema:
 *           type: string
 *         description: The updated manufacturer of the device.
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       404:
 *         description: Not found
 */

app.put("/devices/:id", (req, res) => {
  let id = req.params.id;
  let name = req.query.name;
  let description = req.query.description;
  let serialNumber = req.query.serialNumber;
  let manufacturer = req.query.manufacturer;

  let device = devicesList.find((obj) => obj.id == id);

  if (!device) {
    return res.status(404).send("Not found");
  }

  device.name = name;
  device.description = description;
  device.serialNumber = serialNumber;
  device.manufacturer = manufacturer;
  return res.status(200).send("OK");
});

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get device by id
 *     description: Retrieve a device with the specified id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               name: "Device1"
 *               description: "Example device"
 *               serialNumber: "123456"
 *               manufacturer: "Example Manufacturer"
 *               id: 123
 *       404:
 *         description: Not found
 */
app.get("/devices/:id", async (req, res) => {
  let id = req.params.id;
  let device = devicesList.find((obj) => obj.id == id);

  if (!device) {
    return res.status(404).send("Not found");
  }

  return res.status(200).json(device);
});

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete device by ID
 *     description: Delete a device with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the device to be deleted.
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       404:
 *         description: Not found - Device with the specified ID not found
 */

app.delete("/devices/:id", (req, res) => {
  let id = req.params.id;
  let device = devicesList.find((obj) => obj.id == id);

  if (!device) {
    return res.status(404).send("Such device not found");
  }

  devicesList = devicesList.filter((obj) => obj.id != id);
  return res.status(200).send("OK. Deleted device");
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the specified login and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Conflict - User already exists
 *     examples:
 *       userRegistrationExample:
 *         summary: Example of how to register a new user
 *         value:
 *           login: exampleUser
 *           password: examplePassword
 */

app.post("/users/register", (req, res) => {
  let login = req.body.login;  // Use req.body for form data
  let password = req.body.password;

  if (entryExists(login, usersList)) {
    return res.status(409).send("Conflict: User already exists");
  }

  usersList.push(new User(login, password));
  return res.status(201).send("Created");
});

/**
 * @swagger
 * /uploadImage/{id}:
 *   post:
 *     summary: Upload an image
 *     description: Upload an image file for a specific device.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the device to associate with the uploaded image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Bad request - Invalid file format or no file uploaded
 *       404:
 *         description: Not found - Device with the specified ID not found
 *     examples:
 *       imageUploadExample:
 *         summary: Example of how to upload an image
 *         value:
 *           image: (binary file content)
 */

app.post("/uploadImage/:id", (req, res) => {
  let id = req.params.id;
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  let image = req.files.image;
  if (!image.mimetype.includes("image")) {
    return res.status(400).send("Invalid file format");
  }

  let device = devicesList.find((obj) => obj.id == id);
  if (!device) {
    return res.status(404).send("Not found");
  }

  // Convert image to base64
  let base64Image = image.data.toString("base64");
  device.image = base64Image;

  // Return success response
  return res.status(200).send("Image uploaded successfully");
});

/**
 * @swagger
 * /viewImage/{id}:
 *   get:
 *     summary: View image by device ID
 *     description: Retrieve the image associated with the specified device ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the device whose image is to be viewed.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Not found - Device or image not found
 */

app.get("/viewImage/:id", (req, res) => {
  let id = req.params.id;
  let device = devicesList.find((obj) => obj.id == id);
  if (!device) {
    return res.status(404).send("Not found");
  }
  if (!device.image) {
    return res.status(404).send("Image not found");
  }
  let image = Buffer.from(device.image, "base64");
  res.set("Content-Type", "image/png");
  res.send(image);
});

/**
 * @swagger
 * /takeDevice/{id}:
 *   post:
 *     summary: Take a device
 *     description: Reserve a device for a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the device to be reserved.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device reserved successfully
 *       401:
 *         description: Unauthorized - Incorrect password
 *       404:
 *         description: Not found - Device not found
 *       409:
 *         description: Conflict - Device already taken
 */

app.post("/takeDevice/:id", (req, res) => {
  console.log("Request Body:", req.body); // Log the request body for debugging

  let id = req.params.id;
  let device = devicesList.find((obj) => obj.id == id);
  let login = req.body.login;
  let password = req.body.password;

  console.log("Users List:", usersList); // Log the users list for debugging
  if (!device) {
    return res.status(404).send("Not found such device");
  }

  let user = usersList.find((obj) => obj.login == login);

  if (!user) {
    return res.status(404).send("Not found such user");
  }

  if (user.password != password) {
    return res.status(401).send("Unauthorized: wrong password");
  }

  if (device.takenBy) {
    return res.status(409).send("Conflict: device already taken");
  }

  device.takenBy = login;
  return res.status(200).send("OK: successfully reserved device");
});

/**
 * @swagger
 * /users/{login}/takenDevices:
 *   get:
 *     summary: Get devices taken by a user
 *     description: Retrieve a list of devices reserved by the specified user.
 *     parameters:
 *       - in: path
 *         name: login
 *         required: true
 *         schema:
 *           type: string 
 *         description: The login of the user to retrieve taken devices for.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Device'
 *       404:
 *         description: Not found - User not found or no devices taken
 */

app.get("/users/:login/takenDevices", (req, res) => {
  let login = req.params.login;
  let devices = devicesList.filter((obj) => obj.takenBy == login);
  return res.status(200).json(devices);
});

