const express = require('express');
const qr = require('qrcode');
const app = express();
const port = 3000;

app.get("/combined-response", async (req, res) => {
  try {
    // Generate a QR Code image
    const qrCodeBuffer = await genQR("123");

    // Convert the QR Code buffer to a Base64-encoded string
    const qrCodeBase64 = qrCodeBuffer.toString('base64');

    // Send combined JSON and image response
    res.json({
      message: "Hello from combined JSON and image response",
      image: qrCodeBase64
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Function to generate a QR Code buffer for the given data
async function genQR(data) {
  try {
    return await qr.toBuffer(data);
  } catch (error) {
    console.error("Error generating QR Code buffer:", error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
