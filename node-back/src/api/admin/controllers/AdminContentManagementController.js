const PageContent = require('../../../models/PageContent')
const FaqCategories = require('../../../models/FaqCategories')
const Faq = require('../../../models/Faq')
const mongo = require('mongodb')
const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId
const { pick, assign } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')

module.exports.uploadImage = async (req, res, next) => {
  res.send({ location: req.file.location })
}

module.exports.listPage = async (req, res, next) => {
  const pages = await PageContent.find({})
  res.send({
    success: true,
    pages
  })
}

module.exports.createPage = async (req, res, next) => {
  try {
    let page = pick(req.body, ['title', 'content'])
    let existPage = await PageContent.findOne({
      title: { $regex: new RegExp('^' + req.body.title + '$', 'i') }
    })
    if (existPage) {
      throw userError(Codes.ERROR_PAGE_CREATE_FAIL_DOUPLICATE_TITLE)
    }
    PageContent.create(page)
      .then((data) => {
        res.send({
          success: true,
          page: data
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.ERROR_PAGE_CREATE_FAIL)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.deletePage = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }
    let page = await PageContent.findById(id)
    if (!page) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }
    await page.remove()
    res.send({
      success: true
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.updatePage = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }
    let page = await PageContent.findById(id)

    if (!page) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }

    let existPage = await PageContent.findOne({
      title: { $regex: new RegExp('^' + req.body.title + '$', 'i') },
      _id: { $ne: id }
    })
    if (existPage) {
      throw userError(Codes.ERROR_PAGE_CREATE_FAIL_DOUPLICATE_TITLE)
    }
    assign(page, req.body)
    await page.save()
    res.send({
      success: true,
      id
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.retrievePage = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }
    let content = await PageContent.findById(id)
    if (!content) {
      throw userError(Codes.ERROR_PAGE_NOT_FOUND)
    }
    res.send({
      success: true,
      content
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

// Faq Categories
module.exports.listFaqCat = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body

  let filterMatch = { category: caseInsensitive(filter['query']) }
  if (filter['published']) {
    let published = filter['published'] === 'true'
    filterMatch = { ...filterMatch, published }
  }

  let aggregate = [{ $match: filterMatch }]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(FaqCategories, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        faqCategories: data,
        totalCount
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.createFaqCat = async (req, res, next) => {
  try {
    let existFaqCat = await FaqCategories.findOne({
      category: { $regex: new RegExp('^' + req.body.category + '$', 'i') },
      type: req.body.type
    })
    if (existFaqCat) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_CREATE_FAIL_DOUPLICATE_ITEM)
    }
    let category = pick(req.body, ['category', 'published', 'type'])
    FaqCategories.create(category)
      .then((data) => {
        res.send({
          success: true,
          category: data
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.ERROR_FAQ_CATEGORY_CREATE_FAIL)
        })
      })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.deleteFaqCat = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    const faqCategories = await FaqCategories.findById(id)
    if (!faqCategories) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    const faqs = await Faq.findOne({ category: id })
    if (faqs) {
      throw userError(Codes.ERROR_CAN_NOT_REMOVE_FAQ_CATEGORY_WITH_CHILD)
    }
    await faqCategories.remove()
    res.send({
      success: true,
      id
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.updateFaqCat = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    let faqCategories = await FaqCategories.findById(id)
    if (!faqCategories) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    let existFaqCat = await FaqCategories.findOne({
      category: { $regex: new RegExp('^' + req.body.category + '$', 'i') },
      type: req.body.type,
      _id: { $ne: id }
    })
    if (existFaqCat) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_CREATE_FAIL_DOUPLICATE_ITEM)
    }
    assign(faqCategories, req.body)
    await faqCategories.save()
    res.send({
      success: true,
      id
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.retrieveFaqCat = async (req, res, next) => {
  try {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    let faqCategories = await FaqCategories.findById(id)

    if (!faqCategories) {
      throw userError(Codes.ERROR_FAQ_CATEGORY_NOT_FOUND)
    }
    res.send({
      success: true,
      faqCategories
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

// Faq
module.exports.listFaq = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  let filterOfFields = pick(filter, ['query', 'type'])
  let filterMatch = Object.keys(filterOfFields).reduce((acc, key) => {
    if (key === 'query') {
      if (filterOfFields[key]) {
        acc['$or'] = [
          { question: caseInsensitive(filterOfFields[key]) },
          { type: caseInsensitive(filterOfFields[key]) }
        ]
      }
    } else {
      if (!!filterOfFields[key]) acc[key] = caseInsensitive(filterOfFields[key])
    }
    return acc
  }, {})

  if (filter['published']) {
    let published = filter['published'] === 'true'
    filterMatch = { ...filterMatch, published }
  }
  if (filter['category']) {
    filterMatch = {
      ...filterMatch,
      category: mongo.ObjectID(filter['category'])
    }
  }
  let aggregate = [
    { $match: filterMatch },
    {
      $lookup: {
        from: 'faq-categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $addFields: {
        categoryInfo: {
          $arrayElemAt: ['$categoryInfo', 0]
        }
      }
    }
  ]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(Faq, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        faqs: data,
        totalCount
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.SERVER_SIDE_ERROR)
      })
    })
}

module.exports.createFaq = (req, res, next) => {
  let faq = pick(req.body, [
    'question',
    'answer',
    'type',
    'category',
    'published'
  ])
  Faq.create(faq)
    .then((data) => {
      res.send({
        success: true,
        faq: data
      })
    })
    .catch((error) => {
      res.send({
        success: false,
        ...userError(Codes.ERROR_FAQ_CREATE_FAIL)
      })
    })
}

module.exports.deleteFaq = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    let faq = await Faq.findById(id)
    if (!faq) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    await faq.remove()
    res.send({
      success: true,
      id
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.updateFaq = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    let faq = await Faq.findById(id)
    if (!faq) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    assign(faq, req.body)
    await faq.save()
    res.send({
      success: true,
      id
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.retrieveFaq = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    let faq = await Faq.findById(id)
    if (!faq) {
      throw userError(Codes.ERROR_FAQ_NOT_FOUND)
    }
    res.send({
      success: true,
      faq
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
