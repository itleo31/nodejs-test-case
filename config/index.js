'use strict';

module.exports = {
    "mongoURI": process.env.MONGOLAB_URI || "mongodb://localhost/testnodejs",
    "secret": process.env.SECRET_KEY || "thisisasecret",
    "stripeApiKey": process.env.STRIPE_API_KEY || "STRIPE_API_KEY"  
};

// Not load config from config.json any more
// module.exports = require('./config.json');
