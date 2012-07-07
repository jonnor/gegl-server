
/* Server module */

var static = require('node-static');
var encoder = new require('node-html-encoder').Encoder('entity')

var http = require("http");
var url = require('url')
var querystring = require("querystring");

var processor = require('./processor')


function start() {

  var file_server = new(static.Server)(files_directory);

  var files_directory = './public'
  var files_url_pathname = '/files'
  var files_url = 'http://localhost:8888' + files_url_pathname

  // TODO: Unhardcode. Make parameters of the HTTP request on a "/process" path
  // TODO: Implement a demo "application" that allows users to
  // specify the graph XML and output filename, and hit "Process" to get the output
  var example_xml = require("fs").readFileSync('tests/data/example.xml')

  function onRequest(request, response) {
    
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    request.setEncoding("utf8");
    
    if (pathname.indexOf('/files') === 0) {

        var file_name = pathname.replace(files_url_pathname, files_directory)
        console.log("Serving file: " + file_name);
        file_server.serveFile('/' + file_name, 200, {}, request, response, function (err, result) {
            if (err) {
                response.writeHead(err.status, err.headers);
                response.end();
            }
        })
    
    } else if (pathname == "/favicon.ico") {
        console.log("Ignoring facicon request")

    } else if (pathname == "/") {

        response.writeHead(200, {"Content-Type": "text/html"});    

        var body = '<html>'+
            '<head>'+
            '<meta http-equiv="Content-Type" content="text/html; '+
            'charset=UTF-8" />'+
            '</head>'+
            '<body>'+
            '<form action="/process" method="post">'+
            'Graph: <br>' +
            '<textarea name="graphData" rows="20" cols="60">' + encoder.htmlEncode(String(example_xml)) +
            '</textarea> <br>' +
            'Output filename: <input type="text" name="outputFile" /> <br>' +
            '<input type="submit" value="Process" /><br>'+
            '</form>'+
            '</body>'+
            '</html>';

        response.write(body)
        response.end();

    } else if (pathname == "/process") {

        console.log("Processing request: " + url)

        var postData;
        request.addListener("data", function(postDataChunk) {
            postData += postDataChunk;
        });

        request.addListener("end", function() {

            //console.log(encoder.htmlDecode(decodeURIComponent(postData).replace(/([+])/g, ' ')) + '\n')

            var args = querystring.parse(postData)
            console.log(args)
            var output_file = files_directory + '/' + args.outputFile

            processor.process(args.undefinedgraphData, output_file, function(output_path, err) {
                if (err) {
                    response.write(err)
                } else {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write("File written to " + output_path + "<br>");
                    path = output_path.replace(files_directory, files_url)
                    response.write(path + "<br>");
                    response.write('<img src=' +  path + '/>');
                }
                response.end();
            });

        })
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"})
        response.write("Page not found")
        response.end();
    }



  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;
