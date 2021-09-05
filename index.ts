const Picturesmongodb = require('./picturesmongodb.js')
const pictureMongodb = new Picturesmongodb();
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

app.get('/picture/:picture', function (req, res, next) {
    var picture = req.params.picture
    pictureMongodb.getPictureByName(picture).then((value => {
            console.log('outside', value)
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }
        }
    )).catch(e => {
        console.log(e)
        res.send(e)
    })
})


app.get('/pictures', function (req, res, next) {
    var date = req.query.date
    if(date) {
        pictureMongodb.getPicturesByDate(date).then((value => {
            console.log('outside', value)
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
})