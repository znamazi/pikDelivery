import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import axios from '../../utils/axios'
import HeaderContent from '../../components/layouts/HeaderContent'
import BusinessActivity from '../../components/business/BusinessActivity'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import actions from 'store/actions'

const BusinessDetails = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  const { id } = router.query
  const [business, setBusiness] = useState({})
  useEffect(() => {
    axios
      .get(`admin/business/${id}`)
      .then(({ data }) => {
        if (data.success) {
          setBusiness({
            ...data.business,
            customTimeFrames: data.customTimeFrames
          })
          props.updateBusinessList(data.business, id)
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

  const changeStatus = (status) => {
    axios
      .post(`admin/business/changeStatus/${business._id}`, { status })
      .then(({ data }) => {
        if (data.success) {
          toast.success('Business updated Successfuly')
          setBusiness({ ...business, status })
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
  return (
    <div className="row">
      <HeaderContent>
        <li
          onClick={() =>
            router.push({
              pathname: '/business',
              query: { status: '', filterHeader: 'All Business' }
            })
          }
          className="menu-item menu-item-submenu"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.business')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      {Object.keys(business).length > 0 && (
        <BusinessActivity
          business={business}
          updateBusiness={(data) => setBusiness({ ...business, ...data })}
          changeStatus={changeStatus}
        />
      )}
    </div>
  )
}

const mapStateToProps = (state) => ({
  business: state.business.business
})

const mapDispatchToProps = (dispatch) => {
  return {
    updateBusinessList: (business, id) => {
      dispatch({
        type: actions.BUSINESS_UPDATE_REQUESTED,
        payload: { business, id }
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(BusinessDetails)
