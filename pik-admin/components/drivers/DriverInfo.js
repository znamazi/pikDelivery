import React from 'react'
import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import { recruitment } from './drivers-list/DriversUIHelpers'
import { useTranslation } from 'react-i18next'
import Information from 'components/customers/Information'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1)
    }
  },
  large: {
    width: theme.spacing(18),
    height: theme.spacing(18)
  }
}))

const DriverInfo = ({ driver }) => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <div className="col-lg-4">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.drivers.driver_information')}
          </h3>
        </div>
        <div className="card-body ">
          <div className="space-evenly">
            <Avatar src={driver.avatar} className={classes.large} />
          </div>

          <div className="mt-10">
            <Information title="Name" value={driver.firstName} />
            <Information title="last_name" value={driver.lastName} />
            <Information title="Email" value={driver.email} />
            <Information title="mobile_phone" value={driver.mobile} />
            <Information
              title="Registered"
              value={moment(driver.createdAt).format('LL')}
            />

            {recruitment.indexOf(driver.status) == -1 ? (
              <>
                <div className="mb-7">
                  <div className="font-weight-bolder text-dark-75 pl-3 font-size-lg space-between">
                    <span> {t('pages.drivers.Cancel')}</span>
                    <span> {t('pages.drivers.Reject')}</span>
                    <span> {t('pages.drivers.Rating')}</span>
                  </div>
                  <div className="pl-3 font-size-lg d-flex justify-content-between">
                    <span>{driver.cancel.toFixed(2)}</span>
                    <span>
                      {driver.jobs?.ignore
                        ? (
                            (driver.jobs.ignore / driver.jobs.total) *
                            100
                          ).toFixed(2)
                        : ''}
                    </span>
                    <span>
                      {driver.feedback ? driver.feedback.toFixed(2) : ''}
                    </span>
                  </div>
                </div>
                <div className="mb-7">
                  <p className="font-weight-bolder text-dark-75 pl-3 font-size-lg">
                    {t('pages.drivers.personal_id')}
                  </p>
                  <p className="pl-3 font-size-lg">
                    {driver.personalId ? driver.personalId.id : ''}
                  </p>
                </div>
              </>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DriverInfo
