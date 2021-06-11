import React from 'react'
import GoogleMapReact from 'google-map-react'
import LocationPin from './LocationPin'

const Map = ({ location, zoomLevel, onMapClick }) => {
  return (
    <div style={{ height: '50vh', width: '100%' }} className="mt-3 mb-3">
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_API }}
        center={{ ...location }}
        defaultZoom={zoomLevel}
        onClick={onMapClick}
      >
        <LocationPin
          lat={location.lat}
          lng={location.lng}
          text={location.address}
        />
      </GoogleMapReact>
    </div>
  )
}

export default Map
