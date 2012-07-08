#!/usr/bin/env node
// gegl-server executable

gegl_server = require('../gegl-server')
gegl_server.createServer(8888)
