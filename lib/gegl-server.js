/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

var static = require('node-static');

var http = require("http");
var url = require('url')
var querystring = require("querystring");

var processor = require("./processor");

function extendOptions(target, source /*, source, ... */) {
    var source;
    for (var argIndex = 1, argCount = arguments.length; argIndex < argCount; argIndex++) {
        source = arguments[argIndex]
        if (source != null) {
            for (var key in source) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

var defaultOptions = {
    fileDirectoryPrefix : './public',
    fileUrlPrefix : '/files',
    fileUrlHost : 'http://localhost:8888'
}

// TODO: make API more object oriented. Return a server instance,
// which then can either be setup standalone with a listen() method
// or using the individual request handlers
function serveFile(request, response, passedOptions) {

    var options = extendOptions({}, defaultOptions, passedOptions)

    // FIXME: this should be created when the server is created,
    // not for every request
    var file_server = new(static.Server)(options.fileDirectoryPrefix);

    var pathname = url.parse(request.url).pathname;
    var file_name = pathname.replace(options.fileUrlPrefix, '');

    console.log("Serving file: " + file_name);
    console.log(options)

    file_server.serveFile('/' + file_name, 200, {}, request, response, function (err, result) {
        if (err) {
            response.writeHead(err.status, err.headers);
            response.end();
        }
    })
}

var fileNumber = 0

function process(request, response, passedOptions) {

    var options = extendOptions({}, defaultOptions, passedOptions)

    console.log("Processing request: " + request.url)
    console.log(options)

    response.setHeader("Content-Type", "application/json");

    var postData = '';

    request.addListener("data", function(postDataChunk) {
        postData += postDataChunk;
    });

    request.addListener("end", function() {

        if (request.headers['content-type'] == 'application/json') {
            var args = JSON.parse(postData)
        } else {
            var args = querystring.parse(postData)
        }

        console.log(args)

        if (!args.outputFile) {
            args.outputFile = 'file' + fileNumber++ + '.png'
        }

        if (args.graphData) {

        } else {
            console.log('Not enough arguments')
            response.writeHead(400);
            response.end();
            return
        }

        var output_file = options.fileDirectoryPrefix + '/' + args.outputFile

        processor.process(args.graphData, output_file, function(output_path, err) {
            if (err) {
                response.writeHead(400)
                console.log('Error while processing')
            } else {
                response.writeHead(200);
                var u = url.parse(request.url)
                console.log(u)
                var urlPrefix =  options.fileUrlHost + options.fileUrlPrefix
                var fileUrl = output_path.replace(options.fileDirectoryPrefix, urlPrefix)
                console.log("File written to " + output_path);
                console.log("URL: " + fileUrl);
                response.write(fileUrl);
            }
            response.end();
            return
        });

    })
}

function createServer(portNumber, hostName) {

  if (!hostName) {
      hostName = 'localhost'
  }

  var options = {fileUrlHost: 'http://' + hostName + ':' + portNumber}

  var example_xml = require("fs").readFileSync('tests/data/example.xml')

  function onRequest(request, response) {

    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    if (pathname.indexOf('/files') === 0) {
        serveFile(request, response, options)

    } else if (pathname == "/process") {
        process(request, response, options)

    } else {
        response.writeHead(404, {"Content-Type": "text/plain"})
        response.write("Page not found")
        response.end();
    }

  }

  return http.createServer(onRequest).listen(portNumber);
}

exports.process = process;
exports.serveFile = serveFile;
exports.createServer = createServer;
