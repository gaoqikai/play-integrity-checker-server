import * as jose from "jose"

async function decrypt(token){
    console.log("\ntoken: "+token);
    var dec_key_1 = "4+suAJiXSzjEJaSyX5";
    var dec_key_2 = "+cWm4mzF2L9qQgeR+OpT/zErU=";
    let decrypt_key = Buffer.from(dec_key_1+dec_key_2, "base64");
    const { plaintext, protectedHeader } = await jose.compactDecrypt(token, decrypt_key);
    var jws = new TextDecoder().decode(plaintext);
    console.log("\njws: "+jws);

    var ver_key_1 = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE80huhlJ2MoqDqwPvIUrclv5cef55vRFEKrqTqXTyEesLULec4LcTgJfMrRxuIZoNQpc"
    var ver_key_2 = "+TBrbORmtwgLvLEHBfA=="
    const verify_key = "-----BEGIN PUBLIC KEY-----"+ver_key_1+ver_key_2+"-----END PUBLIC KEY-----";
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
