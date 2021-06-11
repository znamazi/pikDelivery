import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const faqWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('/admin/content/faq/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.FAQ_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.FAQ_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.FAQ_FAILED, payload: error })
  }
}
export const faqWatcher = function* () {
  yield takeLatest(actions.FAQ_REQUESTED, faqWorker)
}
const faqWorkerDel = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post(`/admin/content/faq/delete/${action.payload}`)
    })
    yield put({
      type: actions.FAQ_DELETE_SUCCESS,
      payload: result.data
    })
  } catch (error) {
    yield put({ type: actions.FAQ_FAILED, payload: error })
  }
}

export const faqWatcherDel = function* () {
  yield takeLatest(actions.FAQ_DELETE, faqWorkerDel)
}
