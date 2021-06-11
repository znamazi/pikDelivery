const GoogleApi = require('../../utils/googleApi')

module.exports.coding = function (req, res, next) {
  let {query, latlng} = req.query;
  if(!query && !latlng){
    return res.send({
      success: false,
      message: "missing query params"
    })
  }

  GoogleApi.geocoding(query || latlng)
    .then(result => {
      res.send({
        success: true,
        ...result
      })
    })
    .catch(error => {
      res.send({
        success: false,
        error: error.message || "Server side error"
      })
    })
}

module.exports.search = function (req, res, next) {
  let {query} = req.query;
  if(!query){
    return res.send({
      success: false,
      message: "missing query params"
    })
  }

  GoogleApi.search(query)
    .then(result => {
      res.send({
        success: true,
        ...result
      })
    })
    .catch(error => {
      res.send({
        success: false,
        error: error.message || "Server side error"
      })
    })
}

module.exports.autoComplete = function (req, res, next) {
  let {query} = req.query;
  if(!query){
    return res.send({
      success: false,
      message: "missing query params"
    })
  }

  GoogleApi.autoComplete(query)
    .then(result => {
      res.send({
        success: true,
        ...result
      })
    })
    .catch(error => {
      res.send({
        success: false,
        error: error.message || "Server side error"
      })
    })
}

module.exports.direction = function (req, res, next) {
  let {origin, destination} = req.query;
  if(!origin || !destination){
    return res.send({
      success: false,
      message: "missing query params"
    })
  }

  GoogleApi.directions(origin, destination)
    .then(result => {
      res.send({
        success: true,
        ...result
      })
    })
    .catch(error => {
      res.send({
        success: false,
        error: error.message || "Server side error"
      })
    })
}
