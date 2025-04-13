import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // English translations
      welcome: 'Welcome',
      login: 'Login',
      register: 'Register',
      profile: 'Profile',
      // Add more translations
    }
  },
  es: {
    translation: {
      // Spanish translations
      welcome: 'Bienvenido',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      profile: 'Perfil',
    }
  },
  // Add other languages
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;