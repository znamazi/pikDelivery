import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import Chart from './Chart'
import { MenuItem, FormControl, InputLabel, Select } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1)
  },
  select: {
    // padding: theme.spacing(0, 2),
    minWidth: 120
  }
}))

const ChartContainer = (props) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const currentYear = moment().year()
  const currentWeekNumber = moment().week()
  const [weekNumber, setWeekNumber] = useState(currentWeekNumber)
  const data = useMemo(() => {
    let weekIncome = [
      {
        name: t('information.sunday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.monday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.tuesday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.wednesday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.thursday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.friday'),
        Send: 0,
        Request: 0,
        Availables: 0
      },
      {
        name: t('information.saturday'),
        Send: 0,
        Request: 0,
        Availables: 0
      }
    ]
    props.orders.forEach((order) => {
      const dayName = moment(order.createdAt).format('dddd')
      if (order.isRequest) {
        // Request Data
        let index = weekIncome.findIndex((item) => item.name === dayName)
        weekIncome[index].Request = parseFloat(
          (weekIncome[index].Request + order.cost.total).toFixed(2)
        )
      } else {
        // Send Data
        let index = weekIncome.findIndex((item) => item.name === dayName)
        weekIncome[index].Send = parseFloat(
          (weekIncome[index].Send + order.cost.total).toFixed(2)
        )
      }
    })
    return weekIncome
  }, [props.orders])

  const decreaseWeek = () => {
    if (weekNumber == 1) return
    setWeekNumber(weekNumber - 1)
    props.changeWeek(weekNumber - 1)
  }
  const increaseWeek = () => {
    if (
      (weekNumber == currentWeekNumber && props.year == currentYear) ||
      weekNumber == 52
    )
      return
    setWeekNumber(weekNumber + 1)
    props.changeWeek(weekNumber + 1)
  }
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b">
          <div className="card-header border-bottom pt-5">
            <h3 className="card-title font-weight-bolder ">
              <i
                className="fa fa-angle-left week-change mr-4"
                onClick={decreaseWeek}
              ></i>
              {t('pages.dashboard.week_income', { weekNumber })}
              <i
                className="fa fa-angle-right  week-change ml-4"
                onClick={increaseWeek}
              ></i>
            </h3>
            <FormControl className={classes.formControl}>
              <InputLabel id="year-label">{t('Table.columns.Year')}</InputLabel>
              <Select
                labelId="year-label"
                id="year"
                name="year"
                className={classes.select}
                value={props.year}
                onChange={(e) => props.changeYear(e.target.value)}
              >
                {Array.from(Array(12).keys()).map((item, index) => {
                  let data = currentYear - item
                  // let value = item - 20
                  if (data >= 2020)
                    return (
                      <MenuItem value={data} key={index}>
                        {data}
                      </MenuItem>
                    )
                })}
              </Select>
            </FormControl>
          </div>
          <div className="card-body ">
            <div className="col-lg-6 font-weight-bolder text-dark-75 pl-3 font-size-lg d-flex space-between mb-5">
              <div>
                <span> {t('pages.common.Total')}</span>
                <p>
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    data.reduce((total, item) => {
                      return total + item.Request + item.Send + item.Availables
                    }, 0)
                  )}
                </p>
              </div>
              <div>
                <span> {t('pages.dashboard.Request')}</span>
                <p>
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    data.reduce((total, item) => {
                      return total + item.Request
                    }, 0)
                  )}
                </p>
              </div>
              <div>
                <span> {t('pages.common.Availables')}</span>
                <p>
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    data.reduce((total, item) => {
                      return total + item.Availables
                    }, 0)
                  )}
                </p>
              </div>
              <div>
                <span> {t('pages.dashboard.Send')}</span>
                <p>
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    data.reduce((total, item) => {
                      return total + item.Send
                    }, 0)
                  )}
                </p>
              </div>
            </div>

            <Chart weekIncome={data} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartContainer
