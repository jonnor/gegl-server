/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

var static = require('node-static');

var http = require("http");
var url = require('url')
var querystring = require("querystring");

var processor = require("./processor");

// FIXME: make these configurable from outside of module
var files_directory = './public'
var files_url_pathname = '/files'
var files_url = 'http://localhost:8000' + files_url_pathname

var file_server = new(static.Server)(files_directory);

function serveFile(request, response) {

    var pathname = url.parse(request.url).pathname;
    var file_name = pathname.replace(files_url_pathname, '');

    console.log("Serving file: " + file_name);

    file_server.serveFile('/' + file_name, 200, {}, request, response, function (err, result) {
        if (err) {
            response.writeHead(err.status, err.headers);
            response.end();
        }
    })
}

function process(request, response) {
    console.log("Processing request: " + url)

    var postData;

    request.addListener("data", function(postDataChunk) {
        postData += postDataChunk;
    });

    request.addListener("end", function() {

        var args = querystring.parse(postData)
        console.log(args)
        var output_file = files_directory + '/' + args.outputFile

        processor.process(args.undefinedgraphData, output_file, function(output_path, err) {
            if (err) {
                response.write(err)
            } else {
                response.writeHead(200, {"Content-Type": "text/plain"});
                path = output_path.replace(files_directory, files_url)
                console.log("File written to " + output_path);
                console.log("URL: " + path);
                response.write(path);
            }
            response.end();
        });

    })
}

function createServer(portNumber) {

  var example_xml = require("fs").readFileSync('tests/data/example.xml')

  function onRequest(request, response) {
    
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    request.setEncoding("utf8");
    
    if (pathname.indexOf('/files') === 0) {
        serveFile(request, response)

    } else if (pathname == "/process") {
        process(request, response)

    } else {
        response.writeHead(404, {"Content-Type": "text/plain"})
        response.write("Page not found")
        response.end();
    }

  }

  http.createServer(onRequest).listen(portNumber);
  console.log("Server has started.");
}

exports.process = process;
exports.serveFile = serveFile;
exports.createServer = createServer;
