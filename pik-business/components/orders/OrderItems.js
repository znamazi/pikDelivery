import React from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Typography, CircularProgress } from '@material-ui/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  vehicleTitle: {
    marginTop: theme.spacing(2),
    fontWeight: 'bold'
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right'
  },
  bold: {
    fontWeight: 'bold'
  },
  typography: { marginTop: theme.spacing(2) },
  vehicleType: {
    fontSize: '14px'
  },
  circularProgress: {
    width: '16px !important',
    height: '16px !important',
    marginLeft: theme.spacing(1),
    color: '#fff'
  }
}))

const OrderItems = ({
  selectVehicle,
  order,
  handleAddPackages,
  addPackages,
  removePackages,
  submitOrder,
  sending
}) => {
  const classes = useStyles()
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="col-lg-8">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.orders.order_items')}
          </h3>
          <h3 className="card-title font-weight-bolder ">
            {t('pages.orders.items')} = {order.packages.length}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          <Typography>{t('pages.orders.desc_order_item')}</Typography>
          <Typography className={classes.vehicleTitle}>
            {t('pages.orders.vehicle_title')}
          </Typography>
          <Typography className="pt-4">
            {t('pages.orders.vehicle_title_desc')}
          </Typography>
          <div className="row mt-15 border-bottom pb-10 ">
            <div
              className={`col-4 text-center ${
                order.vehicleType === 'Motorcycle' ? 'orange-color' : ''
              } `}
              onClick={() => selectVehicle('Motorcycle')}
              style={{ cursor: 'pointer' }}
            >
              <i
                className={`fa fa-motorcycle fa-3x ${
                  order.vehicleType === 'Motorcycle' ? 'orange-color' : ''
                } `}
              ></i>
              <Typography className={classes.vehicleType}>
                up to 32ft / 8kg
              </Typography>
            </div>
            <div
              className={`col-4 text-center  ${
                order.vehicleType === 'Car' ? 'orange-color' : ''
              } `}
              onClick={() => selectVehicle('Car')}
              style={{ cursor: 'pointer' }}
            >
              <i
                className={`fa fa-car fa-3x ${
                  order.vehicleType === 'Car' ? 'orange-color' : ''
                } `}
              ></i>
              <Typography className={classes.vehicleType}>
                up to 32ft / 8kg
              </Typography>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-3">
              <Typography className={classes.bold}>
                {t('pages.orders.reference')}
              </Typography>
              <Typography>{t('pages.orders.for_internal_use')}</Typography>
            </div>
            <div className="col-9">
              <Typography className={classes.bold}>
                {t('pages.orders.description')}
              </Typography>
              <Typography>{t('pages.orders.viewable_by_receiver')}</Typography>
            </div>
          </div>
          {order.packages.map((item, index) => (
            <div className="row mt-5" key={index}>
              <div className="col-3">
                <input
                  value={item['reference']}
                  className="form-control"
                  name="reference"
                  onChange={(e) => handleAddPackages(e, index)}
                />
              </div>
              <div className="col-7">
                <input
                  value={item['description']}
                  className="form-control"
                  name="description"
                  onChange={(e) => handleAddPackages(e, index)}
                />
              </div>
              <div className="col-2 p-3">
                {order.packages[index + 1] ? (
                  ''
                ) : (
                  // <a className="ml-5" >
                  <i
                    className="fa fa-plus mr-3 text-success"
                    onClick={addPackages}
                  ></i>
                  // </a>
                )}
                <i
                  className="fa fa-trash-alt text-danger"
                  onClick={() => removePackages(index)}
                ></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderItems
