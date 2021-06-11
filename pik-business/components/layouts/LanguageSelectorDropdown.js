/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState } from 'react'
import clsx from 'clsx'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import i18n from 'lib/i18n'
import Cookies from 'js-cookie'

const COOKIE_NAME = 'I18N_CONFIG_KEY'

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: '/assets/media/svg/flags/226-united-states.svg'
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: '/assets/media/svg/flags/128-spain.svg'
  },
  {
    lang: 'de',
    name: 'German',
    flag: '/assets/media/svg/flags/162-germany.svg'
  },
  {
    lang: 'fr',
    name: 'French',
    flag: '/assets/media/svg/flags/195-france.svg'
  }
]

export function LanguageSelectorDropdown() {
  let selectedLang = Cookies.get(COOKIE_NAME)

  const [lang, setLang] = useState(selectedLang ? selectedLang : 'en')
  const currentLanguage = languages.find((x) => x.lang === lang)
  const changeLanguage = (lang) => {
    Cookies.set(COOKIE_NAME, lang, {
      expires: 365000
    })
    setLang(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <div className="dropdown align-items-center">
      <div
        id="dropdown-toggle-my-cart"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="language-panel-tooltip">Select Language</Tooltip>
          }
        >
          <div className="btn btn-icon btn-clean btn-dropdown btn-lg mr-1">
            <img
              className="h-25px w-25px rounded"
              src={currentLanguage.flag}
              alt={currentLanguage.name}
            />
          </div>
        </OverlayTrigger>
      </div>
      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <ul className="navi navi-hover py-4">
          {languages.map((language) => (
            <li
              key={language.lang}
              className={clsx('navi-item', {
                active: language.lang === currentLanguage.lang
              })}
            >
              <a
                onClick={() => changeLanguage(language.lang)}
                className="navi-link"
              >
                <span className="symbol symbol-20 mr-3">
                  <img src={language.flag} alt={language.name} />
                </span>
                <span className="navi-text">{language.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
