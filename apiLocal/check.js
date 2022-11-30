// import { google } from "googleapis";

const { google } = require("googleapis");
const http = require('http');
const express = require('express');

// import * as jose from "node-jose"
const jose = require("node-jose");

const playintegrity = google.playintegrity('v1');


// const packageName = process.env.PACKAGE_NAME
// const privatekey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)

const app = express();

app.get("/", function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(`<html><body><h1>This is HTML</h1></body></html>`);
});

app.get('/api/check', function(request, response){
    console.log("get /api/check");
    const token = request.query.token;
    console.log("request: " + token)
    response.status(200).send("OK");
    decrypt(token);
});

async function decrypt(token){
    let decrypt_key = "QmeXFVm+1mDk9iSjkpqW1XEDKYqF/1Vb+d8MFpHW+ig=";
    const dkeyJson = JSON.stringify(decrypt_key);
    let keystore = jose.JWK.createKeyStore();
    await keystore.add(await jose.JWK.asKey(decrypt_key));
    let output = jose.parse(token);
    // let decrypted = await output.perform(keystore);
    // let claims = Buffer.from(decrypted.plaintext).toString();

    console.log(output);
    return output;
}

module.exports = async (req, res) => {

    const { token = 'none' } = req.query

    if (token == 'none') {
        res.status(400).send({ 'error': 'No token provided' })
        return
    }
    
    console.log("token: " + token)

    decrypt(token)
        .then(data => {
            res.status(200).send(data)
            return
        })
        .catch(e => {
            console.log(e)
            res.status(200).send({ 'error': 'Google API error.\n' + e.message })
            return
        });
}

// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
