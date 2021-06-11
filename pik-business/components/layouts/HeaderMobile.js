import { useLayout } from './layoutProvider'
import SVG from 'react-inlinesvg'

const HeaderMobile = () => {
  const layout = useLayout()
  const { asideOn, setAsideOn, showTopBar, setShowTopBar } = layout
  const showHeader = () => {
    setAsideOn(false)
    setShowTopBar(!showTopBar)
  }
  return (
    <div
      id="kt_header_mobile"
      className="header-mobile align-items-center header-mobile-fixed"
    >
      <img
        alt="Logo"
        src="/assets/media/logos/logo-sidebar-business.png"
        className="max-width-160"
      />

      <div className="d-flex align-items-center">
        <button
          className={`btn p-0 burger-icon ml-4 ${
            asideOn ? 'mobile-toggle-active' : ''
          }`}
          // id="kt_header_mobile_toggle"
          onClick={() => setAsideOn(!asideOn)}
        >
          <span></span>
        </button>
        <button
          className="btn btn-hover-text-primary p-0 ml-2"
          id="kt_header_mobile_topbar_toggle"
          onClick={showHeader}
        >
          <span className="svg-icon svg-icon-xl">
            <SVG src="/assets/media/svg/icons/General/User.svg" />
          </span>
        </button>
      </div>
    </div>
  )
}

export default HeaderMobile
