importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.13.1/firebase-messaging.js')

const config = {
  apiKey: 'AIzaSyBCGoGKBZNt68p04OtuXmW_QCVYDfZXCJA',
  authDomain: 'pik-delivery-3f118.firebaseapp.com',
  databaseURL: 'https://pik-delivery-3f118.firebaseio.com',
  projectId: 'pik-delivery-3f118',
  storageBucket: 'pik-delivery-3f118.appspot.com',
  messagingSenderId: '659901415298',
  appId: '1:659901415298:web:5a09e7a56d02f5c6a6999b',
  measurementId: 'G-QSRCSL4BD1'
}
firebase.initializeApp(config)
const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = payload.data.title
  const notificationOptions = {
    body: payload.data.body,
    // icon: '/firebase-logo.png',
    icon: 'http://localhost:3000/firebase-logo.png'
  }
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  )
})

self.addEventListener('notificationclick', (event) => {
  return event
})
