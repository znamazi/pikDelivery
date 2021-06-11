import React from 'react'
import axios from 'axios'

const SendNotification = () => {
  const sendNotify = () => {
    const data = {
      notification: {
        title: 'Firebase',
        body: 'Firebase is awesome',
        click_action: 'http://localhost:3000/',
        icon: 'http://localhost:3000/firebase-logo.png'
      },
      to:
        'dxkBiyd7PG8dsxQFSNNXgg:APA91bENaeWEj9F4om7rdQCIBdq7D8phGXPIvyCFxXDXvTaX7gmc9rpEE6iLqBGUWVlm2xhse2M03cdncY52yh8X5r6p5rp_gaI-sg5L_xFm_Z3YYQs1PXztsxpVz5Aavm8_koYEjY-u'
    }

    axios
      .post('https://fcm.googleapis.com/fcm/send', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'key= AAAAmaUwf4I:APA91bEriXNoo6DCrrYQfWlMbs18YU0RRnk5j_gM0JcQhloF6K0UC93Q7yrivY3yM25WdP57W17gG8s0xTguPTrk-gBgX5MWgHGf1CoHm_VtdlTMJn1Zju5CgMkD-CL4j8-Bj7lT9Ddt'
        }
      })
      .then(({ data }) => {
        console.log('notify send')
      })
      .catch((error) => {
        console.log(error?.response?.data?.message || 'Somethings went wrong')
      })
  }

  return (
    <div className="mb-5">
      <button className="btn btn-danger" onClick={sendNotify}>
        Send Notification to user
      </button>
    </div>
  )
}

export default SendNotification
