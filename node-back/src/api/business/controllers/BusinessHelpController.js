const FaqCategories = require('../../../models/FaqCategories')
const Faq = require('../../../models/Faq')
const { userError, Codes } = require('../../../messages/userMessages')

module.exports.list = async (req, res, next) => {
  try {
    const categories = await FaqCategories.find({
      type: 'Business',
      published: true
    })
    res.send({
      success: true,
      categories
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}

module.exports.listFaqs = async (req, res, next) => {
  try {
    const categoryID = req.params.id
    const faqs = await Faq.find({
      type: 'Business',
      published: true,
      category: categoryID
    }).populate('category')
    res.send({
      success: true,
      faqs
    })
  } catch (error) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
}
