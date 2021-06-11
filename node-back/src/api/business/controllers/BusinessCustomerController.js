const RelatedEmail = require('../../../models/RelatedEmail')
const { pick, assign } = require('lodash')
const { userError, Codes } = require('../../../messages/userMessages')

module.exports.createRelatedEmail = async (req, res, next) => {
  try {
    let data = pick(req.body, ['business', 'customer', 'emails'])
    const exist = await RelatedEmail.findOne({
      business: data.business,
      customer: data.customer
    })
    if (!exist) {
      RelatedEmail.create(data)
        .then((relatedEmail) => {
          res.send({
            success: true,
            relatedEmail
          })
        })
        .catch((error) => {
          res.send({
            success: false,
            ...userError(Codes.SERVER_SIDE_ERROR)
          })
        })
    } else {
      assign(exist, req.body)
      await exist.save()
      res.send({
        success: true
      })
    }
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.listRelatedEmail = (req, res, next) => {
  const { business, customer } = req.body
  RelatedEmail.findOne({ business, customer })
    .then((relatedEmails) => {
      res.send({
        success: true,
        relatedEmails
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}
