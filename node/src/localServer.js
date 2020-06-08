module.exports = async function(withdrawCallback) {
    var express = require('express')
    var app = express()
    var bodyParser = require('body-parser')

    app.use(bodyParser.json())

    app.post('/withdraw', function (req, res) {
        withdrawCallback(req.body)
        res.end()
    })

    app.listen("8080", "localhost")
}