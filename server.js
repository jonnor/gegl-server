#!/usr/bin/env node

/* This file is part of gegl-server
 * License: MIT, http://www.opensource.org/licenses/mit-license.html
 * Copyright 2012, Jon Nordby <jononor@gmail.com (http://jonnor.com)
 */

// gegl-server executable

gegl_server = require('../gegl-server')
gegl_server.createServer(8888)
