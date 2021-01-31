import {
  ClientIDSecretCredentials,
  ParsedAuthorizationResponse,
  ParsedCaptureResponse,
  PayPalOrder,
  ProcessorConnection,
  RawAuthorizationRequest,
  RawCancelRequest,
  RawCaptureRequest,
} from '@primer-io/app-framework';

/**
 * Use the HTTP Client to make requests to PayPal's orders API
 */
import HTTPClient from '../common/HTTPClient';

const PayPalConnection: ProcessorConnection<
  ClientIDSecretCredentials,
  PayPalOrder
> = {
  name: 'PAYPAL',

  website: 'https://paypal.com',

  configuration: {
    accountId: 'sb-o9s3t4941374@business.example.com',
    clientId: 'AcOJoN_FIV4BzpF7g27vx_chsyhGIhEub6e_gay_Y3wK0-3Uq7P3CzV5kFRCJR81rYH4YhFxFx1Bxn4u',
    clientSecret: 'EEC7qhwhzhX5RyjaFpjh_LYEM2sZAro34fenzXUCbPF9410femb8Gp21S3JCOxKeCKB_aUu13tBVkk6S',
  },

  /**
   * Authorize a PayPal order
   * Use the HTTPClient and the request info to authorize a paypal order
   */
  authorize(
    request: RawAuthorizationRequest<ClientIDSecretCredentials, PayPalOrder>,
  ): Promise<ParsedAuthorizationResponse> {

    /*
    * authorize
    * 
    * API Endpoint:
    *   https://api-m.sandbox.paypal.com/v2/checkout/orders/{orderID}/authorize
    * 
    * Returns:
    *   Promise<ParsedAuthorizationResponse>
    *     <IAuthResponse>
    *       { processorTransactionId: string }
    *       type: TransactionStatus
    *       value: 'AUTHORIZED', 'SETTLING', 'SETTLED' or 'CANCELLED'
    *     <IAuthResponse>
    *       { declineReason: string }
    *       type: TransactionStatus
    *       value: 'DECLINED'
    *     <IAuthResponse>
    *       { errorMessage: string }
    *       type: TransactionStatus
    *       value: 'FAILED'
    * 
    *   let example: ParsedAuthorizationResponse = {
    *     processorTransactionId: {authorization ID}
    *     transactionStatus: 'AUTHORIZED'
    *   }
    * 
    *   Client ID + Secret Auth giving me certificate errors so currently using access token
    *     "Authorization": "Basic " + request.processorConfig.clientId + ':' + request.processorConfig.clientSecret,
    */
    return HTTPClient.request('https://api-m.sandbox.paypal.com/v2/checkout/orders/'+ request.paymentMethod.orderId + '/authorize', {
      headers: {
        "Authorization": "Bearer A21AAKD9uSRut66slYh067vlc1Sfwp2q_U7fKxcelSLzPRGZErt2v4Bb1WyX0MmkaFARP3rPHLZkuuTm7fUlIwQ5DzFe4y0iA",
        "content-type": "application/json"
      },
      method: 'post',
      body: ``
    })
    .then((r) => JSON.parse(r.responseText))
    .then((response) => {
      let authResponse: ParsedAuthorizationResponse = {
        /* If it needs to cancel the order */
        //processorTransactionId: response.id,
        /* If it needs to void the authorization */
        processorTransactionId: response.purchase_units[0].payments.authorizations[0].id,
        transactionStatus: 'AUTHORIZED'
      }
      return authResponse
    });
  },

  /**
   * Cancel a PayPal order
   * Use the HTTPClient and the request information to cancel the PayPal order
   */
  cancel(
    request: RawCancelRequest<ClientIDSecretCredentials>,
  ): Promise<ParsedCaptureResponse> {

    /*
    * cancel
    * 
    * API Endpoint:
    *   https://api-m.sandbox.paypal.com/v2/payments/authorizations/{authorisationID}/void
    * 
    * Returns:
    *   Promise<ParsedCaptureResponse>
    *     transactionStatus: required
    *       type: TransactionStatus
    *       value: 'AUTHORIZED', 'DECLINED', 'FAILED', 'SETTLING', 'SETTLED' or 'CANCELLED'
    *     declineReason: optional
    *       type: DeclineReason 
    *       value: 'DO_NOT_HONOR', 'INSUFFICIENT FUNDS' or 'UNKNOWN'
    *     errorMesage: optional
    *       type: string
    * 
    *   let example: ParsedCaptureResponse = {
    *     transactionStatus: 'AUTHORIZED'
    *   }
    * 
    *   Client ID + Secret Auth giving me certificate errors so currently using access token
    *     "Authorization": "Basic " + request.processorConfig.clientId + ':' + request.processorConfig.clientSecret,
    */

    return HTTPClient.request('https://api-m.sandbox.paypal.com/v2/payments/authorizations/'+ request.processorTransactionId + '/void', {
      headers: {
        "Authorization": "Bearer A21AAKD9uSRut66slYh067vlc1Sfwp2q_U7fKxcelSLzPRGZErt2v4Bb1WyX0MmkaFARP3rPHLZkuuTm7fUlIwQ5DzFe4y0iA",
        "content-type": "application/json"
      },
      method: 'post',
      body: ``
    })
    .then((response) => {
      let authResponse: ParsedCaptureResponse = {
        transactionStatus: 'CANCELLED'
      }
      return authResponse
    });
  },

  /**
   * Capture a PayPal order (You can ignore this method for the exercise)
   */
  capture(
    request: RawCaptureRequest<ClientIDSecretCredentials>,
  ): Promise<ParsedCaptureResponse> {
    throw new Error('Not Implemented');
  },
};

export default PayPalConnection;
