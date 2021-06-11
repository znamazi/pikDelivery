import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

const SelectSearch = ({
  label,
  name,
  value,
  handleChange,
  isLoading,
  options,
  handleSearch,
  updateData
}) => {
  return (
    <>
      {/* <label className="font-size-xs mt-4 ml-1">{label}</label>
      <CreatableSelect
        className="basic-single"
        classNamePrefix="select"
        value={options.filter((item) => item.label == value)}
        isLoading={isLoading}
        isClearable
        isSearchable
        name={name}
        options={options}
        onInputChange={(data) => handleSearch(data)}
        onChange={(data) => handleChange(data)}
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => {
            const { zIndex, ...rest } = base
            return { ...rest, zIndex: 9999 }
          }
        }}
      /> */}
      <Autocomplete
        freeSolo
        options={options}
        value={value}
        name={name}
        onChange={(e) => handleChange(e.target.innerText)}
        onInputChange={(event, newInputValue) => handleSearch(newInputValue)}
        onBlur={(event) => updateData(event.target.value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            margin="normal"
            variant="outlined"
          />
        )}
      />
    </>
  )
}

export default SelectSearch
