import React, { useEffect, useState } from 'react'
import Box from './Box'
import axios from '../../utils/axios'
import { useAuth } from 'utils/next-auth'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import moment from 'moment'
import ChartContainer from './ChartContainer'

// TODO : Change Chart to dynamic
const Dashboard = () => {
  const { t } = useTranslation()
  const auth = useAuth()
  const [siteInfo, setSiteInfo] = useState({})
  const [ridesInfo, setRidesInfo] = useState({})
  const [year, setYear] = useState(moment().year())

  const [weekNumber, setWeekNumber] = useState(moment().week())
  const [orders, setOrders] = useState([])

  useEffect(() => {
    axios
      .get(`admin/dashboard/${weekNumber}/${year}`)
      .then(({ data }) => {
        if (data.success) {
          setSiteInfo(data.siteInfo)
          setRidesInfo(data.ridesInfo)
          setOrders(data.orders)
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
  }, [weekNumber, year])

  return (
    <>
      {auth.user.enabled && (
        <>
          <div className="row">
            <div className="col-lg-6">
              <div className="card card-custom card-stretch gutter-b">
                <div className="card-header border-bottom pt-5">
                  <h3 className="card-title font-weight-bolder ">
                    {t('pages.dashboard.site_statistics')}
                  </h3>
                </div>
                <div className="card-body ">
                  <div className="row text-center">
                    {Object.keys(siteInfo).map((item, index) => (
                      <Box
                        key={index}
                        title={item}
                        index={index + 1}
                        count={
                          item === 'Income'
                            ? Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(siteInfo[item])
                            : Intl.NumberFormat('en-US').format(siteInfo[item])
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card card-custom card-stretch gutter-b">
                <div className="card-header border-bottom pt-5">
                  <h3 className="card-title font-weight-bolder ">
                    {t('pages.dashboard.rides_statistics')}
                  </h3>
                </div>
                <div className="card-body ">
                  <div className="row text-center">
                    {Object.keys(ridesInfo).map((item, index) => (
                      <Box
                        key={index}
                        title={item}
                        index={index + 1}
                        count={Intl.NumberFormat('en-US').format(
                          ridesInfo[item]
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ChartContainer
            changeWeek={(number) => setWeekNumber(number)}
            year={year}
            changeYear={(number) => setYear(number)}
            orders={orders}
          />
        </>
      )}
    </>
  )
}

export default Dashboard
