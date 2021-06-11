export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('firebase-messaging-sw.js')
      .then(function (registration) {
        // eslint-disable-next-line no-console
        return registration.scope
      })
      .catch(function (err) {
        return err
      })
  }
}
