import React from 'react'
import { useAuth } from '../../utils/next-auth'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

const InfoUser = (props) => {
  let auth = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  return (
    <div className="dropdown align-items-center">
      <div
        id="dropdown-toggle-my-cart"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <div className="topbar-item">
          <div
            className="btn btn-icon w-auto btn-clean d-flex align-items-center btn-lg px-2"
            id="kt_quick_user_toggle"
          >
            <span className="text-muted font-weight-bold font-size-base d-none d-md-inline mr-1">
              {t('header.hi')},
            </span>
            <span className="text-dark-50 font-weight-bolder font-size-base d-none d-md-inline mr-3">
              {auth.user.name}
            </span>
            <span className="symbol symbol-35 symbol-light-success">
              <span className="symbol-label font-size-h5 font-weight-bold">
                {auth.user.name.charAt(0)}
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <ul className="navi navi-hover py-4">
          <Link href="/profile">
            <li className="navi-item">
              <div className=" navi-link p-5">
                <i className="fa fa-edit mr-2"></i>
                {t('header.edit_profile')}
              </div>
            </li>
          </Link>
          <li className="navi-item">
            <div onClick={() => auth.logout()} className=" navi-link p-5">
              <i className="fa fa-sign-out-alt mr-2"></i>
              {t('header.logout')}
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default InfoUser
