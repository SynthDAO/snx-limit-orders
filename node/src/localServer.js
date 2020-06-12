module.exports = function(withdrawCallback) {
    var express = require('express')
    var app = express()
    var bodyParser = require('body-parser')

    app.use(bodyParser.json())

    app.post('/withdraw', function (req, res) {
        withdrawCallback(req.body)
        res.end()
    })

    return app.listen("7000", "localhost") 
}