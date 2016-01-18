'use strict';

/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_P31VRX8ZdnknJkEtTcIt5k42' );


var submitCreateTransaction = function(token) {
    $('form').append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
    // and submit
    $.ajax( {
        url: '/createtransaction',
        type: 'POST',
        headers: {
            'x-access-token': $( '#token' ).html(),
        },
        data: {
            amount: $( '#amount' ).val(),
            currency: $( '#currency' ).val(),
            stripeToken: token
        }
    } ).done( function( response ) {
        if ( response.message ) {
            $( '.payment-errors' ).text( response.message );
        }
    } );  
};

var isSubmit = false;
$( document ).ready( function() {
    $( '#submittransaction' ).click( function() {
        
        console.log( 'ok' );
        
        var paymentsource = $("form input[name='paymentsource']:checked" ).val();
        if (paymentsource && paymentsource.length > 0) {
            submitCreateTransaction(paymentsource);
            return;
        }
        
        // Use new card
        if ( !isSubmit ) {
            Stripe.card.createToken( {
                number: $( '.card-number' ).val(),
                cvc: $( '.card-cvc' ).val(),
                exp_month: $( '.card-expiry-month' ).val(),
                exp_year: $( '.card-expiry-year' ).val()
            }, function( status, response ) {
                if ( response.error ) {
                    // Show the errors on the form
                    $( '.payment-errors' ).text( response.error.message );
                }
                else {
                    // response contains id and card, which contains additional card details
                    var token = response.id;
                    // Insert the token into the form so it gets submitted to the server
                    submitCreateTransaction(token);
                }

            } );
        }

    } );
} );
