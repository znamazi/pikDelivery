import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import Link from 'next/link'
import { myFirestore, myFirebase } from '../../utils/firebase'
import { AppString } from './appString'
import { useAuth } from 'utils/next-auth'
import axios from '../../utils/axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import LeftMessageChat from '../partials/LeftMessageChat'
import RightMessageChat from '../partials/RightMessageChat'

const ChatBoard = (props) => {
  const auth = useAuth()
  const { t } = useTranslation()

  let currentUserId = auth.user._id

  const [listMessage, setListMessage] = useState([])
  let currentPeerUser = props.currentPeerUser
  const groupChatId = currentPeerUser.docID
  let removeListener = null
  let currentPhotoFile = null
  let messagesEnd = useRef(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [data, setData] = useState({})
  useEffect(() => {
    currentPeerUser = props.currentPeerUser

    getListHistory()
    getOrders()
    setTimeout(scrollToBottom, 2000)
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [props.currentPeerUser])
  const getOrders = () => {
    axios
      .post(`admin/customer/orders/${props.currentPeerUser._id}`)
      .then(({ data }) => {
        if (data.success) {
          setOrders(data.orders)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }
  const getListHistory = () => {
    if (removeListener) {
      removeListener()
    }

    setIsLoading(true)

    // Get history and listen new data added
    let listMessage = []

    removeListener = myFirestore
      .collection(AppString.SUPPORT_TICKETS)
      .doc(groupChatId)
      .collection(AppString.MESSAGES)
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === AppString.DOC_ADDED) {
              listMessage.push({ ...change.doc.data(), id: change.doc.id })
            }
          })
          const data = listMessage.find((item) => item.sender.type !== 'admin')
          setData(data)
          setListMessage(listMessage)
          setIsLoading(false)
        },
        (err) => {
          console.log('error happend', err)
        }
      )
  }

  const onSendMessage = async (content, type, fileName) => {
    if (content.trim() === '') {
      return
    }
    const timestamp = Date.now()

    let ticket = myFirestore
      .collection(AppString.SUPPORT_TICKETS)
      .doc(groupChatId)
    await ticket.update({
      [`userList.${currentUserId}`]: {
        // avatar: auth.user.avatar,
        name: auth.user.name
      }
    })
    await ticket.collection(AppString.MESSAGES).add({
      timestamp,
      text: type === AppString.MESSAGE_TYPE.text ? content.trim() : '',
      sender: {
        _id: currentUserId.toString(),
        type: 'admin',
        name: auth.user.name
      },
      photos: type === AppString.MESSAGE_TYPE.photo ? [content] : [],
      files:
        type === AppString.MESSAGE_TYPE.file
          ? [{ file: content, name: fileName }]
          : []
    })

    setInputValue('')
    getListHistory()
    scrollToBottom()
  }

  const onKeyboardPress = (event) => {
    if (event.key === 'Enter') {
      onSendMessage(inputValue, AppString.MESSAGE_TYPE.text)
    }
  }

  const scrollToBottom = () => {
    if (messagesEnd) {
      messagesEnd.current.scrollIntoView()
    }
  }

  const isLastMessageLeft = (index) => {
    if (
      (index + 1 < listMessage.length &&
        listMessage[index + 1].idFrom === currentUserId) ||
      index === listMessage.length - 1
    ) {
      return true
    } else {
      return false
    }
  }

  const isLastMessageRight = (index) => {
    if (
      (index + 1 < listMessage.length &&
        listMessage[index + 1].idFrom !== currentUserId) ||
      index === listMessage.length - 1
    ) {
      return true
    } else {
      return false
    }
  }

  const renderListMessage = () => {
    if (listMessage.length > 0) {
      let viewListMessage = listMessage.map((item, index) => {
        if (item.sender.type === 'admin') {
          // Item right (my message)
          return (
            <RightMessageChat
              id={item.id}
              text={item.text}
              timestamp={item.timestamp}
              photos={item.photos}
              files={item.files}
              sender={item.sender.name}
            />
          )
        } else {
          // Item left (peer message)
          return (
            <LeftMessageChat
              id={item.id}
              text={item.text}
              timestamp={item.timestamp}
              avatar={currentPeerUser.photoUrl}
              photos={item.photos}
              isLastMessageLeft={isLastMessageLeft(index)}
            />
          )
        }
      })
      return viewListMessage
    } else {
      return (
        <div className="viewWrapSayHi">
          <span className="textSayHi">Say hi to new friend</span>
          <img
            className="imgWaveHand"
            src="/assets/media/images_supportChat/ic_wave_hand.png"
            alt="wave hand"
          />
        </div>
      )
    }
  }

  const onChoosePhoto = (event) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true)
      currentPhotoFile = event.target.files[0]
      // Check this file is an image?
      const prefixFiletype = event.target.files[0].type.toString()
      if (prefixFiletype.indexOf(AppString.PREFIX_IMAGE) === 0) {
        uploadPhoto()
      } else {
        setIsLoading(false)

        // props.showToast(0, 'This file is not an image')
      }
    } else {
      setIsLoading(false)
    }
  }
  const uploadPhoto = () => {
    if (currentPhotoFile) {
      const timestamp = moment().valueOf().toString()

      const uploadTask = myFirebase
        .storage()
        .ref()
        .child(timestamp)
        .put(currentPhotoFile)

      uploadTask.on(
        AppString.UPLOAD_CHANGED,
        null,
        (err) => {
          setIsLoading(false)
          alert(err.message)
          // props.showToast(0, err.message)
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            setIsLoading(false)
            onSendMessage(downloadURL, AppString.MESSAGE_TYPE.photo)
          })
        }
      )
    } else {
      setState({ isLoading: false })
      // props.showToast(0, 'File is null')
    }
  }

  const onChooseFile = (event) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true)
      currentPhotoFile = event.target.files[0]
      uploadFile()
    } else {
      setIsLoading(false)
    }
  }

  const uploadFile = () => {
    if (currentPhotoFile) {
      const timestamp = moment().valueOf().toString()

      const uploadTask = myFirebase
        .storage()
        .ref()
        .child(timestamp)
        .put(currentPhotoFile)

      uploadTask.on(
        AppString.UPLOAD_CHANGED,
        null,
        (err) => {
          setIsLoading(false)
          alert(err.message)
          // props.showToast(0, err.message)
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            setIsLoading(false)
            onSendMessage(
              downloadURL,
              AppString.MESSAGE_TYPE.file,
              currentPhotoFile.name
            )
          })
        }
      )
    } else {
      setState({ isLoading: false })
      // props.showToast(0, 'File is null')
    }
  }

  const closeMessage = () => {
    myFirestore.collection(AppString.SUPPORT_TICKETS).doc(groupChatId).update({
      isClosed: true
    })
    props.onCloseChat()
  }

  return (
    <div className="viewChatBoard">
      {/* Header */}
      <div className="headerChatBoard">
        <img
          className="imageHeaderChatBoard"
          src={
            currentPeerUser.photoUrl
              ? currentPeerUser.photoUrl
              : '/assets/media/svg/default-avatar.svg'
          }
          alt="icon avatar"
        />
        <div className="textHeaderChatBoard">
          <p>{currentPeerUser.nickname}</p>
          <p>
            <i className="fa fa-mobile mr-2"></i>
            {currentPeerUser.phone}
          </p>
          <p>
            <i className="fa fa-envelope mr-2"></i>
            {currentPeerUser.email}
          </p>
        </div>
        <div className="order-supportChat">
          {orders.map((order) => (
            <Link
              href={`/order/[id]`}
              as={`/order/${order.id}`}
              key={order._id}
            >
              <span className="btn btn-success">order {order.id}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* List message */}
      <div
        className="viewListContentChat"
        style={{ opacity: currentPeerUser.isClosed ? 0.5 : 1 }}
      >
        <div className="d-flex justify-content-lg-around mb-3 bg-dark text-white p-5">
          <span className="font-weight-bolder">
            Category: {data?.data?.category}
          </span>
          <span className="font-weight-bolder">
            Order ID:{data?.data?.orderID}
          </span>
        </div>
        {renderListMessage()}
        <div style={{ float: 'left', clear: 'both' }} ref={messagesEnd} />
      </div>

      {/* View bottom */}
      <div className="viewBottom">
        <div className="viewInputFile">
          <label htmlFor="file-input-image">
            <img
              accept="image/*"
              className="icOpenGallery"
              src="/assets/media/images_supportChat/ic_photo.png"
              alt="icon open gallery"
            />
          </label>
          <input
            type="file"
            id="file-input-image"
            onChange={onChoosePhoto}
            disabled={currentPeerUser.isClosed ? true : false}
          />
        </div>

        <div className="viewInputFile">
          <label htmlFor="file-input">
            <i className="fa fa-paperclip "></i>
          </label>
          <input
            type="file"
            id="file-input"
            onChange={onChooseFile}
            disabled={currentPeerUser.isClosed ? true : false}
          />
        </div>

        <input
          className="viewInput"
          placeholder={t('pages.chat.type_your_message')}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
          disabled={currentPeerUser.isClosed ? true : false}
          onKeyPress={onKeyboardPress}
        />
        {!currentPeerUser.isClosed ? (
          <img
            className="icSend"
            src="/assets/media/images_supportChat/ic_send.png"
            alt="icon send"
            onClick={() => onSendMessage(inputValue, 0)}
          />
        ) : (
          ''
        )}
      </div>
      <div className="mark-as-close">
        {!currentPeerUser.isClosed ? (
          <button className="btn btn-primary" onClick={closeMessage}>
            {t('pages.chat.mark_as_closed')}
          </button>
        ) : (
          <button className="btn btn-danger">
            {t('pages.chat.chat_closed')}
          </button>
        )}
      </div>
      {/* Loading */}
      {isLoading ? (
        <div className="viewLoading">{t('pages.chat.loading')}</div>
      ) : null}
    </div>
  )
}

export default ChatBoard
