const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/file/:name', function (req, res, next) {
    var options = {
        root: 'F:\\art\\pictures\\test\\',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    var fileName = req.params.name

    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', fileName)
        }
    })
})