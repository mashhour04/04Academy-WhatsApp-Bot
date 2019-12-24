const router = require('express').Router();
const config = require('config');
const request = require('request');
router.get('/*', (req, res) => {
    const minioBase = config.get('minio_ip');
    let path = req.path;
    let filePath;
    if (minioBase.includes('http')) {
        filePath = minioBase + ':9000' + req.path;
    } else if (!minioBase.includes('http')) {
        filePath = 'http://' + minioBase + ':9000' + req.path;
    }
    console.log('full minio path', filePath);
    const proxy = request({ url: filePath })
    proxy.on('response', proxyResponse => {
        // proxyResponse is an object here
        console.log('piping')
        return proxyResponse;
    }).pipe(res)
    // request(filePath).then(stream => {
    //     console.log('got the respnse');
    //     return stream;
    //     })
    //     .pipe(res)
})
module.exports = router;
