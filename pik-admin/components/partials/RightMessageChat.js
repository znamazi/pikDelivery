import React from 'react'
import moment from 'moment'

const RightMessageChat = ({
  id,
  text,
  timestamp,
  avatar,
  photos,
  files,
  sender
}) => {
  return (
    <div className="viewItemRight2 mr-5" key={id}>
      <div>
        {avatar && <img src={avatar} alt="avatar" className="peerAvatarLeft" />}

        <div className=" position-relative">
          <div>
            {photos?.length > 0 &&
              photos.map((photo, index) => (
                <img
                  key={index}
                  className="imgItemLeft"
                  src={photo}
                  alt="content message"
                />
              ))}
            {files &&
              files.length > 0 &&
              files.map((item, index) => (
                <div
                  className="file-download-right position-relative"
                  key={index}
                >
                  <i className="fa fa-file  fa-2x mr-3"></i>
                  <a href={item.file} download target="_blank">
                    {item.name}
                    <i className="fa fa-cloud-download-alt icon-download"></i>
                  </a>
                </div>
              ))}
            <div className="pt-5 pb-5 pl-5">
              <span className="textContentItem ">{text}</span>
              <p className="textTimeRight">
                {sender ? `${sender} - ` : ''}
                {moment(timestamp).format('LT')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightMessageChat
