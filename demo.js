#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

// gegl-server demo application

var gegl_server = require('../gegl-server')
var http = require("http");
var url = require("url");

var encoder = new require('node-html-encoder').Encoder('entity')

function start() {

  var example_xml = require("fs").readFileSync('tests/data/example.xml')

  function onRequest(request, response) {
    
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    request.setEncoding("utf8");
    
    if (pathname == "/") {

        // Serve demo application
        response.writeHead(200, {"Content-Type": "text/html"});    

        var body = '<html>'+
            '<head>'+
            '<meta http-equiv="Content-Type" content="text/html; '+
            'charset=UTF-8" />'+
            '</head>'+
            '<body>'+
            '<form action="http://localhost:8888/process" method="post">'+
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

    } else {
        response.writeHead(404, {"Content-Type": "text/plain"})
        response.write("Page not found")
        response.end();
    }

  }

  http.createServer(onRequest).listen(8000);
  gegl_server.createServer(8888);
  console.log("Server has started.");
}

start();
