import React from 'react'
import { getLabelCssClasses } from '../../utils/utils'
import { useTranslation } from 'react-i18next'

const SubHeaderStatus = ({ changeStatus, status, hired, statusCssClass }) => {
  const { t } = useTranslation()
  const statusTitle = hired
    ? {
        Pending: 'Pending',
        InReview: 'In Review',
        Approved: 'Approved',
        Recheck: 'Recheck',
        Suspended: 'Suspended',
        Disabled: 'Disabled'
      }
    : {
        Pending: 'Pending',
        InReview: 'In Review',
        Approved: 'Approved',
        Recheck: 'Recheck',
        Rejected: 'Rejected'
      }
  return (
    <div>
      <div className="dropdown">
        <button
          className={`btn btn-${getLabelCssClasses(
            statusTitle,
            statusCssClass,
            status
          )} dropdown-toggle`}
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {status}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {Object.keys(statusTitle).map((item, index) => (
            <a
              className="dropdown-item"
              onClick={() => changeStatus(statusTitle[item])}
              key={index}
            >
              {t(`status.${statusTitle[item]}`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubHeaderStatus
