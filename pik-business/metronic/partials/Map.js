import React, { useState } from 'react'
import GoogleMapReact from 'google-map-react'
import LocationPin from './LocationPin'
import Loading from '../../components/partials/Loading'

const Map = ({ location, zoomLevel, onMapClick, onChangeMap, loading }) => {
  return (
    <div className="mt-3 mb-3 pin-container">
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_API }}
        center={{ ...location }}
        // defaultCenter={{ ...location }}
        zoom={zoomLevel}
        onClick={onMapClick}
        onChange={(data) => onChangeMap(data)}
        options={{ fullscreenControl: false }}
      ></GoogleMapReact>
      <LocationPin />
      {loading && <Loading />}
    </div>
  )
}

export default Map
