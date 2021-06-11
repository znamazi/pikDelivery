import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import { connect } from 'react-redux'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as columnFormatters from './column-formatters'
import * as FaqUIHelpers from './FaqUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import AddButton from './AddButton'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import { useTranslation } from 'react-i18next'

const Faqs = (props) => {
  const { t } = useTranslation()

  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  // useEffect(() => {
  //   prepareFilter()
  // }, [props.tab])
  // const prepareFilter = () => {
  //   let newQueryParams = { ...props.queryParams }
  //   newQueryParams = {
  //     ...newQueryParams,
  //     pageNumber: 0
  //   }
  //   if (!isEqual(newQueryParams, props.queryParams)) {
  //     props.updateQueryParams(newQueryParams)
  //   }
  // }

  const setFilter = (value) => {
    if (!isEqual(value, props.queryParams)) {
      props.updateQueryParams(value)
    }
  }
  const changeTypeStatus = () => {
    setActiveMenu('')
    setChangeStatus(false)
  }
  useEffect(() => {
    setListLoading(true)
    props.getData(props.queryParams)
    setListLoading(false)
    if (!props.faqsInfo.success && props.faqsInfo.message)
      toast.error(props.faqsInfo.message)
  }, [JSON.stringify(props.queryParams)])

  let optionCategory = [...props.faqCategories]
  if (!optionCategory.find((item) => item.category === 'All'))
    optionCategory.unshift({ _id: '', category: 'All' })

  const { getConfirmation } = useConfirmationDialog()

  const handleConfirm = async (row) => {
    const confirmed = await getConfirmation({
      title: t('pages.content.delete_faq'),
      message: t('pages.content.message_delete_faq', { question: row.question })
    })
    if (confirmed) {
      await props.DelData(row._id)
      // toast.success('Faq Deleted Successfuly')
    }
  }

  const columns = [
    {
      dataField: 'type',
      text: t('Table.columns.type'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '100px' }
      }
    },
    {
      dataField: 'question',
      text: t('Table.columns.Question'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '450px' }
      }
    },
    {
      dataField: 'categoryInfo.category',
      text: t('Table.columns.Category'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'published',
      text: t('Table.columns.status'),
      sort: false,
      sortCaret: sortCaret,
      formatter: columnFormatters.StatusColumnFormatter,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '120px' }
      }
    },
    {
      dataField: 'actionsEdit',
      text: t('Table.columns.Action'),
      sort: false,
      formatter: columnFormatters.ActionColumnFormatter,
      headerStyle: (colum, colIndex) => {
        return { width: '81px' }
      }
    },
    {
      dataField: 'actionsDel',
      text: '',
      sort: false,
      formatter: columnFormatters.DeleteColumnFormatter,
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => handleConfirm(row)
      }
    }
  ]
  const filter = [
    {
      name: 'query',
      type: 'input',
      col: 4,
      placeholder: 'search_by_keyword',
      textMuted: 'search_by_name'
    },
    {
      name: 'published',
      type: 'select',
      col: 2,
      options: Object.keys(FaqUIHelpers.statusTitle).map((item) => (
        <option key={item} value={FaqUIHelpers.statusTitle[item]}>
          {item}
        </option>
      )),
      textMuted: 'filter_by_status'
    },
    {
      name: 'type',
      type: 'select',
      col: 2,
      options: Object.keys(FaqUIHelpers.faqTypes).map((item, index) => (
        <option key={index} value={FaqUIHelpers.faqTypes[item]}>
          {item}
        </option>
      )),
      textMuted: 'filter_by_type'
    },
    ,
    {
      name: 'category',
      type: 'select',
      col: 2,
      options: optionCategory.map((item, index) => (
        <option key={index} value={item['_id']}>
          {item['category']}
        </option>
      )),
      textMuted: 'filter_by_category'
    }
  ]

  return (
    <>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.faqsInfo.totalCount,
          entities: props.faqsInfo.faqsList,
          title: 'faq',
          filter: filter,
          component: 'faqs',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_FAQS',
          UIHelper: FaqUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          Tools: AddButton,
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,

          callBack: (value) => setFilter(value)
        }}
      >
        <DataTablePage />
      </DataTableContexts.Provider>
    </>
  )
}

export default connect(
  (state) => ({
    faqsInfo: state.faqs,
    faqCategories: state.faqCats.faqCategories,
    queryParams: state.faqs.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.FAQ_REQUESTED,
        payload: { ...queryParams }
      })
    },
    DelData: (id) => {
      dispatch({
        type: actions.FAQ_DELETE,
        payload: id
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_FAQS,
        payload: queryParams
      })
    }
  })
)(Faqs)
