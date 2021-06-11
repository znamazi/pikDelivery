module.exports.caseInsensitive = (str) => {
  return new RegExp(['^', str].join(''), 'i')
}

module.exports.caseInsensitiveContain = (str) => {
  return new RegExp([str].join(''), 'i')
}
module.exports.ascDeskToNumber = (str, defaultValue = -1) => {
  switch (str.toLowerCase()) {
    case 'asc':
      return 1
    case 'desc':
      return -1
    default:
      return defaultValue
  }
}

module.exports.paginateAggregate = (Model, aggregate, pageNumber, pageSize) => {
  return Model.aggregate([
    {
      $facet: {
        totalData: [
          ...aggregate,
          { $skip: pageNumber * pageSize },
          { $limit: pageSize }
        ],
        totalCount: [...aggregate, { $count: 'count' }]
      }
    }
  ]).then((result) => {
    let { totalData, totalCount } = result[0]
    return {
      data: totalData,
      totalCount: totalCount[0] ? totalCount[0].count : 0
    }
  })
}
