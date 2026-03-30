const https = require("https");

const apiKey = "AIzaSyClN4gZRztlC_iirQvbDhOVTRisCmaWFoc";
const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello" }] }]
});

const req = https.request(
  {
    hostname: "generativelanguage.googleapis.com",
    port: 443,
    path: `/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  },
  (res) => {
    let raw = "";
    res.on("data", (chunk) => { raw += chunk; });
    res.on("end", () => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`BODY: ${raw}`);
    });
  }
);

req.on("error", (error) => {
  console.error(error);
});

req.write(data);
req.end();
