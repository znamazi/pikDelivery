import React, { useEffect, useState } from 'react'
import { useAuth } from '../../utils/next-auth'
import { useRouter } from 'next/router'
import ButtonSearch from '../../metronic/partials/ButtonSearch'
import { LanguageSelectorDropdown } from './LanguageSelectorDropdown'
import { useTranslation } from 'react-i18next'
import InfoUser from './InfoUser'
import { useLayout } from './layoutProvider'
import { Switch, FormControlLabel, Badge, IconButton } from '@material-ui/core'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import axios from '../../utils/axios'
import { myFirestore, myFirebase } from '../../utils/firebase'
import { AppString } from '../supportChat/appString'
import Link from 'next/link'

const useStyles = makeStyles((theme) => ({
  typography: { marginTop: theme.spacing(2) },
  badge: {
    marginRight: theme.spacing(1)
  },
  IOSSwitch: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1)
  },
  label: {
    margin: 'auto'
  }
}))
const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1)
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: ' #fff !important',
      '& + $track': {
        backgroundColor: '#52d869 !important',
        opacity: 1,
        border: 'none'
      }
    },
    '&$focusVisible $thumb': {
      color: '#52d869 !important',
      border: '6px solid #fff '
    }
  },
  thumb: {
    width: 24,
    height: 24
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[50],
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border'])
  },
  checked: {},
  focusVisible: {}
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  )
})

const Header = () => {
  let auth = useAuth()
  const classes = useStyles()
  const router = useRouter()
  const { t } = useTranslation()
  const layout = useLayout()
  const { showTopBar } = layout
  const [openChat, setOpenChat] = useState(0)

  useEffect(() => {
    const result = myFirestore
      .collection(AppString.SUPPORT_TICKETS)
      .where('isClosed', '==', false)
      .onSnapshot(
        (snapshot) => {
          setOpenChat(snapshot.docChanges().length)
        },
        (err) => {
          console.log('error happend', err)
        }
      )
    return result
  }, [])

  const handleSearch = (value) => {
    router.push({
      pathname: '/orders',
      query: { query: value, search: true }
    })
  }

  const changeChatOnline = () => {
    axios
      .post(`admin/user/update/profile/${auth.user._id}`, {
        chatOnline: !auth.user.chatOnline
      })
      .then(({ data }) => {
        if (data.success) {
          auth.setUser({
            ...auth.user,
            chatOnline: !auth.user.chatOnline
          })
        }
      })
      .catch((error) => {
        console.log(error?.response?.data?.message || 'Somethings went wrong')
      })
  }
  return (
    <div id="kt_header" className="header header-fixed">
      <div className="container-fluid d-flex align-items-stretch justify-content-between">
        <div
          className={`header-menu-wrapper header-menu-wrapper-left ${
            showTopBar ? 'mt-55' : ''
          }`}
          id="kt_header_menu_wrapper"
        >
          <div
            id="kt_header_menu"
            className="header-menu header-menu-mobile header-menu-layout-default"
          ></div>
        </div>

        <div className={`topbar ${showTopBar ? 'mt-55' : ''}`}>
          {auth.user.enabled && (
            <div className="quick-search" id="kt_quick_search_dropdown">
              <div className="quick-search-form">
                <div className="input-group">
                  <ButtonSearch />

                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('header.search_order')}
                    autoComplete="off"
                    onKeyUp={(e) => {
                      e.preventDefault()
                      if (e.keyCode == 13 || e.target.value === '')
                        handleSearch(e.target.value)
                    }}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      <i className="quick-search-close ki ki-close icon-sm text-muted"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* <Link href="/supportChat">
            <FormControlLabel
              control={
                <Badge
                  badgeContent={openChat}
                  color="secondary"
                  className={classes.badge}
                >
                  <QuestionAnswerIcon />
                </Badge>
              }
              label={t('information.chat')}
              className={classes.label}
            />
          </Link>

          <FormControlLabel
            control={
              <IOSSwitch
                checked={auth.user.chatOnline}
                onChange={(event) => changeChatOnline()}
                name="enabled"
              />
            }
            // label={t('information.enabled')}
            labelPlacement="start"
            className={classes.IOSSwitch}
          />
          {/*  */}
          <LanguageSelectorDropdown />
          <InfoUser />
        </div>
      </div>
    </div>
  )
}

export default Header
