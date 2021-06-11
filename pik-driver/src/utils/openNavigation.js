import { Linking, Platform } from 'react-native'

const isValidLatLng = (num, range) => typeof num === 'number' && num <= range && num >= -1 * range

const isValidCoordinates = coords =>
    isValidLatLng(coords.latitude, 90) && isValidLatLng(coords.longitude, 180)

const getParams = (params = []) => {
    return params
        .map(({ key, value }) => {
            const encodedKey = encodeURIComponent(key)
            const encodedValue = encodeURIComponent(value)
            // return `${encodedKey}=${encodedValue}`
            return `${key}=${value}`
        })
        .join('&')
}

const getWaypoints = (waypoints = []) => {
    if (waypoints.length === 0) {
        return ''
    }

    const params = waypoints
        .map(value => `${value.latitude},${value.longitude}`)
        .join('|')

    return `&waypoints=${params}`
}

function openNavigation ({ origin, destination, params = [], waypoints = [] } = {}) {
    if (origin && isValidCoordinates(origin)) {
        params.push({
            key: 'saddr',
            value: `${origin.latitude},${origin.longitude}`
        })
    }
    if (destination && isValidCoordinates(destination)) {
        params.push({
            key: 'daddr',
            value: `${destination.latitude},${destination.longitude}`
        })
    }

    let url = `https://maps.google.com/maps/?${getParams(
        params
    )}${getWaypoints(waypoints)}`

    return Linking.canOpenURL(url).then(supported => {
        if (!supported) {
            return Promise.reject(new Error(`Could not open the url: ${url}`))
        } else {
            return Linking.openURL(url)
        }
    })
}

export default openNavigation
