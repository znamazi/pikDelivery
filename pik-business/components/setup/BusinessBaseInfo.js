import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Avatar, TextField, Box } from '@material-ui/core'
import axios from '../../utils/axios'
import { useSetupState } from './context'
import { validationEmail, validationUrl, resizeImage } from 'utils/utils'
import PhoneInput from '../partials/PhoneInput'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const useStyles = makeStyles((theme) => ({
  card: { maxWidth: 400, display: 'block' },
  cvv: { marginTop: '-8px' },
  formControl: {
    margin: theme.spacing(1)
  },
  borderRight: {
    borderRight: '1px solid gray'
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right'
  },
  btnUpload: {
    marginTop: theme.spacing(2)
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20)
  },
  textarea: {
    marginTop: theme.spacing(1),
    borderRadius: 4,
    borderColor: '#c4c4c4'
  },

  typography: { marginTop: theme.spacing(2) },
  example: {
    borderRadius: 4,
    backgroundColor: '#ffa50059',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2)
  },
  IOSSwitch: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(3)
  },
  select: {
    minWidth: 120
  },
  phone: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2)
  },
  mobile: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  }
}))

const BusinessBaseInfo = (props) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const { state, dispatch } = useSetupState()
  const [error, setError] = useState({})
  const [avatar, setAvatar] = useState(state.logo)

  const uploadAvatar = (file) => {
    if (file) {
      const data = new FormData()
      data.append('file', file)
      data.append('filename', file.name)
      data.file = file
      setAvatar('/assets/media/load.gif')
      axios
        .post('/business/setup/avatar', data)
        .then(({ data }) => {
          setAvatar(data.url)
          dispatch({
            type: 'UPDATE_LOGO',
            payload: data.url
          })
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
    }
  }

  const handleData = (e) => {
    setError({ ...error, [e.target.id]: '' })
    dispatch({
      type: 'UPDATE_ERROR',
      payload: ''
    })
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        fieldName: e.target.id,
        value: e.target.value
      }
    })
  }

  const handlePhone = (phone, fieldName) => {
    dispatch({
      type: 'UPDATE_ERROR',
      payload: ''
    })
    dispatch({
      type: 'UPDATE_DATA',
      payload: {
        fieldName: fieldName,
        value: phone
      }
    })
  }

  const checkEmail = () => {
    setError({ ...error, email: '' })
    if (state.email)
      if (!validationEmail(state.email)) {
        setError({ ...error, email: t('errors.email_address_not_correct') })
        dispatch({
          type: 'UPDATE_ERROR',
          payload: t('errors.email_address_not_correct')
        })
      }
  }

  const checkUrl = () => {
    setError({ ...error, website: '' })
    if (state.website)
      if (!validationUrl(state.website)) {
        setError({ ...error, website: t('errors.website_address_not_correct') })
        dispatch({
          type: 'UPDATE_ERROR',
          payload: t('errors.website_address_not_correct')
        })
      }
  }
  return (
    <div className={`col-lg-4 ${classes.borderRight}`}>
      <div className={classes.box}>
        <Avatar src={avatar ? avatar : state.logo} className={classes.large} />

        <Button
          variant="contained"
          component="label"
          className={classes.btnUpload}
        >
          {t('pages.setup.update_logo')}
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => uploadAvatar(e.currentTarget.files[0])}
            name="file"
          />
        </Button>
      </div>
      <TextField
        value={state.name ? state.name : ''}
        onChange={(e) => handleData(e)}
        variant="outlined"
        margin="normal"
        fullWidth
        id="name"
        label={t('pages.setup.business_name')}
        name="name"
        autoComplete="name"
        autoFocus
      />
      <Box className={classes.phone}>
        <PhoneInput
          label={t('information.phone')}
          value={state.phone ? state.phone : ''}
          handlePhone={(phone) => handlePhone(phone, 'phone')}
          className="pt-8 pr-20 pb-8"
        />
      </Box>
      <Box className={classes.mobile}>
        <PhoneInput
          label={t('information.mobile_phone')}
          value={state.mobile ? state.mobile : ''}
          handlePhone={(phone) => handlePhone(phone, 'mobile')}
          className="pt-8 pr-20 pb-8"
        />
      </Box>

      <TextField
        value={state.email ? state.email : ''}
        onChange={(e) => handleData(e)}
        error={error.email ? true : false}
        helperText={error.email}
        onBlur={checkEmail}
        variant="outlined"
        margin="normal"
        fullWidth
        id="email"
        label={t('information.email')}
        name="email"
        autoComplete="email"
        type="email"
      />
      <TextField
        value={state.website ? state.website : ''}
        onChange={(e) => handleData(e)}
        variant="outlined"
        margin="normal"
        fullWidth
        error={error.website ? true : false}
        helperText={error.website}
        onBlur={checkUrl}
        id="website"
        label={t('information.website')}
        name="website"
        autoComplete="website"
      />
      <TextField
        value={state.about ? state.about : ''}
        onChange={(e) => handleData(e)}
        variant="outlined"
        margin="normal"
        fullWidth
        multiline
        id="about"
        label={t('information.about')}
        name="about"
        autoComplete="about"
        placeholder={t('pages.setup.about_desc')}
      />
    </div>
  )
}

export default BusinessBaseInfo
