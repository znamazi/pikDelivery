import React from 'react'
import axios from 'utils/axios'
import { toast } from 'react-toastify'

export const submit = async (state) => {
  try {
    let url = state.mode === 'edit' ? state.urlEdit : state.urlAdd
    const customTimeFrames = state.customTimeFrames.filter(
      (item) => item.type === 'add'
    )
    let data = {
      deletedId: state.deletedId,
      timeFrames: state.timeFrames,
      customTimeFrames
    }

    let response = await axios.post(url, { ...data })
    return response.data
  } catch (error) {
    const errorMessage = error?.response?.data?.errorCode
      ? t(`server_errors.${error?.response?.data?.errorCode}`)
      : error?.response?.data?.message
    toast.error(errorMessage)
  }
}
