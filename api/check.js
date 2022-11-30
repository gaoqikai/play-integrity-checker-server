import { google } from "googleapis";
import * as jose from "node-jose"
const playintegrity = google.playintegrity('v1');


const packageName = process.env.PACKAGE_NAME
const privatekey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const decryptKey = "QmeXFVm+1mDk9iSjkpqW1XEDKYqF/1Vb+d8MFpHW+ig="


async function getTokenResponse(token) {

    let jwtClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        ['https://www.googleapis.com/auth/playintegrity']);

    google.options({ auth: jwtClient });

    const res = await playintegrity.v1.decodeIntegrityToken(
        {
            packageName: packageName,
            requestBody:{
                "integrityToken": token
            }
        }

    );


    console.log(res.data.tokenPayloadExternal);

    return res.data.tokenPayloadExternal
}

async function decrypt(token){
    var result = jose.JWE.createDecrypt(decryptKey).decrypt(token);
    console.log(result);
    return result;
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
