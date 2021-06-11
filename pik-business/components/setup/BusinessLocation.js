import React, { useState, useEffect } from 'react'
import { Typography } from '@material-ui/core'
import AsyncSelect from 'react-select/async'
import Geocode from 'react-geocode'
import Map from '../../metronic/partials/Map'
import { useSetupState } from './context'
import axios from 'utils/axios'
import { useTranslation } from 'react-i18next'
import Loading from '../partials/Loading'
import { components } from 'react-select'

const Input = ({ autoComplete, ...props }) => (
  <components.Input {...props} autoComplete="new-password" />
)

const BusinessLocation = (props) => {
  const { state, dispatch } = useSetupState()
  const { t } = useTranslation()

  const [search, setSearch] = useState(false)
  const [searchedAddress, setSearchedAddress] = useState('')
  const [locationOptions, setLocationOptions] = useState([])
  const [defaultLocation, setDefaultLocation] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (state.location.coordinates.length === 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          getAddress(latitude, longitude)
        },
        (error) => {
          setDefaultLocation({ lat: 8.7298603, lng: -80.3312981 })
        }
      )
    }
  }, [state.location.coordinates])

  useEffect(() => {
    setupGeocode()
  }, [])

  const setupGeocode = () => {
    Geocode.setApiKey(process.env.NEXT_PUBLIC_GOOGLE_API)

    // set response language. Defaults to english.
    Geocode.setLanguage('en')

    // set response region. Its optional.
    // A Geocoding request with region=es (Spain) will return the Spanish city.
    Geocode.setRegion('es')

    // Enable or disable logs. Its optional.
    Geocode.enableDebug()
  }

  const handleGocodeAddress = (data) => {
    if (data) {
      setSearchedAddress(data)
      setSearch(false)
      setTimeout(() => setSearch(true), 2000)
    }
  }

  useEffect(() => {
    if (search) loadOptionsSearchMap()
  }, [search])

  const loadOptionsSearchMap = async () => {
    try {
      let response = await axios.get(
        `geo/autocomplete?query=${searchedAddress}`
      )

      response = response.data
      if (response) {
        let locationOptions = response.predictions.map((item) => ({
          value: item.description,
          label: item.description
        }))

        setLocationOptions(locationOptions)
        return locationOptions
      }
    } catch (error) {
      console.log('error happend', error)
    }
  }

  const getAddress = async (latitude, longitude) => {
    try {
      // Get address from latidude & longitude.
      let response = await Geocode.fromLatLng(latitude, longitude)

      let address = response.results[0]
      address = {
        ...address,
        geometry: {
          ...address.geometry,
          location: {
            lat: latitude,
            lng: longitude
          }
        }
      }
      setDefaultLocation()
      dispatch({
        type: 'UPDATE_LOCATION',
        payload: {
          address,
          location: {
            ...state.location,
            type: 'Point',
            coordinates: [latitude, longitude]
          }
        }
      })
      setLoading(false)
    } catch (error) {
      console.log('Error happend in Get Address: ', error)
    }
  }

  const selectAddress = async (selectedAddress) => {
    if (selectedAddress) {
      setLoading(true)
      let response = await axios.get(
        `/geo/search?query=${selectedAddress.value}`
      )
      console.log({ response: response.data })
      response = response.data
      const { lat, lng } = response.results[0].geometry.location
      getAddress(lat, lng)
    } else {
      dispatch({
        type: 'UPDATE_LOCATION',
        payload: {
          address: '',
          location: {
            ...state.location
          }
        }
      })
    }
  }

  const onMapClick = (data) => {
    getAddress(data.lat, data.lng)
  }
  const onChangeMap = (data) => {
    getAddress(data.center.lat, data.center.lng)
  }

  return (
    <>
      <Typography>{t('pages.setup.business_location')}</Typography>
      <AsyncSelect
        cacheOptions
        isClearable
        value={
          state.address
            ? {
                value: {
                  lat: state.location.coordinates[0],
                  lng: state.location.coordinates[1]
                },
                label: state.address.formatted_address
              }
            : ''
        }
        components={{ Input }}
        loadOptions={loadOptionsSearchMap}
        defaultOptions={locationOptions}
        onInputChange={handleGocodeAddress}
        onChange={(e) => selectAddress(e)}
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => {
            const { zIndex, ...rest } = base
            return { ...rest, zIndex: 9999 }
          }
        }}
      />
      <Typography>{t('pages.setup.location_desc')}</Typography>
      <Map
        location={{
          lat: defaultLocation
            ? defaultLocation.lat
            : state.location.coordinates[0],
          lng: defaultLocation
            ? defaultLocation.lng
            : state.location.coordinates[1]
        }}
        zoomLevel={defaultLocation ? 7 : 17}
        onMapClick={(data) => onMapClick(data)}
        onChangeMap={(data) => onChangeMap(data)}
        loading={loading}
      />
    </>
  )
}

export default BusinessLocation
