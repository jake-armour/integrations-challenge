const { response } = require("express");

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
      console.log(response);
      authResponse = response;
      document.getElementById('cancel-button').removeAttribute('disabled');
    });
}

function onCancelTransaction() {
  fetch('/api/cancel', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: authResponse.processorTransactionId }),
  })
    .then((response) => {
      document.getElementById('cancel-button').setAttribute('disabled');
    });
}
