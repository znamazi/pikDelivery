import React from 'react'
import { useAuth } from 'utils/next-auth'
import { useTranslation } from 'react-i18next'

const WelcomeBoard = () => {
  const auth = useAuth()
  const { t } = useTranslation()

  return (
    <div className="viewWelcomeBoard">
      <div className="textTitleWelcome">
        {t('pages.chat.welcome') + ',' + auth.user.name}
      </div>
      <img
        className="avatarWelcome"
        src="https://preview.keenthemes.com/metronic/theme/html/demo1/dist/assets/media/svg/avatars/045-boy-20.svg"
        alt="icon avatar"
      />
      <div className="textDesciptionWelcome">
        {t('pages.chat.start_talking')}
      </div>
    </div>
  )
}

export default WelcomeBoard
