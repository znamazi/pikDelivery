import React, { useState } from 'react'
import axios from '../../utils/axios'
import AsyncSelect from 'react-select/async'
// import { toast } from 'react-toastify'
import { Alert } from '@material-ui/lab'

const BusinessSearch = ({ selectBusiness }) => {
  const [loading, setLoading] = useState(false)
  const [searchData, setSearchData] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const onBlur = () => {
    selectBusiness(value)
  }

  const onInputChange = (data) => {
    if (data) {
      setSearchData(data)
    }
  }
  const loadOptions = async () => {
    try {
      setLoading(true)
      let response = await axios.post('admin/invoice/businessList', {
        business: searchData
      })
      response = response.data
      console.log({ response })
      if (response.sucess) {
        let options = response.businesses.map((item) => ({
          value: item,
          label: item.name + ' - ' + item.email
        }))
        setLoading(false)
        return options
      } else {
        setError(response.message)
      }
    } catch (error) {
      setLoading(false)

      console.log('error happend', error)
    }
  }
  return (
    <>
      <div className="p-3">
        {error && <Alert severity="error">{error}</Alert>}
      </div>

      <AsyncSelect
        cacheOptions
        isClearable
        isLoading={loading}
        loadOptions={loadOptions}
        onInputChange={onInputChange}
        onChange={(e) => setValue(e?.value)}
        onBlur={onBlur}
        menuPortalTarget={document.body}
        placeholder="Search & Select One Business"
        styles={{
          menuPortal: (base) => {
            const { zIndex, ...rest } = base
            return { ...rest, zIndex: 9999 }
          }
        }}
      />
    </>
  )
}

export default BusinessSearch
