#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

// gegl-server demo application

var gegl = require('../gegl-server')
var http = require("http");
var url = require("url");

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
            '<style type="text/css">' +
            '#previewPane {float:left;}' +
            '#editorPane {float:left;}' +
            '</style>' +
            '</head>'+
            '<body>'+
            '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>' +
            '<script src="http://localhost:8000/files/demo-clientside.js"></script>' +
            '<div id="editorPane">' +
            '<form id="graphForm">'+
            '<textarea name="graphData" rows="20" cols="60">' + example_xml +
            '</textarea> <br>' +
            'Output filename (optional): <input type="text" name="outputFile" /> <br>' +
            '<input type="submit" value="Process" /><br>' +
            '</form>'+
            '</div>' +
            '<div id="previewPane">' +
            '<img id=previewImage width=400 height=400' +
            '</img>' +
            '</div>' +
            '</body>'+
            '</html>';

        response.write(body)
        response.end();

    } else if (pathname.indexOf('/files') === 0) {
        gegl.serveFile(request, response);

    } else if (pathname == "/process") {
        gegl.process(request, response);

    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("Page not found")
        response.end();
    }
  }


  http.createServer(onRequest).listen(8000);
  console.log("Server has started.");
}

start();
