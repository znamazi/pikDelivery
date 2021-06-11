import React from 'react'
import moment from 'moment'

const LeftMessageChat = ({
  id,
  text,
  timestamp,
  avatar,
  photos,
  isLastMessageLeft
}) => {
  return (
    <div className="viewWrapItemLeft" key={id}>
      <div className="viewWrapItemLeft3">
        {avatar && <img src={avatar} alt="avatar" className="peerAvatarLeft" />}

        <div className=" position-relative">
          <div className="viewItemLeft2">
            {photos?.length > 0 &&
              photos.map((photo, index) => (
                <img
                  key={index}
                  className="imgItemLeft"
                  src={photo}
                  alt="content message"
                />
              ))}
            <div className="pt-5 pb-5 pl-5">
              <span className="textContentItem ">{text}</span>
              <p className="textTimeRight">{moment(timestamp).format('LT')}</p>
            </div>
          </div>
        </div>
      </div>
      {isLastMessageLeft ? (
        <span className="textTimeLeft">{moment(timestamp).format('ll')}</span>
      ) : null}
    </div>
  )
}

export default LeftMessageChat
