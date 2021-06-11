const https = require('https')
const querystring = require('querystring')
var ParseStringXml = require('xml2js').parseString

const SECURITY_KEY = process.env.NMI_SECURITY_KEY

const ResponseTypes = {
  xml: 'text/xml;charset=utf-8',
  text: 'text/plain;charset=utf-8'
}

const _doRequest = (path, postData) => {
  const hostName = 'secure.nmi.com'

  postData.security_key = SECURITY_KEY
  postData = querystring.stringify(postData)

  const options = {
    hostname: hostName,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      Accept: 'application/json'
    }
  }

  return new Promise(function (resolve, reject) {
    // Make request to Direct Post API
    let completeResponse = ''
    const req = https.request(options, (response) => {
      // console.log(`STATUS: ${response.statusCode}`)
      // console.log(`HEADERS: ${JSON.stringify(response.headers)}`)

      response.on('data', (chunk) => {
        completeResponse += chunk
        // console.log(`BODY: ${chunk}`)
      })
      response.on('end', () => {
        parseResponse({
          type: response.headers['content-type'],
          body: completeResponse
        })
          .then(resolve)
          .catch(reject)
        // ParseStringXml(completeResponse, { explicitArray : false, ignoreAttrs : true }, function (error, result) {
        //   if(error)
        //     return reject(error)
        //   resolve(result)
        // })
        // resolve(completeResponse)
      })
    })

    req.on('error', (e) => {
      // console.error(`Problem with request:`, error)
      reject(e)
    })

    // Write post data to request body
    req.write(postData)
    req.end()
  })
}

const parseResponse = (response) => {
  return new Promise(function (resolve, reject) {
    if (response.type === ResponseTypes.text) {
      resolve(querystring.parse(response.body))
    } else if (response.type === ResponseTypes.xml) {
      ParseStringXml(
        response.body,
        { explicitArray: false, ignoreAttrs: true },
        function (error, result) {
          if (error) return reject(error)
          resolve(result)
        }
      )
    }
  })
}

const doQuery = (postData) => _doRequest('/api/query.php', postData)
const doTransact = (postData) => _doRequest('/api/transact.php', postData)

module.exports.addCustomer = (email, first_name, last_name, cc_number, cc_exp, cvv) => {
  const billingInfo = {
    first_name,
    last_name,
    email
  }

  let addResponse;
  return doTransact({
    customer_vault: 'add_customer',
    ccnumber: cc_number,
    ccexp: cc_exp,
    cvv,
    type: 'auth',
    amount: 1.0,
    ...billingInfo
  })
    .then(response => {
      addResponse = response
      console.log('add response', JSON.stringify(response))
      if(response.error || response.declined || !response.transactionid)
        throw {message: response.responsetext}
      return doTransact({
        transactionid: response.transactionid,
        type: 'void',
      })
    })
    .then(res => {
      let {response, responsetext} = res;
      return {
        ...addResponse,
        response,
        responsetext
      }
    })
    // .then(response => {
    //   console.log('cancel response', JSON.stringify(response))
    //   return response
    // })
}

module.exports.deleteCustomer = (customer_vault_id) => {
  return doTransact({
    customer_vault: 'delete_customer',
    customer_vault_id,
  })
    .then(response => {
      // console.log('delete customer response', JSON.stringify(response))
      return response
    })
}

module.exports.getCustomerList = () => {
  return doQuery({
    report_type: 'customer_vault'
  }).then((res) => {
    if (
      res &&
      res.nm_response &&
      res.nm_response.customer_vault &&
      res.nm_response.customer_vault.customer
    ) {
      let customers = res.nm_response.customer_vault.customer
      if (!Array.isArray(customers)) customers = [customers]
      return customers
    }
  })
}

module.exports.getCustomerInfo = (email) => {
  return doQuery({
    report_type: 'customer_vault',
    email: email
  }).then((res) => {
    if (
      res &&
      res.nm_response &&
      res.nm_response.customer_vault &&
      res.nm_response.customer_vault.customer
    ) {
      let customers = res.nm_response.customer_vault.customer
      if (!Array.isArray(customers)) customers = [customers]
      return customers
    }
  })
}

module.exports.getCustomerInfoById = (customer_vault_id) => {
  return doQuery({
    report_type: 'customer_vault',
    customer_vault_id: customer_vault_id
  }).then((res) => {
    if (
      res &&
      res.nm_response &&
      res.nm_response.customer_vault &&
      res.nm_response.customer_vault.customer
    ) {
      let customers = res.nm_response.customer_vault.customer
      if (!Array.isArray(customers)) customers = [customers]
      return customers
    }
  })
}

module.exports.auth = (customer_vault_id, amount, params={}) => {
  amount = parseFloat(amount)
  return doTransact({
    type: 'auth',
    customer_vault_id,
    amount,
    ...params
  }).then((res) => {
    // if(!res.response != '1' || !res.transactionid)
    //   throw {message: res.responsetext}
    return res;
  })
}

module.exports.capture = (transactionId, amount) => {
  amount = parseFloat(amount)
  return doTransact({
    type: 'capture',
    transactionid: transactionId,
    amount
  }).then((res) => {
    // if(!res.response != '1')
    //   throw {message: res.responsetext}
    return res;
  })
}

module.exports.void = (transactionId) => {
  return doTransact({
    type: 'void',
    transactionid: transactionId,
    reason: 'user_cancel',
    payment: 'creditcard',
  }).then((res) => {
    // if(!res.response != '1')
    //   throw {message: res.responsetext}
    return res;
  })
}

/**
 *
 * @param customer_vault_id
 * @param amount
 * @param params  {
 *   orderId,
 *   description
 * }
 * @returns {Promise<T | never>}
 */

module.exports.chargeCustomer = (customer_vault_id, amount) => {
  amount = parseFloat(amount)

  let trx = {
    customer_vault_id,
    amount
  }

  return doTransact(trx).then((res) => {
    return res;
  })
}

module.exports.chargeBusinessCoverage = (customer_vault_id, amount, orderId) => {
  amount = parseFloat(amount)

  let trx = {
    customer_vault_id,
    amount,
    orderid: orderId,
    orderdescription: 'Order coverage fee'
  }

  return doTransact(trx).then((res) => {
    return res;
  })
}
