import React, { useEffect, useState } from 'react'
import { myFirestore, myFirebase } from '../../utils/firebase'
import LeftMessageChat from '../partials/LeftMessageChat'
import RightMessageChat from '../partials/RightMessageChat'

const ORDER_CHAT_ROOT_COLLECTION = 'pik_delivery_order_chats'

const Chat = ({ order }) => {
  const [receiverChat, setReceiverChat] = useState([])
  const [senderChat, setSenderChat] = useState([])
  useEffect(() => {
    if (order.driver) {
      const unsubscribe = myFirestore
        .collection(ORDER_CHAT_ROOT_COLLECTION)
        .doc(
          `order_${order._id}_driver_${order.driver._id}_customer_${order.sender}`
        )
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((querySnapshot) => {
          let msgs = querySnapshot.docs.map((doc) => {
            return {
              _id: doc.id,
              ...doc.data()
            }
          })
          setSenderChat(msgs)
        })
      return unsubscribe
    }
  }, [order.driver])

  useEffect(() => {
    if (order.driver) {
      const unsubscribe = myFirestore
        .collection(ORDER_CHAT_ROOT_COLLECTION)
        .doc(
          `order_${order._id}_driver_${order.driver._id}_customer_${order.receiver._id}`
        )
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((querySnapshot) => {
          let msgs = querySnapshot.docs.map((doc) => {
            return {
              _id: doc.id,
              ...doc.data()
            }
          })
          setReceiverChat(msgs)
        })
      return unsubscribe
    }
  }, [order.driver])

  return (
    <div className="viewChatBoard" style={{ height: '300 px' }}>
      <div className="viewListContentChat">
        {senderChat.length > 0 && (
          <>
            <p className="chat-with-who">Sender Chat</p>
            {senderChat.map((item) => {
              if (item.sender.type === 'driver') {
                return (
                  <LeftMessageChat
                    id={item.id}
                    text={item.text}
                    timestamp={item.timestamp}
                    photos={item.image ? [item.image] : []}
                  />
                )
              } else {
                return (
                  <RightMessageChat
                    id={item.id}
                    text={item.text}
                    timestamp={item.timestamp}
                    photos={item.image ? [item.image] : []}
                  />
                )
              }
            })}
          </>
        )}
        {receiverChat.length > 0 && (
          <>
            <p className="chat-with-who"> Receiver Chat</p>
            {receiverChat.map((item) => {
              if (item.sender.type === 'driver') {
                return (
                  <LeftMessageChat
                    id={item.id}
                    text={item.text}
                    timestamp={item.timestamp}
                    photos={item.image ? [item.image] : []}
                  />
                )
              } else {
                return (
                  <RightMessageChat
                    id={item.id}
                    text={item.text}
                    timestamp={item.timestamp}
                    photos={item.image ? [item.image] : []}
                  />
                )
              }
            })}
          </>
        )}
        {senderChat.length === 0 && receiverChat.length === 0 && (
          <div className="font-weight-bolder text-dark-75 font-size-lg align-items-center">
            No Message Yet
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
