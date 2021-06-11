const Group = require('../../../models/PricingGroup')
const Banner = require('../../../models/Banner')
const Settings = require('../../../models/Settings')
const { pick, assign } = require('lodash')
const {
  caseInsensitive,
  ascDeskToNumber,
  paginateAggregate
} = require('../../../utils/queryUtils')
const { userError, Codes } = require('../../../messages/userMessages')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.retrieveFee = async (req, res, next) => {
  try {
    let fee = await Settings.findOne({ key: 'Fee&Others' })

    res.send({
      success: true,
      fee
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
module.exports.feeCreate = async (req, res, next) => {
  try {
    const data = { key: 'Fee&Others', value: req.body }

    Settings.update({ key: 'Fee&Others' }, data, { upsert: true })
      .then((fee) => {
        res.send({
          success: true,
          fee
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.ERROR_GROUP_CREATE_FAIL)
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

module.exports.groupList = function (req, res, next) {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  let filterMatch = Object.keys(filter).reduce((acc, key) => {
    if (key === 'query') {
      acc['$or'] = [{ title: caseInsensitive(filter[key]) }]
    } else {
      if (!!filter[key]) acc[key] = caseInsensitive(filter[key])
    }
    return acc
  }, {})

  let aggregate = [{ $match: filterMatch }]
  if (sortField) {
    let sorting = { [sortField]: ascDeskToNumber(sortOrder) }
    aggregate.push({ $sort: sorting })
  }

  paginateAggregate(Group, aggregate, pageNumber, pageSize)
    .then(({ data, totalCount }) => {
      res.send({
        success: true,
        groups: data,
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

module.exports.groupCreate = async (req, res, next) => {
  try {
    let groupData = pick(req.body, [
      'active',
      'credit',
      'title',
      'kmPrice',
      'cancelFee',
      'pikCommission',
      'prices',
      'returnFee'
    ])
    let existGroup = await Group.findOne({
      title: { $regex: new RegExp('^' + req.body.title + '$', 'i') }
    })
    if (existGroup) {
      throw userError(Codes.ERROR_GROUP_CREATE_FAIL_DOUPLICATE_TITLE)
    }
    Group.create(groupData)
      .then((group) => {
        res.send({
          success: true,
          group
        })
      })
      .catch((error) => {
        res.send({
          success: false,
          ...userError(Codes.ERROR_GROUP_CREATE_FAIL)
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

module.exports.retrieve = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_GROUP_NOT_FOUND)
    }
    let group = await Group.findById(id)
    if (!group) {
      throw userError(Codes.ERROR_GROUP_NOT_FOUND)
    }
    res.send({
      success: true,
      group
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.update = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body)

    const allowedUpdate = [
      'active',
      'credit',
      'title',
      'kmPrice',
      'cancelFee',
      'pikCommission',
      'prices',
      'returnFee'
    ]
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )

    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    const group = await Group.findOne({ _id: req.params.id })
    if (!group) {
      throw userError(Codes.ERROR_GROUP_NOT_FOUND)
    }
    let existGroup = await Group.findOne({
      title: { $regex: new RegExp('^' + req.body.title + '$', 'i') },
      _id: { $ne: req.params.id }
    })
    console.log(existGroup, req.params.id)
    if (existGroup) {
      throw userError(Codes.ERROR_GROUP_CREATE_FAIL_DOUPLICATE_TITLE)
    }
    updates.forEach((update) => (group[update] = req.body[update]))
    await group.save()

    res.send({
      success: true,
      group
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_GROUP_NOT_FOUND)
    }
    let group = await Group.findById(id)
    if (!group) {
      throw userError(Codes.ERROR_GROUP_NOT_FOUND)
    }
    if (group.title === 'Standard') {
      throw userError(Codes.ERROR_NOT_PERMISSION)
    }
    await group.remove()
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

module.exports.bannerList = async (req, res, next) => {
  let {
    filter = {},
    sortOrder,
    sortField,
    pageNumber = 0,
    pageSize = 10
  } = req.body
  let filterMatch = Object.keys(filter).reduce((acc, key) => {
    if (key === 'query') {
      acc['$or'] = [
        { title: caseInsensitive(filter[key]) }
        // { 'uploadedBy.name': caseInsensitive(filter[key]) }
      ]
    } else {
      if (!!filter[key]) acc[key] = filter[key] == 'true'
    }
    return acc
  }, {})
  let options = {
    skip: pageNumber * pageSize,
    limit: pageSize
  }
  if (sortField) {
    let sort = { [sortField]: ascDeskToNumber(sortOrder) }
    options = { ...options, sort }
  }
  const banners = await Banner.find(filterMatch, {}, options).populate(
    'uploadedBy',
    'name username email'
  )
  const totalCount = await Banner.find(filterMatch).count()
  if (!banners) {
    res.send({
      success: false,
      ...userError(Codes.SERVER_SIDE_ERROR)
    })
  }
  res.send({
    success: true,
    banners,
    totalCount
  })
}

module.exports.bannerCreate = async (req, res, next) => {
  try {
    let bannerData = {
      file: req.file.location,
      title: req.body.title,
      expiration: req.body.expiration,
      published: req.body.published === 'true',
      uploadedBy: req.locals.user.id
    }

    const banner = await Banner.create(bannerData)
    res.send({
      success: true,
      banner
    })
  } catch (error) {
    console.log(error)

    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.bannerDelete = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }

    let banner = await Banner.findById(id)
    if (!banner) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }
    await banner.remove()
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

module.exports.bannerUpdate = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdate = [
      'title',
      'file',
      'expiration',
      'published',
      'filename'
    ]
    const isValidOpertion = updates.every((update) =>
      allowedUpdate.includes(update)
    )

    if (!isValidOpertion) {
      throw userError(Codes.ERROR_INVALID_UPDATE)
    }

    let id = req.params.id
    if (!ObjectId.isValid(id) || !id) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }

    let banner = await Banner.findById(id)
    if (!banner) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }
    updates.forEach((update) => (banner[update] = req.body[update]))
    banner.file = req.file ? req.file.location : req.body.file
    banner.uploadedBy = req.locals.user.id
    await banner.save()

    res.send({
      success: true,
      banner
    })
  } catch (error) {
    console.log(error)
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}

module.exports.bannerRetrieve = async (req, res, next) => {
  try {
    let id = req.params.id
    if (!ObjectId.isValid(id)) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }
    let banner = await Banner.findById(id)
    if (!banner) {
      throw userError(Codes.ERROR_BANNER_NOT_FOUND)
    }
    res.send({
      success: true,
      banner
    })
  } catch (error) {
    res.send({
      success: false,
      errorCode: error.errorCode,
      message: error.message
    })
  }
}
