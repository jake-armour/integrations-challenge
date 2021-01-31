let authResponse = null;

window.primer.setup().then(onLoad);

function renderPayPalButton() {
  const button = document.getElementById('paypal-button');

  /**
   * The PayPal SDK has been loaded with the client ID which you configured in PayPal.ts.
   *
   * Pass the correct options to the paypal SDK in order to create an order for EUR 12.99
   * When the order is approved, you should call `onAuthorizeTransaction(...)` with the orderID
   * that you receive from PayPal
   */
  const options = {
    /*
    * createOrder
    *
    * Creates an order for a single purchase unit with the value of EUR 12.99
    * Intent defaults to capture, but the exercise is to authorize the payment, so intent is set here
    */
    createOrder: function(data, actions) {
      return actions.order.create({
        intent: 'AUTHORIZE',
        purchase_units: [{
          amount: { value: '12.99', currency_code: 'EUR' }
        }]
      })
    },
    /*
    * onApprove
    *
    * Triggered when PayPal approves the transaction, calls the onAuthorizeTransaction
    * method using the orderID that PayPal provides
    */
    onApprove: function(data, actions) {
      onAuthorizeTransaction(data.orderID)
    }
  };

  window.paypal.Buttons(options).render(button);
}

async function onLoad() {
  renderPayPalButton();

  document
    .getElementById('cancel-button')
    .addEventListener('click', onCancelTransaction);
}

function onAuthorizeTransaction(orderId) {
  fetch('/api/authorize', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
    .then((r) => r.json())
    .then((response) => {
      authResponse = response;

      /* 
      * Utilises the response to check the status of the authorisation
      * 
      * - If a processorTransactionId is defined, the client assumes the authorisation
      *   was successful and enables the cancellation button
      * - If there isn't a processorTransactionId, then it looks to see if the
      *   authorisation was declined or just encountered an error and then logs this
      *   to the console
      */
      if(authResponse.processorTransactionId) {
        document.getElementById('cancel-button').removeAttribute('disabled');
      } else {
        if(authResponse.errorMessage) console.error(authResponse.errorMessage)
        else console.error(authResponse.declineReason)
      }
    });
}

function onCancelTransaction() {
  fetch('/api/cancel', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: authResponse.processorTransactionId }),
  })
    .then((response) => {
      voidResponse = response

      /* 
      * Utilises the response to check if an error message was defined 
      * 
      * - If it was, it logs the error to the console.
      * - If it wasn't, the client assumes that the cancellation was successful and
      *   re-disables the cancellation button
      */
      if(voidResponse.errorMessage) console.error(authResponse.errorMessage)
      else document.getElementById('cancel-button').setAttribute('disabled')
    });
}
