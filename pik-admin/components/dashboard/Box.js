import React from 'react'
import SVG from 'react-inlinesvg'
import { useTranslation } from 'react-i18next'

const color = {
  1: 'primary',
  2: 'warning',
  3: 'danger',
  4: 'success'
}
const Box = ({ title, index, count }) => {
  const { t } = useTranslation()

  return (
    <div className={`col-lg-5 bg-light-${color[index]} px-6 py-8  m-5`}>
      <span
        className={`svg-icon svg-icon-3x svg-icon-${color[index]} d-block my-2`}
      >
        <SVG
          src="/assets/media/svg/icons/Media/Equalizer.svg"
          title="Equalizer"
        ></SVG>
      </span>
      <a className={`text-${color[index]} font-weight-bold font-size-h6`}>
        {t(`pages.dashboard.${title}`)}
        <p className="pt-5 font-weight-bolder">{count}</p>
      </a>
    </div>
  )
}

export default Box
