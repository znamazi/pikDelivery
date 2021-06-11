import React from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import 'lib/i18n'
import Layout from '../components/layouts'
import { NextAuthProvider } from '../utils/next-auth'
import LoginProtect from '../components/LoginProtecte'
import store from '../store'
import '../styles/globals.css'
import '../styles/index.scss'
import '../styles/modal.css'
import '../styles/dialogBox.css'
import '../styles/custom.css'
import '../styles/supportChat.css'
import '../styles/WelcomeBoard.css'
import '../styles/ChatBoard.css'
import 'react-datepicker/dist/react-datepicker.css'
import { LayoutProvider } from '../components/layouts/layoutProvider'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import { ConfirmationDialogProvider } from '../metronic/partials/modal/ConfirmationDialog'

const MyApp = ({ Component, pageProps }) => {
  return (
    <LayoutProvider>
      <NextAuthProvider>
        <LoginProtect>
          <Provider store={store}>
            <Layout>
              <ConfirmationDialogProvider>
                <Component {...pageProps} />
              </ConfirmationDialogProvider>
            </Layout>
          </Provider>
        </LoginProtect>
        <ToastContainer position="top-center" closeOnClick autoClose={3000} />
      </NextAuthProvider>
    </LayoutProvider>
  )
}

export default MyApp
