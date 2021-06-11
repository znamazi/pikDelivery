import React from 'react'
import ButtonEdit from '../../../../metronic/partials/ButtonEdit'
import ButtonView from '../../../../metronic/partials/ButtonView'
import { uneditable } from '../OrdersUIHelpers'
import SVG from 'react-inlinesvg'
import PrintQR from '../../PrintQR'

export const ActionColumnFormatter = (cellContent, row) => {
  const print = (id) => {
    const content = document.getElementById(`printQR-${id}`)
    let pri = document.getElementById(`ifmcontentstoprint-${id}`).contentWindow
    pri.document.open()
    pri.document.write(content.innerHTML)
    pri.document.close()
    pri.focus()
    pri.print()
  }
  return (
    <div>
      {!uneditable.includes(row.status) && (
        <ButtonEdit href={`/order/edit/[id]`} as={`/order/edit/${row.id}`} />
      )}
      <ButtonView href={`/order/[id]`} as={`/order/${row.id}`} />
      <div
        className="btn btn-icon btn-light border-action-bottom btn-sm mx-1"
        onClick={() => print(row.id)}
      >
        <span className="svg-icon svg-icon-md svg-icon-primary">
          <SVG
            src="/assets/media/svg/icons/Devices/Printer.svg"
            title="Print"
          />
        </span>
      </div>
      <PrintQR order={row} />
      <iframe
        id={`ifmcontentstoprint-${row.id}`}
        style={{
          height: '0px',
          width: '0px',
          position: 'absolute',
          display: 'none'
        }}
      ></iframe>
    </div>
  )
}
