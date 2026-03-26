import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ru from './ru.json'

const resources = {
  ru: { common: ru.common, onboarding: ru.onboarding, player: ru.player, tabs: ru.tabs, favorites: ru.favorites, topic: ru.topic },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    ns: ['common', 'onboarding', 'player', 'tabs', 'favorites', 'topic'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })

export default i18n
