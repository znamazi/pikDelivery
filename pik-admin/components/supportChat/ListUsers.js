import React, { useState, useEffect } from 'react'
import { filterType } from './filterType'
import { myFirestore } from '../../utils/firebase'
import { AppString } from './appString'
import { useAuth } from 'utils/next-auth'
import ButtonSearch from 'metronic/partials/ButtonSearch'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const ListUsers = (props) => {
  const auth = useAuth()
  const { t } = useTranslation()

  const [users, setUsers] = useState([])
  const [userList, setUserList] = useState([])
  const [filter, setFilter] = useState('Open Conversations')
  useEffect(() => {
    getListUser()
  }, [])
  const getListUser = async () => {
    let listuser = []
    const result = myFirestore.collection(AppString.SUPPORT_TICKETS).onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === AppString.DOC_ADDED) {
            listuser.push({ ...change.doc.data(), docID: change.doc.id })
          } else if (change.type === AppString.DOC_UPDATE) {
            let index = listuser.findIndex(
              (user) => user.id === change.doc.data().id
            )

            listuser[index] = change.doc.data()
          }
        })
        setUsers([...listuser])
        const filterResult = listuser.filter((user) => !user.isClosed)
        setUserList([...filterResult])
      },
      (err) => {
        console.log('error happend', err)
      }
    )
  }
  const handleSearch = (data) => {
    const result = users.filter((user) =>
      user.nickname.toLowerCase().includes(data.toLowerCase()) ? user : ''
    )
    setUserList([...result])
    setFilter(filterType.all)
  }
  const filterChat = (filter) => {
    setFilter(filterType[filter])
    let filterResult
    switch (filter) {
      case 'open':
        filterResult = users.filter((user) => !user.isClosed)
        break
      case 'close':
        filterResult = users.filter((user) => user.isClosed)
        break
      default:
        filterResult = users
        break
    }
    setUserList([...filterResult])
  }
  let content =
    userList.length > 0
      ? userList.map((user, index) => (
          <button
            key={index}
            className={
              props.currentPeerUser &&
              props.currentPeerUser.docID === user.docID
                ? 'viewWrapItemFocused'
                : 'viewWrapItem'
            }
            onClick={() => {
              props.onChange(user)
            }}
          >
            <img
              className="viewAvatarItem"
              src={
                user.photoUrl
                  ? user.photoUrl
                  : '/assets/media/svg/default-avatar.svg'
              }
              alt="icon avatar"
            />
            <div className="viewWrapContentItem">
              <span className="textItem">{user.nickname}</span>
            </div>
            <span className={user.isClosed ? 'close' : 'open'}>
              {user.isClosed
                ? t('header_content.closed')
                : t('header_content.open')}
            </span>
          </button>
        ))
      : ''
  return (
    <div className="p-3">
      <div className="dropdown mb-5">
        <button
          className="btn btn-light dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {filter}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {Object.keys(filterType).map((item, index) => (
            <a
              className="dropdown-item"
              onClick={() => filterChat(item)}
              key={index}
            >
              {filterType[item]}
            </a>
          ))}
        </div>
      </div>
      <div className="quick-search" id="kt_quick_search_dropdown">
        <div className="quick-search-form">
          <div className="input-group">
            <ButtonSearch />

            <input
              type="text"
              className="form-control"
              placeholder="Search"
              onKeyUp={(e) => {
                e.preventDefault()
                // if (e.keyCode == 13 || e.target.value === '')
                handleSearch(e.target.value)
              }}
            />
            <div className="input-group-append">
              <span className="input-group-text">
                <i className="quick-search-close ki ki-close icon-sm text-muted"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      {content}
    </div>
  )
}

export default ListUsers
