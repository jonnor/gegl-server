/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

/* graph.js: Wrappers around the GEGL graph API to make it suitable
 for use in a client-server fashion. */
 
var gir = require('gir'),
    util = require('util'),
    fs = require('fs')
var Gegl = gir.load('Gegl', '0.2')
 
function init() {
    Gegl.init(0, [])
}




init()
// FIXME: Error: Converting array of 'utf8' is not supported
// console.log(Gegl.list_operations())

/* FIXME: no support for static methods or alternate constructors ?
 * TypeError: Object function Node() { [native code] } has no method 'new_from_xml'
 * */
/*
var loaded_graph = Gegl.Node.new_from_file("tests/data/example.xml", "/")
*/
console.log(Gegl.Node.new_from_xml)
var loaded_graph = Gegl.Node.new_from_xml(fs.readFileSync("tests/data/example.xml"), "/")
var a_save_node = loaded_graph.create_child('gegl:save')
loaded_graph.link(a_save_node)
a_save_node.set_property("path", "output2.png")
a_save_node.process()

 var graph = new Gegl.Node()
//var graph = Gegl.Node.new()


/* FIXME: doing console.log of the object prints "{}" */
// 
console.log(graph)
console.log(graph.connect_to)

var output = '';
var object = graph
for (property in object) {
  output += property + ': ' + object[property]+'; ';
}
// console.log(output)


/* FIXME: calling with missing arguments causes segfault instead of friendly warning/error */
//var node = graph.create_child()

var color_node = graph.create_child("gegl:checkerboard")
console.log(color_node.operation)

var crop_node = graph.create_child("gegl:crop")
console.log(crop_node.operation)
/* FIXME: Properties of the operation is not visible on the node */
console.log(crop_node.x, crop_node.y, crop_node.width, crop_node.height)
console.log(crop_node.get_property("x"))
console.log(crop_node.get_property("width"))

console.log(crop_node.to_xml("/"))
/* Note: This way of setting properties works */
crop_node.set_property('width', 100)
crop_node.set_property('height', 100)
console.log(crop_node.to_xml("/"))
/* This does not */
crop_node.x = 200
crop_node.y = 200
console.log(crop_node.to_xml("/"))


var save_node = graph.create_child('gegl:save')
save_node.set_property("path", "output.png")

color_node.link(crop_node)
crop_node.link(save_node)

save_node.process()

Gegl.exit()
