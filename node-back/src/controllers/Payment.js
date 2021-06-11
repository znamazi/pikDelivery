const https = require('https')
const querystring = require('querystring')

class DirectPost {
  constructor(security_key) {
    this.security_key = security_key
  }

  setBilling(billingInformation) {
    // Validate that passed in information contains valid keys
    const validBillingKeys = [
      'first_name',
      'last_name',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'zip',
      'country',
      'phone',
      'fax',
      'email'
    ]

    for (let key in billingInformation) {
      if (!validBillingKeys.includes(key)) {
        throw new Error(`Invalid key provided in billingInformation. '${key}'
            is not a valid billing parameter.`)
      }
    }

    this.billing = billingInformation
  }

  setShipping(shippingInformation) {
    // Validate that passed in information contains valid keys
    const validShippingKeys = [
      'shipping_first_name',
      'shipping_last_name',
      'shipping_company',
      'shipping_address1',
      'address2',
      'shipping_city',
      'shipping_state',
      'shipping_zip',
      'shipping_country',
      'shipping_email'
    ]

    for (let key in shippingInformation) {
      if (!validShippingKeys.includes(key)) {
        throw new Error(`Invalid key provided in shippingInformation. '${key}'
            is not a valid shipping parameter.`)
      }
    }

    this.shipping = shippingInformation
  }

  doSale(amount, ccNum, ccExp, cvv) {
    let requestOptions = {
      type: 'capture',
      transactionid: '5895723005',
      amount: amount,
      ccnumber: ccNum,
      ccexp: ccExp,
      cvv: cvv
    }

    // Merge together all request options into one object
    Object.assign(requestOptions, this.billing, this.shipping)

    // Make request
    this._doRequest(requestOptions)
  }

  addCustomer() {
    let requestOptions = {
      customer_vault: 'add_customer',
      // customer_vault: 'delete_customer',
      // customer_vault_id: '849049564',
      security_key: 'm97mZ4qy3bJ55H4d7sMtdzU8TWVk7R9p',
      ccnumber: '4111111111111111',
      ccexp: '1221'
    }
    // Merge together all request options into one object
    Object.assign(requestOptions)

    // Make request
    this._doRequest(requestOptions)
  }
  _doRequest(postData) {
    const hostName = 'secure.nmi.com'
    const path = '/api/transact.php'

    postData.security_key = this.security_key
    postData = querystring.stringify(postData)

    const options = {
      hostname: hostName,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    // Make request to Direct Post API
    const req = https.request(options, (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)

      response.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`)
      })
      response.on('end', () => {
        console.log('No more data in response.')
      })
    })

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`)
    })

    // Write post data to request body
    req.write(postData)
    req.end()
  }
}

const dp = new DirectPost('m97mZ4qy3bJ55H4d7sMtdzU8TWVk7R9p')
const billingInfo = {
  first_name: 'Zahra',
  last_name: 'Namazi',
  address1: '258 Main St',
  city: 'SHiraz',
  state: 'Fars',
  zip: '12345'
}
const shippingInfo = {
  shipping_first_name: 'ZAHRA',
  shipping_last_name: 'NAMAZI',
  shipping_address1: '256 State St',
  shipping_city: 'Los Angeles',
  shipping_state: 'CA',
  shipping_zip: '98765'
}

dp.setBilling(billingInfo)
dp.setShipping(shippingInfo)
// Set dummy data for sale
dp.doSale('100.00', '4111111111111111', '1221', '123')
dp.addCustomer()
