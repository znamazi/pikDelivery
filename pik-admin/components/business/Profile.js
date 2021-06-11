import React, { useState, useEffect, useRef } from 'react'
import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import Comments from 'components/customers/Comments'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import Map from '../../metronic/partials/Map'
import axios from '../../utils/axios'
import InformationProfile from './InformationProfile'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { addHttp } from '../../utils/utils'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  large: {
    width: theme.spacing(15),
    height: theme.spacing(15)
    // margin: '0 auto'
  }
}))
const Profile = ({ business, updateBusiness }) => {
  const { t } = useTranslation()
  const refGroup = useRef()
  const classes = useStyles()
  const { isShowing, toggle } = useModal()
  const [groups, setGroups] = useState([])
  const changeGroup = (e) => {
    const groupValue = e.target.value
    axios
      .post(`admin/business/update/${business._id}`, { group: groupValue })
      .then(({ data }) => {
        if (data.success) {
          refGroup.current.blur()
          toast.success(t('pages.business.business_updated'))
          updateBusiness({ group: groupValue })
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
  }
  useEffect(() => {
    axios
      .post('admin/setting/group/list')
      .then(({ data }) => {
        if (data.success) {
          setGroups(data.groups)
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
  }, [])
  return (
    <>
      <div className="row">
        <div className=" col-lg-8">
          <div className="row">
            <InformationProfile title="Name" value={business.name} />
            <InformationProfile title="Phone" value={business.phone} />
            <div className="mb-6 col-md-6">
              <p>
                <span className="font-weight-bolder text-dark-75 font-size-lg mr-5">
                  {t('information.Address')}
                </span>
                <a onClick={toggle}>{t('pages.business.view_map')}</a>
              </p>

              <p className="font-size-lg">
                {business.address ? business.address.formatted_address : ''}
              </p>
            </div>

            <InformationProfile title="mobile_phone" value={business.mobile} />
            <InformationProfile title="Email" value={business.email} />
            <div className="mb-6 col-md-6">
              <p className="font-weight-bolder text-dark-75 font-size-lg">
                {t(`information.Website`)}
              </p>
              <p className="font-size-lg">
                <a href={addHttp(business.website)} target="_blink">
                  {business.website}
                </a>
              </p>
            </div>
            <InformationProfile
              title="shipping_coverage"
              value={`${
                business.enabled
                  ? `Enabled - $
              ${business.coverageMaxValue}`
                  : 'Disabled'
              } `}
            />
            <InformationProfile
              title="payment_method"
              value={business.creditCard?.cc_number}
            />
            <InformationProfile
              title="Registered"
              value={moment(business.createdAt).format('LL')}
            />

            <div className="col-md-6">
              <p className="font-weight-bolder text-dark-75 font-size-lg">
                {t('pages.business.business_group')}
              </p>
              <select
                className="form-control col-6"
                onChange={(e) => changeGroup(e)}
                value={business.group}
                ref={refGroup}
              >
                {groups.map((group, index) => (
                  <option value={group.title} key={index}>
                    {group.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-10 col-lg-4">
          <div className="mb-5">
            <Avatar src={business.logo} className={classes.large} />
          </div>
          <div>
            <p className="font-weight-bolder text-dark-75 font-size-lg">
              {t('pages.business.Bio')}
            </p>
            <p className="font-size-lg">{business.about}</p>
          </div>
        </div>
      </div>
      <div className="border-bottom m-4"></div>
      <div className="row mt-10">
        <div className="col-12 ">
          <p className="font-weight-bolder text-dark-75 font-size-lg mb-10">
            {t('pages.business.comment_log')}
          </p>
          <Comments
            id={business._id}
            urlList={`admin/business/${business._id}/comment/list`}
            urlSave={`admin/business/comment`}
          />
        </div>
      </div>
      <BaseModal isShowing={isShowing} hide={toggle}>
        {business.location ? (
          <Map
            location={{
              lat: business.location.coordinates[0],
              lng: business.location.coordinates[1]
            }}
            zoomLevel={17}
          />
        ) : (
          'Location not exist'
        )}
      </BaseModal>
    </>
  )
}

export default Profile
