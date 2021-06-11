const admin = require('firebase-admin')

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pik-delivery-3f118.firebaseio.com'
})

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://pik-delivery-3f118.firebaseio.com"
//   });
// }else {
//   admin.app(); // if already initialized, use that one
// }

const messaging = admin.messaging()
const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true })

module.exports = {
  messaging,
  firestore,
  firebaseAdmin: admin,
}
