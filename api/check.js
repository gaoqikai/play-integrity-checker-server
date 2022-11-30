import * as jose from "jose"

async function decrypt(token){
    console.log("\ntoken: "+token);
    let decrypt_key = Buffer.from("QmeXFVm+1mDk9iSjkpqW1XEDKYqF/1Vb+d8MFpHW+ig=", "base64");
    const { plaintext, protectedHeader } = await jose.compactDecrypt(token, decrypt_key);
    var jws = new TextDecoder().decode(plaintext);
    console.log("\njws: "+jws);

    const verify_key = `-----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdTrgi9WFM6mZ/SH3AMb3D0nPWIM+EA2pQO9F3tgmOjmZkX5vpTh0rPWi5uPvnpvjFbeC5d0QA1GP2lBJwv8+xg==
    -----END PUBLIC KEY-----`;
    const algorithm = 'ES256'
    const ecPublicKey = await jose.importSPKI(verify_key, algorithm)
    const { payload, protectedHeader2 } = await jose.compactVerify(jws, ecPublicKey);
    let result = new TextDecoder().decode(payload);

    console.log("\npayload: "+result)
    return result;
}

module.exports = async (req, res) => {
    const { token = 'none' } = req.query
    if (token == 'none') {
        res.status(400).send({ 'error': 'No token provided' })
        return
    }

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
