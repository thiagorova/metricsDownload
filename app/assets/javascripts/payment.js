(function(){

//form verification and some initial setups
    $(document).on('click','.payment div a',function(){
      $(this).closest('.payment').find('.selected').removeClass('selected');
      $(this).closest('div').addClass('selected');
      $('#membership-price').val( $(this).find('h1').html() );
    });

//stripe setup
    $('[type=submit]').prop('disabled', false); 
    $("#new_stripeForm").submit(function(event) {
        $('[type=submit]').attr("disabled", "disabled");
        Stripe.createToken($("#new_stripeForm"), stripeResponseHandler);
        return false;
    });    
}());

function stripeResponseHandler(status, response) {
  var $form = $('#new_stripeForm');
  if (response.error) { // Problem!
    // Show the errors on the form:
    $('#StripeErrorMessage').text(response.error.message);
    $form.find('[type=submit]').prop('disabled', false); // Re-enable submission
  } else { // Token was created!

    // Get the token ID:
    var token = response.id;
    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripe_card_token">').val(token));
//    $('#stripe_card_token').val(token);
    // Submit the form:
    $form.get(0).submit();
  }
};
