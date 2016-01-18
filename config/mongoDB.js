'use strict';

var mongoose = require( 'mongoose' );
var config = require( './index.js' );

var mongoURI = process.env.MONGOLAB_URI || config.mongoURI;
mongoose.connect( mongoURI );
