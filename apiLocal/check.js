const http = require('http');
const express = require('express');
const jose = require("jose");
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
    token = "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.md4w6VSLa1R37rt6nCPNvhgYVbD4Yp40Vw35OqRoUYo9aorgDljqAA.NICOcCGN_yC4QcwG.GbUL6-xg95CG1WcuD72rGY-s2uznb5Skoj2MmkaF-fESvXRzuIPi3COItOaHxlA3NlrIUDaVaebcQgEu57S0Uqxkq44Nrd1WUsgwR4SpLiI452vNLYMBOkdHg4PKT5PThH9Nq6bCFMKQ_RBZ_LJohEQ-qVIlrcfgmUV7XK6_pzeRYRf4cRxykDZDk6Zv5pS2KbE64_k9hWkVMdiyjCN0A-zL5l4hm6SxkRrlGRAJUUFpj3pKbmuxQlKs2WRBmbmLnzU5wsAqQgyQyGVXwMAdpRLWuiHVyl09VcDreQlzPP9Ycp93I41gF8q1hHF3dJTBALLO2dCzOtGyE1YfTRisFopEQ0tI1QimraeDhuxCBOtexS4Iub8SBMPqQuDKnGzc4ZXoU-TErSlHIV5AX25kJ-qUINwhfj3_ekIBcy_59viD5lbX0rXaVlqxuDoISa02oO7wr4_oZYAM1tjG83Pq-h2_pmZXB2w3ZphMvbTDOH3SrxC18aoCf3QruDlE2UWbi3ZZXRoYeLyMfhdrQdjTD-OnQxQZjhRHf5nP236FoG2ZTRZZheSfqYdDnZJICliJPs3dTdtKszRSoLUvjrsoQ0Kw6xnyKPGfjy5gG5D8AC4m7tvkrBbe4jaKRD78sDPp3CUA5gJGmrDHw9dlWoq0nqqTc1TYYsEL4x_R-gg9PyQACQYYWyKA372TMEpjg5cvhMHBcU0dfHxKraN4_FECmT-skk2XkFe-m8tfGDw8zwjUaGFa2Ynyz2NR6y__4JDkC27M_f6qFkRaTRD3gFnpDPKIqAXGgxkCDk-7Seaz6nkyDpLgbRKyArVSjmLAnKeZOcjykQRaTOfFhoALa9H3vAjG3LRKv2B136JnnV43Tq2o2Efg6l8VzgAhXtz2tbg7TEuakIqs_6w-CImMYrT5eEadlwQeq1H2svm5LWzmlZMsnGq9WgaBZGmtrWHLA_Xja-iUCsZfYTeEN-ZOySWx39CiptHhrIyi-3uyHHzweItNy0DUCKsEr8rRwvmSllGieA2hdpm9Yfcyqkor41j7kTxLoVuwQeyMrwheBm7iRhvbqBjaCCT21ARDJ0XeOdeP5-nJY6mJ9r_PLg3VbnrTPVZTIJIQ9KK5JL93gcNke8BCyH9vxD0K2gX3T-QsuQHKvpcjN-X2K6BJwo6qu6AtLGOEvB0HxtBVaJQYJwv-W8jdbcJZWcbNiCgKpdJ5zzmxyl_cEnvnPKA.IGwpfv3_AtqlAN5_bUww6Q";

    console.log("token: "+token);
    let decrypt_key = Buffer.from("QmeXFVm+1mDk9iSjkpqW1XEDKYqF/1Vb+d8MFpHW+ig=", "base64");
    const { plaintext, protectedHeader } = await jose.compactDecrypt(token, decrypt_key);
    var jws = new TextDecoder().decode(plaintext);
    console.log("jws: "+jws);

    const verify_key = `-----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdTrgi9WFM6mZ/SH3AMb3D0nPWIM+EA2pQO9F3tgmOjmZkX5vpTh0rPWi5uPvnpvjFbeC5d0QA1GP2lBJwv8+xg==
    -----END PUBLIC KEY-----`;
    const algorithm = 'ES256'
    const ecPublicKey = await jose.importSPKI(verify_key, algorithm)
    const { payload, protectedHeader2 } = await jose.compactVerify(jws, ecPublicKey);
    let result = new TextDecoder().decode(payload);

    console.log("payload: "+result)
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

// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
