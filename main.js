#!/usr/bin/env node

var sipserver = require("./SipServer");

sipserver.start(5060);