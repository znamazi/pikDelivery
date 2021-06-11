import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  withScriptjs,
  InfoWindow
} from 'react-google-maps'
import { MarkerClusterer } from 'react-google-maps/lib/components/addons/MarkerClusterer'
import { compose, withProps, withHandlers, withStateHandlers } from 'recompose'
import HeaderContent from '../layouts/HeaderContent'
import SubHeaderContent from '../layouts/SubHeaderContent'
import ButtonSearch from '../../metronic/partials/ButtonSearch'
import { useTranslation } from 'react-i18next'
import axios from '../../utils/axios'
import { escapeRegExp } from '../../utils/utils'

const EagleEye = () => {
  const [onlineDrivers, setOnlineDrivers] = useState([])
  const [driversLocation, setDriversLocation] = useState([])
  const [filter, setFilter] = useState('')
  const [queryDriverSearch, setQueryDriverSearch] = useState('')
  const [info, setInfo] = useState({})
  const refSearchInput = useRef()
  const { t } = useTranslation()
  const [showContent, setShowContent] = useState(true)

  useEffect(() => {
    axios
      .get('admin/eagle/getOnlinedrivers')
      .then(({ data }) => {
        if (data.success) {
          if (data.onlineDrivers.length > 0) {
            const locations = data.onlineDrivers.map((item) => {
              return {
                lat: item.location.coordinates[1],
                lng: item.location.coordinates[0],
                driver: item.driver
              }
            })
            setDriversLocation(locations)
          }

          setOnlineDrivers(data.onlineDrivers)
          setInfo(data.info)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
          setShowContent(false)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
        setShowContent(false)
      })
    const interval = setInterval(() => {
      axios
        .get('admin/eagle/getOnlinedrivers')
        .then(({ data }) => {
          if (data.success) {
            if (data.onlineDrivers.length > 0) {
              const locations = data.onlineDrivers.map((item) => {
                return {
                  lat: item.location.coordinates[1],
                  lng: item.location.coordinates[0],
                  driver: item.driver
                }
              })
              setDriversLocation(locations)
            }
            setOnlineDrivers(data.onlineDrivers)
            setInfo(data.info)
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
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (queryDriverSearch) {
      applyFilter(queryDriverSearch)
    }
    if (filter) {
      driverFilter()
    }
  }, [onlineDrivers])
  useEffect(() => {
    if (filter) driverFilter()
  }, [filter])

  const applyFilter = (querySearch) => {
    let str = escapeRegExp(querySearch)
    const search = new RegExp([str].join(''), 'i')
    const resultFilter = onlineDrivers
      .filter(
        (item) =>
          search.test(item.driver.firstName) ||
          search.test(item.driver.lastName) ||
          search.test(item.driver.mobile)
      )
      .map((item) => {
        return {
          lat: item.location.coordinates[1],
          lng: item.location.coordinates[0],
          driver: item.driver
        }
      })
    setDriversLocation(resultFilter)
  }

  const driverFilter = () => {
    setQueryDriverSearch('')
    refSearchInput.current.value = ''
    switch (filter) {
      case 'all':
        const all = onlineDrivers.map((item) => {
          return {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
            driver: item.driver
          }
        })
        setDriversLocation(all)
        break
      case 'available':
        const availableDriver = info.available.map((item) => {
          return {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
            driver: item.driver
          }
        })
        setDriversLocation(availableDriver)
        break
      case 'pickup':
        const pickup = info.pickup.map((item) => item.driver)
        const pickupDriver = onlineDrivers
          .filter((item) => pickup.includes(item.driver._id))
          .map((item) => {
            return {
              lat: item.location.coordinates[1],
              lng: item.location.coordinates[0],
              driver: item.driver
            }
          })
        setDriversLocation(pickupDriver)
        break
      case 'deliver':
        const deliver = info.deliver.map((item) => item.driver)
        const deliverDriver = onlineDrivers
          .filter((item) => deliver.includes(item.driver._id))
          .map((item) => {
            return {
              lat: item.location.coordinates[1],
              lng: item.location.coordinates[0],
              driver: item.driver
            }
          })
        setDriversLocation(deliverDriver)
        break

      default:
        const allDrivers = onlineDrivers.map((item) => {
          return {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
            driver: item.driver
          }
        })
        setDriversLocation(allDrivers)
        break
    }
  }

  const MapWithAMarkerClusterer = compose(
    withProps({
      googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API}`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: '100%', width: '100%' }} />,
      mapElement: <div style={{ height: `100%` }} />
    }),
    withHandlers({
      onMarkerClustererClick: () => (markerClusterer) => {
        const clickedMarkers = markerClusterer.getMarkers()
        // console.log(`Current clicked markers length: ${clickedMarkers.length}`)
        // console.log(clickedMarkers)
      }
    }),
    withStateHandlers(
      () => ({
        isOpen: false,
        id: ''
      }),
      {
        onToggleOpen: ({ isOpen }) => (id) => ({
          isOpen: !isOpen,
          id
        })
      }
    ),
    withScriptjs,
    withGoogleMap
  )((props) => {
    return (
      <GoogleMap
        defaultZoom={props.defaultZoom}
        defaultCenter={props.defaultCenter}
        options={{ fullscreenControl: false }}
      >
        <MarkerClusterer
          onClick={props.onMarkerClustererClick}
          averageCenter
          enableRetinaIcons
          gridSize={60}
        >
          {props.driversLocation.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              icon={{
                url: `/assets/media/svg/${marker.driver.vehicle.type}.svg`,
                scaledSize: new google.maps.Size(42, 42)
              }}
              onClick={() => props.onToggleOpen(marker.driver._id)}
            >
              {props.isOpen && props.id == marker.driver._id && (
                <InfoWindow
                  onCloseClick={props.onToggleOpen}
                  options={{ closeBoxURL: ``, enableEventPropagation: true }}
                >
                  <div className="d-flex align-items-center" key={index}>
                    <div className="symbol symbol-40 symbol-light-success mr-5">
                      <img
                        alt={`${marker.driver.firstName} ${marker.driver.lastName}`}
                        src={
                          marker.driver.avatar
                            ? marker.driver.avatar
                            : '/assets/media/svg/avatars/026-boy-10.svg'
                        }
                      />
                    </div>
                    <div className="d-flex flex-column flex-grow-1 font-weight-bold">
                      <a className="text-muted font-weight-bold text-hover-primary">
                        <div className="ml-4">
                          <div className="text-dark-75 font-weight-bolder font-size-lg mb-0">
                            {`${marker.driver.firstName} ${marker.driver.lastName}`}
                          </div>
                          <div>{marker.driver.mobile}</div>
                          <div>
                            <a
                              href={`/driver/${marker.driver._id}`}
                              target="_blink"
                            >
                              View Profile
                            </a>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </MarkerClusterer>
      </GoogleMap>
    )
  })
  return (
    <>
      <HeaderContent>
        <li
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="text-primary font-weight-bolder">
            <span className="menu-text">{t('header_content.eagle_eye')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      {showContent && (
        <>
          <SubHeaderContent>
            <div className="row">
              <div className=" col-lg-3 p-0">
                <div
                  className="quick-search search-eagle"
                  style={{ margin: '1px' }}
                >
                  <div className="quick-search-form">
                    <div className="input-group">
                      <ButtonSearch />

                      <input
                        ref={refSearchInput}
                        id="search-input"
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        onKeyUp={(e) => {
                          if (e.keyCode == 13 || e.target.value === '') {
                            setQueryDriverSearch(e.target.value)
                            setFilter('')
                            applyFilter(e.target.value)
                          }
                        }}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">
                          <i className="quick-search-close ki ki-close icon-sm text-muted"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-2 p-0">
                <p
                  className={`btn-eagle ${
                    filter === 'available' ? 'bg-primary text-white' : ''
                  }`}
                  style={{ marginLeft: '2px' }}
                  onClick={() => setFilter('available')}
                >
                  {t('pages.common.Availables')} ({info.available?.length})
                </p>
              </div>
              <div className="col-lg-3 p-0">
                <p
                  className={`btn-eagle ${
                    filter === 'pickup' ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setFilter('pickup')}
                >
                  {t('pages.eagle.route_to_pickup')} ({info.pickup?.length})
                </p>
              </div>
              <div className="col-lg-3 p-0">
                <p
                  className={`btn-eagle ${
                    filter === 'deliver' ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setFilter('deliver')}
                >
                  {t('pages.eagle.route_to_deliver')}({info.deliver?.length})
                </p>
              </div>
              <div className="col-lg-1 p-0">
                <p
                  className={`btn-eagle ${
                    filter === 'all' ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setFilter('all')}
                >
                  {t('status.All')}({onlineDrivers?.length})
                </p>
              </div>
            </div>
          </SubHeaderContent>
          <MapWithAMarkerClusterer
            defaultCenter={
              onlineDrivers.length > 0
                ? {
                    lat: onlineDrivers[0].location.coordinates[1],
                    lng: onlineDrivers[0].location.coordinates[0]
                  }
                : { lat: 8.7298603, lng: -80.3312981 }
            }
            defaultZoom={onlineDrivers.length > 0 ? 13 : 8}
            driversLocation={driversLocation}
          />
        </>
      )}
    </>
  )
}

export default EagleEye
