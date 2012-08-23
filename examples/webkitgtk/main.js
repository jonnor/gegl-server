#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

/* Demo application showing how one can combine Node.JS, Gegl and WebkitGtk
 * to build interactive native graphics processing applications in JS */

var gir = require('gir')
 ,  WebKit = gir.load('WebKit', '3.0')
 ,  Gtk =  gir.load('Gtk', '3.0')
 ,  Gegl = gir.load('Gegl', '0.2')
 ,  GeglGtk = gir.load('GeglGtk3', '0.1')
 ,  GeglServer = require('gegl-server')

Gtk.init(0);

var win = new Gtk.Window();

win.on('destroy', function(window) {
    console.log('Window destroyed');
    Gtk.main_quit();
    process.exit();
});

var sw = new Gtk.ScrolledWindow();
var webView = new WebKit.WebView();
sw.add(webView);

/* FIXME: crashes
webView.on('create-plugin-widget', function() {
    console.log('Handling plugin request')

    // TODO: embed the GeglGtk.View()
});
*/

/* TODO: drive graph manipulation from the client side */
Gegl.init(0, [])
var graph = new Gegl.Node()
var color_node = graph.create_child("gegl:checkerboard")
var crop_node = graph.create_child("gegl:crop")
crop_node.set_property('width', 200)
crop_node.set_property('height', 200)
color_node.link(crop_node)

var nodeView = new GeglGtk.View()
nodeView.set_node(crop_node)

var box = new Gtk.VBox()
box.pack_start(nodeView, true, true, 0)
box.pack_start(sw, true, true, 0)

webView.load_uri("file:///" + __dirname + '/start.html');

win.add(box);

win.set_size_request(640, 480);
win.show_all();

Gtk.main();
