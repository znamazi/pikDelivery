import firebase from 'firebase'
import 'firebase/messaging'

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
if (!firebase.apps.length) {
  firebase.initializeApp(config)
}
firebase.firestore().settings({
  timestampsInSnapshots: true
})
export const myFirebase = firebase
export const myFirestore = firebase.firestore()

// export const messaging = firebase.messaging()

// let message

// // we need to check if messaging is supported by the browser
// if (firebase.messaging.isSupported()) {
//   message = firebase.messaging()
// }
// export const messaging = massage

// export const myStorage = firebase.storage()
