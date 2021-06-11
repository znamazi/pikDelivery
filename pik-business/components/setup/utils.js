import React from 'react'

import axios from 'utils/axios'
import { toast } from 'react-toastify'

export const submit = async (state) => {
  try {
    let url = state.mode === 'edit' ? state.urlEdit : state.urlAdd
    const customTimeFrames = state.customTimeFrames.filter(
      (item) => item.type === 'add'
    )
    let data = { ...state, customTimeFrames }
    let removeDate = [
      'date',
      'mode',
      'tab',
      'showDetails',
      'error',
      'urlEdit',
      'urlAdd',
      'group',
      'createdAt',
      'updatedAt',
      'enabled',
      'handleSubmit',
      '__v',
      '_id'
    ]
    removeDate.forEach((item) => delete data[item])

    let response = await axios.post(url, { ...data })
    return response.data
  } catch (error) {
    const errorMessage = error?.response?.data?.errorCode
      ? t(`server_errors.${error?.response?.data?.errorCode}`)
      : error?.response?.data?.message
    toast.error(errorMessage)
  }
}
