import { myFirebase } from './firebase'

export const requestFirebaseNotificationPermission = async () => {
  try {
    const messaging = myFirebase.messaging()
    await messaging.requestPermission()
    const token = await messaging.getToken()

    return token
  } catch (error) {
    console.log('errpr happend', error)
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    myFirebase.messaging().onMessage((payload) => {
      resolve(payload)
    })
  })
