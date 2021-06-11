import React from 'react'
import Barcode from 'react-barcode'
import moment from 'moment'

const PrintQR = (props) => {
  return (
    <div style={{ display: 'none' }} id={`printQR-${props.order.id}`}>
      {props.order.packages.map((item, index) => (
        <div
          key={index}
          style={{
            pageBreakBefore: 'always',
            marginTop: 50
          }}
        >
          <div style={{ textAlign: 'center', height: 200 }}>
            <img
              src="/assets/media/logos/logo.png"
              alt="Pik Delivery"
              style={{ width: 300, height: 200 }}
            />
          </div>
          <div style={{ textAlign: 'center', height: 200 }}>
            <Barcode
              value={item.trackingCode}
              width={3}
              height={60}
              format="CODE128"
              textMargin={20}
              fontSize={30}
              // margin="10px auto"
            />
          </div>
          <div>
            <p style={{ fontSize: '25px', padding: 10 }}>
              <span style={{ fontWeight: 'bolder', marginRight: '5px' }}>
                Date:
              </span>
              <span>{moment(props.order.createdAt).format('DD/MM/YYYY')}</span>
            </p>
            <p style={{ fontSize: '25px', padding: 10 }}>
              <span style={{ fontWeight: 'bolder', marginRight: '5px' }}>
                Reference:
              </span>
              <span>{item.reference}</span>
            </p>
            <p style={{ fontSize: '25px', padding: 10 }}>
              <span style={{ fontWeight: 'bolder', marginRight: '5px' }}>
                Name:
              </span>
              <span>{props.order.delivery.name}</span>
            </p>
            <p style={{ fontSize: '25px', padding: 10 }}>
              <span style={{ fontWeight: 'bolder', marginRight: '5px' }}>
                Phone:
              </span>
              <span>{props.order.delivery.phone}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PrintQR
