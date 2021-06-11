/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Typography, Box } from '@material-ui/core'
import SignIn from './SignIn'
import Register from './Register'
import ResetPassword from './ResetPassword'
// import ForgotPassword from "./ForgotPassword";
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import axios from '../../utils/axios'

function Copyright() {
  const { t } = useTranslation()
  return (
    <div>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link href="https://app.pikdelivery.com/">
          <span>app.pikdelivery.com</span>
        </Link>
        {' 2021.'}
      </Typography>
    </div>
  )
}
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column'
    // alignItems: 'center'
  }
}))
const AuthPage = () => {
  const [login, setLogin] = useState(true)
  const router = useRouter()
  const { t } = useTranslation()
  const classes = useStyles()

  let { resetToken } = router.query
  const [terms, setTerms] = useState('')
  const [showTermsConditions, setShowTermsConditions] = useState(false)
  const [staticPage, setStaticPage] = useState('')
  useEffect(() => {
    if (staticPage)
      axios
        .get(`business/auth/staticPage/${staticPage}`)
        .then(({ data }) => {
          if (data.success) {
            setTerms(data.page)
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
  }, [staticPage])
  return (
    <div className="container">
      <div className="d-flex flex-column flex-root m-10 border-1">
        {/*begin::Login*/}
        {!showTermsConditions && (
          <div
            className="login login-1 login-signin-on d-flex flex-column flex-lg-row flex-row-fluid bg-white"
            id="kt_login"
          >
            {/*begin::Aside*/}
            <div className="login-aside d-flex flex-row-auto bgi-size-cover bgi-no-repeat p-10 p-lg-10 border-right bg-black text-white">
              {/*begin: Aside Container*/}
              <div className="d-flex flex-row-fluid flex-column justify-content-between">
                {/* start:: Aside content */}
                <div className="flex-column-fluid d-flex flex-column justify-content-center">
                  <div className=" d-flex justify-content-center">
                    <img
                      alt="Logo"
                      src="/assets/media/logos/logo-letter-1.png"
                      style={{ width: '85%' }}
                    />
                  </div>

                  <h3
                    className="font-size-h1 mb-10 mt-10"
                    style={{ textAlign: 'center' }}
                  >
                    {t('pages.auth.welcome')}
                  </h3>
                  {/* <p className="font-weight-lighter  opacity-80">
                  {t('pages.auth.introduce')}
                </p> */}
                </div>
                {/* end:: Aside content */}

                {/* start:: Aside footer for desktop */}
                <div className="d-none flex-column-auto d-lg-flex justify-content-between mt-10">
                  <div className="opacity-70 font-weight-bold	">
                    &copy; {t('pages.auth.copyright')}
                  </div>
                  <div className="d-flex bottomLink">
                    <span
                      style={{ marginRight: 20 }}
                      onClick={() => {
                        setShowTermsConditions(true)
                        setStaticPage('Privacy Policy')
                      }}
                    >
                      {t('pages.auth.privacy')}
                    </span>

                    <span
                      style={{ marginRight: 20 }}
                      onClick={() => {
                        setShowTermsConditions(true)
                        setStaticPage('Legal')
                      }}
                    >
                      {t('pages.auth.legal')}
                    </span>

                    <span
                      style={{ marginRight: 10 }}
                      onClick={() => {
                        setShowTermsConditions(true)
                        setStaticPage('Contact')
                      }}
                    >
                      {t('pages.auth.contact')}
                    </span>
                  </div>
                </div>
                {/* end:: Aside footer for desktop */}
              </div>
              {/*end: Aside Container*/}
            </div>
            {/*begin::Aside*/}

            {/*begin::Content*/}
            <div className="flex-row-fluid d-flex flex-column position-relative p-7 overflow-hidden">
              {/*begin::Content header*/}
              <div className="position-absolute top-0 right-0 text-right mt-5 mb-15 mb-lg-0 flex-column-auto justify-content-center py-5 px-10">
                {!resetToken && (
                  <>
                    <span className="font-weight-bold text-dark-50">
                      {login ? t('pages.auth.not_have_account') : ''}
                    </span>
                    <a onClick={(e) => setLogin(!login)}>
                      {'  '}
                      {login ? t('pages.auth.signup') : t('pages.auth.signin')}
                    </a>
                  </>
                )}
              </div>
              {/*end::Content header*/}

              {/* begin::Content body */}
              <div className="d-flex flex-column-fluid flex-center  mt-lg-0">
                {resetToken ? (
                  <ResetPassword />
                ) : login ? (
                  <SignIn />
                ) : (
                  <Register
                    showCondition={() => {
                      setShowTermsConditions(true)
                      setStaticPage('Terms Of Service')
                    }}
                  />
                )}
              </div>
              <Box mt={8}>
                <Copyright />
              </Box>
              {/*end::Content body*/}

              {/* begin::Mobile footer */}
              <div className="d-flex d-lg-none flex-column-auto flex-column flex-sm-row justify-content-between align-items-center mt-5 p-5">
                <div className="text-dark-50 font-weight-bold order-2 order-sm-1 my-2">
                  &copy; {t('pages.auth.copyright')}
                </div>
                <div className="d-flex order-1 order-sm-2 my-2 bottomLink">
                  {/* <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/Privacy Policy`}
                  > */}
                  <span
                    style={{ marginRight: 20 }}
                    onClick={() => {
                      setShowTermsConditions(true)
                      setStaticPage('Privacy Policy')
                    }}
                  >
                    {t('pages.auth.privacy')}
                  </span>
                  {/* </Link>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/Legal`}
                  > */}
                  <span
                    style={{ marginRight: 20 }}
                    onClick={() => {
                      setShowTermsConditions(true)
                      setStaticPage('Legal')
                    }}
                  >
                    {t('pages.auth.legal')}
                  </span>
                  {/* </Link>
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/page/Contact`}
                  > */}
                  <span
                    style={{ marginRight: 10 }}
                    onClick={() => {
                      setShowTermsConditions(true)
                      setStaticPage('Contact')
                    }}
                  >
                    {t('pages.auth.contact')}
                  </span>
                  {/* </Link> */}
                </div>
              </div>
              {/* end::Mobile footer */}
            </div>
            {/*end::Content*/}
          </div>
        )}
        {/*end::Login*/}
        {showTermsConditions && (
          <div className="card card-custom card-stretch gutter-b">
            <div className="card-header border-bottom pt-5">
              <h3 className="card-title font-weight-bolder ">{terms.title}</h3>
              <a
                className="card-title font-weight-bolder "
                onClick={() => setShowTermsConditions(false)}
              >
                {t('pages.auth.back')}
              </a>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="row">
                <div className="col-lg-12">
                  <div>
                    <p
                      className="mt-3"
                      dangerouslySetInnerHTML={{
                        __html: terms.content
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default AuthPage
