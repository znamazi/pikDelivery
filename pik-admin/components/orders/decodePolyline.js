const Polyline = require('@mapbox/polyline')
/**
 *
 * @param encodedPolyline direction.routes[0].overview_polyline.points
 * @returns {*}
 */

module.exports = function (encodedPolyline) {
  let points = Polyline.decode(encodedPolyline)
  return points.map((point, index) => {
    return {
      lat: point[0],
      lng: point[1]
    }
  })
}
