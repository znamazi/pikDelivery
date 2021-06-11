import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const faqCatWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('/admin/content/faq-cat/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.FAQCAT_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.FAQCAT_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.FAQCAT_FAILED, payload: error })
  }
}
export const faqCatWatcher = function* () {
  yield takeLatest(actions.FAQCAT_REQUESTED, faqCatWorker)
}
const faqCatWorkerDel = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post(`/admin/content/faq-cat/delete/${action.payload}`)
    })
    if (result.data.success) {
      yield put({
        type: actions.FAQCAT_DELETE_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({
        type: actions.FAQCAT_DELETE_FAILED,
        payload: result.data.message
      })
    }
  } catch (error) {
    yield put({
      type: actions.FAQCAT_DELETE_FAILED,
      payload: error?.response?.data?.message
    })
  }
}

export const faqCatWatcherDel = function* () {
  yield takeLatest(actions.FAQCAT_DELETE, faqCatWorkerDel)
}
