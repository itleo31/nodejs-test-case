'use strict';

var Transactions = require( '../models/transactions.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )( config.stripeApiKey );

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                console.log( err );
                return res.status(500).json({
                    message: 'Error occured. Please try again'
                });
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {
    console.log('create transaction');
    
    // Check if req does not contain token
    var source = req.body.stripeToken;
    
    if (!source) {
        // Res message if not found token
        return res.status(200).json({
            success: false,
            message: 'Token not found'
        });
    }
    
    // Charge request body
    var params = {
        amount: req.body.amount,
        currency: req.body.currency,
        source: source,
        description: 'Charge for ' + req.user.name
    };
    
    var chargeCallback = function( err, charge ) {
        if ( err ) {
            console.log( err );
            // Response to client
            return res.status(500).json({
                message: 'Error occured. Please try again'
            });
        }
        
        var transaction = new Transactions( {
            transactionId: charge.id,
            amount: charge.amount,
            created: charge.created,
            currency: charge.currency,
            description: charge.description,
            paid: charge.paid,
            sourceId: charge.source.id
        } );
        transaction.save( function( err ) {
                if ( err ) {
                    // Response a message
                    return res.status( 500 ).send({
                        message: 'Failed to create payment'
                    });
                }
                else {
                    // Update sourceId to user for using later.
                    var user = req.user;
                    
                    user.source = charge.source;
                    
                    user.save(function(err) {
                        
                       if (err) {
                           // Althougt we got error when saving source, but Payment actually created successfully.
                           // So log message here and not response error.
                           console.log('Failed to save source for user:');
                           console.log(err);
                       } 
                       
                       res.status( 200 ).json( {
                            message: 'Payment is created.'
                        } );
                    });
                    
                }
            } );
            // asynchronously called
    };
    
    if (!req.user.stripeCustomerId) {
        // Create Stripe customer to track payments for this user if hasn't existed
        Stripe.customers.create({
            description: 'Customer for ' + req.user.name,
            source: source 
        }, function(err, customer) {
            // Save customer to user object
            req.user.stripeCustomerId = customer.id;
            
            params.customer = customer.id;
            params.source = customer.sources.data[0].id;
            Stripe.charges.create(params, chargeCallback);
        });
    } else {
        params.customer = req.user.stripeCustomerId;
        
        Stripe.charges.create(params, chargeCallback);
    }
    
    
    
    
    
};
