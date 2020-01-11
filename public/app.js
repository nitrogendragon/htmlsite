const http = require('http')/**import http library */
const port = 3000/**we will enter localhost:3000 to inbrowser to run the server */
const fs = require('fs')/**used for reading our html files */
/**creates a server with a request listener and sends out responses depending  */
const server = http.createServer(function(req,res){
    res.writeHead(200, {'Content-Type': 'text/html'})
    fs.readFile('index.html', function(error, data){
        if(error){
            res.writeHead(404)
            res.write('Error: File Not Found')
        }
        else{
            res.write(data)
        }
        res.end()
    })

})

server.listen(port, function(error){
    if(error){
        console.log('Something went wrong', error)
    }
    else{
        console.log('Server is listening on port ' + port)
    }
})