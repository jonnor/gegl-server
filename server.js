
/* Server module */

var http = require("http");
var static = require('node-static');
var url = require('url')

var processor = require('./processor')


function start() {

  var file_server = new(static.Server)(files_directory);

  var files_directory = './public'
  var files_url_pathname = '/files'
  var files_url = 'http://localhost:8888' + files_url_pathname

  // TODO: Unhardcode. Make parameters of the HTTP request on a "/process" path
  // TODO: Implement a demo "application" that allows users to
  // specify the graph XML and output filename, and hit "Process" to get the output
  var xml = require("fs").readFileSync('tests/data/example.xml')
  var output_file = files_directory + '/output.png'

  function onRequest(request, response) {
    
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    
    if (pathname.indexOf('/files') === 0) {

        var file_name = pathname.replace(files_url_pathname, files_directory)
        console.log("Serving file: " + file_name);
        file_server.serveFile('/' + file_name, 200, {}, request, response)
    
    } else if (pathname == "/favicon.ico") {
        console.log("Ignoring facicon request")
    } else {

        console.log("Processing")
        response.writeHead(200, {"Content-Type": "text/html"});    

        processor.process(xml, output_file, function(output_path, err) {
            if (err) {
                response.write(err)
            } else {
                response.write("File written to " + output_path + "<br>");
                path = output_path.replace(files_directory, files_url)
                response.write(path + "<br>");
                response.write('<img src=' +  path + '/>');
            }
            response.end();
        })
    }

  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
