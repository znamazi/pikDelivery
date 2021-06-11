import React from 'react'
import moment from 'moment'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import { FormControlLabel, Checkbox, Tooltip } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode.react'
import OrderHistory from './OrderHistory'
import PrintIcon from '@material-ui/icons/Print'
import PrintQR from './PrintQR'
import Barcode from 'react-barcode'

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: 13
  }
}))
const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600]
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)

const OrderPackagesDetails = ({ order }) => {
  const { t } = useTranslation()

  const classes = useStyles()

  const downloadQR = (id) => {
    const canvas = document.getElementById(id)
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `${id}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
  const print = () => {
    const content = document.getElementById('printQR')
    let pri = document.getElementById('ifmcontentstoprint').contentWindow
    pri.document.open()
    pri.document.write(content.innerHTML)
    pri.document.close()
    pri.focus()
    pri.print()
  }
  return (
    <div className="col-lg-8">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('cardTitle.order_packages')}
          </h3>
          <button
            className="btn bg-light-primary card-title  text-primary"
            onClick={print}
          >
            <PrintIcon style={{ color: 'text-primary' }} />
            Print
          </button>
        </div>
        <div className="card-body d-flex flex-column">
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <td width="100 px">{t('Table.columns.tracking')}</td>
                  <td width="40 px">{t('Table.columns.reference')}</td>
                  <td width="40 px">{t('Table.columns.type')}</td>
                  <td>{t('Table.columns.description')}</td>
                </tr>
              </thead>
              <tbody>
                {order.packages.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center justify-content-lg-around">
                        {/* <Barcode
                          value={item.trackingCode}
                          width={1}
                          height={30}
                          format="CODE128"
                          displayValue={false}
                        /> */}
                        <span>{item.trackingCode}</span>
                        {item.trackingConfirmation && (
                          <span className="ml-5">
                            <Tooltip
                              title={moment(item.trackingConfirmation).format(
                                'LT'
                              )}
                              placement="top"
                              classes={{ tooltip: classes.tooltip }}
                            >
                              <FormControlLabel
                                control={<GreenCheckbox checked={true} />}
                                // onMouseOver={(e) => alert('hi')}
                              />
                            </Tooltip>
                          </span>
                        )}
                        {/* 
                        <a onClick={() => downloadQR(item.trackingCode)}>
                          <QRCode
                            id={item.trackingCode}
                            value={item.trackingCode}
                            size={50}
                            level={'H'}
                            includeMargin={true}
                          />
                        </a> */}
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {item.reference}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {order.vehicleType === 'Motorcycle'
                        ? t('pages.orders.small')
                        : t('pages.orders.large')}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <strong>Vehicle Type:</strong> {order.vehicleType}
            <OrderHistory
              time={order.time}
              status={order.status}
              cancel={order.cancel}
            />
          </div>
        </div>
      </div>
      <PrintQR order={order} />
      <iframe
        id="ifmcontentstoprint"
        style={{ height: '0px', width: '0px', position: 'absolute' }}
      ></iframe>
    </div>
  )
}

export default OrderPackagesDetails
