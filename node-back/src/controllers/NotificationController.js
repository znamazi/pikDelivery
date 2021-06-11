const {messaging} = require('../fcm')
const UserDevice = require('../models/UserDevice');
const Customer = require('../models/Customer');
const _ = require('lodash')

const defaultOptions = {
  "android": {
    "notification": {
      "sound": "default"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default"
      }
    }
  }
}

const sendDataToClient = (tokens, data, extra) => {
  // Send a message to the devices corresponding to the provided
  // registration tokens.
  messaging
    .sendMulticast({
      tokens,
      data,
      ..._.merge(defaultOptions, extra)
    })
    .then((response) => {
      // Response is an object of the form { responses: [] }
      const successes = response.responses.filter((r) => r.success === true)
        .length
      const failures = response.responses.filter((r) => r.success === false)
        .length
      console.log(
        'Notifications sent:',
        `${successes} successful, ${failures} failed`
      )
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}

const sendNotificationToClient = (tokens, notification, extra) => {
  // Send a message to the devices corresponding to the provided
  // registration tokens.
  return messaging
    .sendMulticast({
      tokens,
      notification,
      ..._.merge(defaultOptions, extra)
    })
    .then((response) => {
      // Response is an object of the form { responses: [] }
      const successes = response.responses.filter((r) => r.success === true)
        .length
      const failures = response.responses.filter((r) => r.success === false)
        .length
      console.log(
        'Notifications sent:',
        `${successes} successful, ${failures} failed`
      )
      if(failures > 0)
        console.log(JSON.stringify(response, null, 2));
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}

const sendNotificationToUsers = (idList, notification, extra) => {
  // Send a message to the devices corresponding to the provided
  // registration tokens.
  return UserDevice.find({
    owner: {$in: idList}
  })
    .then(async devices => {
      if(devices.length > 0) {
        let response = await messaging.sendMulticast({
          tokens: devices.map(d => d.fcmToken),
          notification,
          ..._.merge(defaultOptions, extra)
        })
        // Response is an object of the form { responses: [] }
        const successes = response.responses.filter((r) => r.success === true)
          .length
        const failures = response.responses.filter((r) => r.success === false)
          .length
        // console.log(
        //   'Notifications sent:',
        //   `${successes} successful, ${failures} failed`
        // )
        if (failures > 0)
          console.log(JSON.stringify(response, null, 2));
      }
      else{
        console.log(`[NotificationController.sendNotificationToUsers]: User not found: ${idList.join(',')}`)
      }
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}

const notifyOrderAvailable = (business, receiver, order) => {
  sendNotificationToUsers(
    [receiver._id.toString()],
    {
      title: `${business.name}`,
      body: `You have 1 package available`
    },
    {
      data: {
        // action: 'reload_orders',
        action: 'get_package',
        order: order._id.toString(),
      }
    }
  )
}

const notifyOrderRequest = (sender, receiver, order) => {
  sendNotificationToUsers(
    [sender._id],
    {
      title: 'Order Request',
      body: `${receiver.name} want you to send him/her a package.`,
    },
    {
      data: {
        action: 'complete_order',
        order: order._id.toString()
      }
    }
  )
}

const notifyOrderAddressRequest = (sender, receiver, order) => {
  sendNotificationToUsers(
    [receiver._id],
    {
      title: 'Address request',
      body: `${sender.name} is requesting your address to complete an order`
    },
    {
      data: {
        action: 'complete_order',
        order: order._id.toString()
      }
    }
  )
}

const notifyOrderSend = (sender, receiver, order) => {
  sendNotificationToUsers(
    [receiver._id],
    {
      title: 'PIK Order',
      body: `${sender.name} send you a package.`,
    },
    {
      data: {
        action: 'reload_orders',
        order: order._id.toString()
      }
    }
  )
}

const notifyOrderDelivered = (sender, receiver, order) => {
  let notification = {
    title: 'Delivery Completed',
    body: `Your Delivery has been completed`,
  }
  let extra = {
    data: {
      action: 'reload_order',
      order: order._id.toString()
    }
  }
  if (order.senderModel === Customer.COLLECTION_NAME) {
    sendNotificationToUsers([sender._id], notification, extra)
  }
  if (receiver.status === Customer.Statuses.Registered) {
    sendNotificationToUsers([receiver._id], notification, extra)
  }
}

const notifyOrderReturned = (sender, receiver, order) => {
  let notification = {
    title: 'Order is returned',
    body: (
      order.cancel.customerNoShow
      ? `Waiting time reached, order return is activated`
      : `Your order has been canceled and returned.`
    ),
  }
  let extra = {
    data: {
      action: 'reload_order',
      order: order._id.toString()
    }
  }
  if (order.senderModel === Customer.COLLECTION_NAME) {
    sendNotificationToUsers([sender._id], notification, extra)
  }
  if (receiver.status === Customer.Statuses.Registered) {
    sendNotificationToUsers([receiver._id], notification, extra)
  }
}

const notifyOrderCanceled = (sender, receiver, order) => {
  let notification = {
    title: 'Order is Canceled',
    body: `Your order has been canceled`,
  }
  let extra = {
    data: {
      action: 'reload_order',
      order: order._id.toString()
    }
  }
  if (receiver.status === Customer.Statuses.Registered) {
    sendNotificationToUsers([receiver._id], notification, extra)
  }
  if (order.senderModel === Customer.COLLECTION_NAME) {
    sendNotificationToUsers([sender._id], notification, extra)
  }
}

const notifyDriverOrderComplete = (driverId) => {
  sendNotificationToUsers(
    [driverId],
    {
      title: 'PIK Partners',
      body: 'Order completed.',
    },
    {
      data: {
        action: 'reload_current_job'
      }
    }
  )
}

module.exports = {
  /** General Notifications*/
  sendDataToClient,
  sendNotificationToClient,
  sendNotificationToUsers,

  /** Order Create  Notifications*/
  notifyOrderAvailable,
  notifyOrderRequest,
  notifyOrderAddressRequest,
  notifyOrderSend,

  /** Order Complete  Notifications*/
  notifyOrderDelivered,
  notifyOrderReturned,
  notifyOrderCanceled,
  notifyDriverOrderComplete,
}
