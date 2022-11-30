import { google } from "googleapis";
import * as jose from "node-jose"
const playintegrity = google.playintegrity('v1');


const packageName = process.env.PACKAGE_NAME
const privatekey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)


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
    
    let decrypt_key = "QmeXFVm+1mDk9iSjkpqW1XEDKYqF/1Vb+d8MFpHW+ig=";
    // let keystore = jose.JWK.createKeyStore();
    // await keystore.add(await jose.JWK.asKey(decrypt_key));
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
