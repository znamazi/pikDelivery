import React, { useState, useEffect } from 'react'
import ListUsers from './ListUsers'
import ChatBoard from './ChatBoard'
import WelcomeBoard from './WelcomeBoard'

const SupportChat = () => {
  const [currentPeerUser, setCurrentPeerUser] = useState('')

  const [height, setHeight] = useState(0)
  useEffect(() => {
    setHeight(window.innerHeight - 130)
  }, [])
  const onCloseChat = () => {
    setCurrentPeerUser({ ...currentPeerUser, isClosed: true })
  }

  return (
    <>
      <div className="body-support-chat row">
        <div className="viewListUser col-lg-5">
          <ListUsers
            onChange={(user) => setCurrentPeerUser(user)}
            currentPeerUser={currentPeerUser}
          />
        </div>
        <div className="viewBoard col-lg-7" style={{ height }}>
          {currentPeerUser ? (
            <ChatBoard
              currentPeerUser={currentPeerUser}
              onCloseChat={onCloseChat}
            />
          ) : (
            <WelcomeBoard />
          )}
        </div>
      </div>
    </>
  )
}

export default SupportChat
