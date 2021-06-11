const PricingGroup = require('../models/PricingGroup');
const Settings = require('../models/Settings');
const { userError, Codes } = require('../messages/userMessages')

function calcTax(itbms, priceItems){
  let subTotal = priceItems.reduce((sum, value) => (sum + value), 0)
  itbms = (!itbms || isNaN(itbms)) ? 0.07 : parseFloat(itbms)
  return correctPrice(itbms * subTotal);
}

function correctPrice(price){
  return Math.floor(parseFloat(price) * 100) / 100;
}

function getOrderPrice (pricingGroupTitle, vehicleType, distance) {
  return Promise.all([
    PricingGroup.findOne({title: pricingGroupTitle}),
    Settings.get('Fee&Others')
  ])
    .then(([pricingGroup, feesAndOthers]) => {
      if(!pricingGroup)
        throw userError(Codes.ERROR_PRICING_GROUP_IS_INVALID)

      let vehiclePrice = pricingGroup.prices[vehicleType];
      let price = {
        vehicleType: correctPrice(vehiclePrice.basePrice),
        distance: correctPrice(parseFloat(vehiclePrice.kmPrice) * parseFloat(distance)),
      }
      let tax = calcTax(feesAndOthers ? feesAndOthers.itbms : null, Object.values(price))
      price.tax = tax
      // Calculate total price
      price.total = correctPrice(Object.keys(price).reduce((sum, key) => (sum + price[key]), 0));
      price.cancelFee = correctPrice(price.total * pricingGroup.cancelFee);
      price.returnFee = correctPrice(price.total * pricingGroup.returnFee);
      price.deliveryFee = correctPrice(price.total * pricingGroup.pikCommission);
      // coverage will fill by business coverage fee
      price.businessCoverage = 0;

      return price;
    })
}

module.exports.getCustomerOrderPrice = function (vehicleType, distance) {
  return getOrderPrice('Standard', vehicleType, distance);
}

module.exports.getBusinessOrderPrice = function (business, vehicleType, distance) {
  return getOrderPrice(business.group || 'Standard', vehicleType, distance)
    .then(price => {
      if(business.coverageEnabled) {
        price.businessCoverage = correctPrice(business.coverageMaxValue)
        price.total = correctPrice(Math.max(price.total - business.coverageMaxValue, 0))
      }
      return price
    })
}

module.exports.getOrderPrice = getOrderPrice;
