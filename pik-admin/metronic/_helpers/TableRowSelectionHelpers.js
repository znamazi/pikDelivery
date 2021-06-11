import React from 'react'

function SelectionCheckbox({ isSelected, onChange }) {
  return (
    <>
      <input type="checkbox" style={{ display: 'none' }} />
      <label className="checkbox checkbox-single">
        <input type="checkbox" checked={isSelected} onChange={onChange} />
        <span />
      </label>
    </>
  )
}
const handleOnSelect = (data, props) => {
  const { ids, setIds, selectedRow, setSelectedRow } = props
  let selectedId = data._id
  if (ids.some((id) => id === selectedId)) {
    setIds(ids.filter((id) => id !== selectedId))
    setSelectedRow(selectedRow.filter((item) => item._id !== selectedId))
  } else {
    const newIds = [...ids]
    newIds.push(selectedId)
    setIds(newIds)
    setSelectedRow([...selectedRow, data])
  }
}
const handleOnSelectAll = (data, props) => {
  const { ids, setIds, setSelectedRow, entities } = props
  const isSelected =
    entities && entities.length > 0 && entities.length === ids.length
  if (!isSelected) {
    const allIds = []
    const selectedRow = []
    entities.forEach((el) => allIds.push(el._id))
    entities.forEach((el) => selectedRow.push(el))
    setSelectedRow(selectedRow)
    setIds(allIds)
  } else {
    setIds([])
    setSelectedRow([])
  }

  return isSelected
}
function groupingItemOnSelect(props) {
  const { ids, setIds, selectedRow, setSelectedRow, selectedId, row } = props
  if (ids.some((id) => id === selectedId)) {
    setIds(ids.filter((id) => id !== selectedId))
    setSelectedRow(selectedRow.filter((item) => item.id !== selectedId))
  } else {
    const newIds = [...ids]
    newIds.push(selectedId)
    setIds(newIds)
    setSelectedRow([...selectedRow, row])
  }
}

function groupingAllOnSelect(props) {
  const { isSelected, setIds, setSelectedRow, entities } = props
  if (!isSelected) {
    const allIds = []
    const selectedRow = []
    entities.forEach((el) => allIds.push(el.id))
    entities.forEach((el) => selectedRow.push(el))
    setSelectedRow(selectedRow)
    setIds(allIds)
  } else {
    setIds([])
    setSelectedRow([])
  }

  return isSelected
}

// check official documentations: https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Row%20Selection&selectedStory=Custom%20Selection%20Column%20Header%20Style&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
export function getSelectRow(props) {
  let { entities, ids, setIds, selectedRow, setSelectedRow } = props
  return {
    mode: 'checkbox',
    clickToSelect: true,
    hideSelectAll: false,
    selected: ids,
    onSelect: (data) => handleOnSelect(data, props),
    onSelectAll: (data) => handleOnSelectAll(data, props)
    // selectionHeaderRenderer: () => {
    //   const isSelected =
    //     entities && entities.length > 0 && entities.length === ids.length
    //   const props = { isSelected, entities, setIds, setSelectedRow }
    //   return (
    //     <SelectionCheckbox
    //       isSelected={isSelected}
    //       onChange={() => groupingAllOnSelect(props)}
    //     />
    //   )
    // },
    // selectionRenderer: ({ rowIndex }) => {
    //   const isSelected = ids.some((el) => el === entities[rowIndex].id)
    //   const props = {
    //     ids,
    //     setIds,
    //     selectedRow,
    //     setSelectedRow,
    //     row: entities[rowIndex],
    //     selectedId: entities[rowIndex].id
    //   }
    //   return (
    //     <SelectionCheckbox
    //       isSelected={isSelected}
    //       onChange={() => groupingItemOnSelect(props)}
    //     />
    //   )
    // }
  }
}
