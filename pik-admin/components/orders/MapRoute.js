import React, { useEffect, useState, useMemo } from 'react'
import {
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
  Marker,
  Polyline
} from 'react-google-maps'
import VehicleTypes from '../../../node-back/src/constants/VehicleTypes'
import axios from '../../utils/axios'
import decodePolyline from './decodePolyline'

const MapRoute = ({ order, toggle }) => {
  const [driverLocation, setDriverLocation] = useState()
  const [direction, setDirection] = useState()
  let defaultCenter = useMemo(() => {
    let { northeast: ne, southwest: sw } = order.direction.routes[0].bounds
    return {
      lat: (ne.lat + sw.lat) / 2,
      lng: (ne.lng + sw.lng) / 2
    }
  }, [])
  let polyline = useMemo(() => {
    if (!direction?.routes) return null
    return decodePolyline(direction.routes[0].overview_polyline.points)
  }, [direction])

  useEffect(() => {
    if (toggle && order.driver) {
      axios
        .get(`admin/order/order-track/${order.driver._id}/${order._id}`)
        .then(({ data }) => {
          if (data.success) {
            setDriverLocation({
              lat: data.geoLocation.coords.latitude,
              lng: data.geoLocation.coords.longitude
            })
            setDirection(data.direction)
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            toast.error(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
      const interval = setInterval(() => {
        axios
          .get(`admin/order/order-track/${order.driver._id}/${order._id}`)
          .then(({ data }) => {
            if (data.success) {
              setDriverLocation({
                lat: data.geoLocation.coords.latitude,
                lng: data.geoLocation.coords.longitude
              })
              setDirection(data.direction)
            } else {
              const errorMessage = data.errorCode
                ? t(`server_errors.${data.errorCode}`)
                : data.message
              toast.error(errorMessage)
            }
          })
          .catch((error) => {
            const errorMessage = error?.response?.data?.errorCode
              ? t(`server_errors.${error?.response?.data?.errorCode}`)
              : error?.response?.data?.message
            toast.error(errorMessage)
          })
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [toggle])
  const GoogleMapRender = withGoogleMap((props) => {
    return (
      <GoogleMap
        defaultZoom={props.defaultZoom}
        defaultCenter={props.defaultCenter}
        options={{ fullscreenControl: false }}
      >
        {/*for creating path with the updated coordinates*/}
        <Marker
          position={props.origin}
          icon={{
            url: '/assets/media/svg/map-marker-home.svg'
          }}
        />
        <Marker
          position={props.destination}
          icon={{
            url: '/assets/media/svg/map-marker-destination.svg'
          }}
        />

        <Polyline
          path={props.polyline}
          geodesic={true}
          options={{
            strokeColor: '#000000',
            strokeOpacity: 0.75,
            strokeWeight: 4
          }}
        />
        <Marker
          position={props.driverLocation}
          icon={{
            url: `/assets/media/svg/${props.vehicleTypes}.svg`,
            scaledSize: new google.maps.Size(30, 30)
          }}
        />
      </GoogleMap>
    )
  })

  return (
    <div>
      <GoogleMapRender
        containerElement={<div style={{ height: `500px`, width: '600px' }} />}
        mapElement={<div style={{ height: `100%` }} />}
        polyline={polyline}
        defaultCenter={defaultCenter}
        defaultZoom={13}
        driverLocation={driverLocation}
        origin={{
          lat: parseFloat(order.pickup.address.geometry.location.lat),
          lng: parseFloat(order.pickup.address.geometry.location.lng)
        }}
        destination={{
          lat: parseFloat(order.delivery.address.geometry.location.lat),
          lng: parseFloat(order.delivery.address.geometry.location.lng)
        }}
        vehicleTypes={order.driver?.vehicle.type}
      />
    </div>
  )
}

export default MapRoute
