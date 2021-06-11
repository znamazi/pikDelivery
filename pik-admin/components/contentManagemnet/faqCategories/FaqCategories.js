import React, { useState, useEffect, useMemo } from 'react'
import { isEqual } from 'lodash'
import DataTablePage from '../../../metronic/dataTable/DataTablePage'
import { sortCaret, headerSortingClasses } from '../../../metronic/_helpers'
import * as columnFormatters from './column-formatters'
import * as FaqCatUIHelpers from './FaqCatUIHelpers'
import DataTableContexts from '../../../metronic/contexts/DataTableContexts'
import actions from 'store/actions'
import { connect } from 'react-redux'
import AddButton from './AddButton'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import { Alert } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'

const FaqCategories = (props) => {
  const { t } = useTranslation()

  const [listLoading, setListLoading] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

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
    if (!props.faqCategories.success && props.faqCategories.message)
      toast.error(props.faqCategories.message)
  }, [JSON.stringify(props.queryParams)])

  const { getConfirmation } = useConfirmationDialog()

  const handleConfirm = async (row) => {
    const confirmed = await getConfirmation({
      title: t('pages.content.delete_faq_category'),
      message: t('pages.content.message_delete_faq_category', {
        title: row.category
      })
    })
    if (confirmed) {
      props.DelData(row._id)
    }
  }
  const columns = [
    {
      dataField: 'category',
      text: t('Table.columns.Category'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '450px' }
      }
    },
    {
      dataField: 'type',
      text: t('Table.columns.type'),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      headerStyle: (colum, colIndex) => {
        return { width: '110px' }
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
      options: Object.keys(FaqCatUIHelpers.statusTitle).map((item) => (
        <option key={item} value={FaqCatUIHelpers.statusTitle[item]}>
          {item}
        </option>
      )),
      textMuted: 'filter_by_status'
    }
  ]
  console.log('propsssssssssss', props)
  return (
    <>
      <DataTableContexts.Provider
        value={{
          listLoading: listLoading,
          columns: columns,
          totalCount: props.faqCategories.totalCount,
          entities: props.faqCategories.faqCategories,
          title: 'faq_categories',
          filter: filter,
          component: 'faqCats',
          actionDisptachFilter: 'UPDATE_QUERY_PARAMS_FAQCATS',
          UIHelper: FaqCatUIHelpers,
          showButtonFilter: true,
          showPagination: true,
          Tools: AddButton,
          changeTypeStatus: () => changeTypeStatus(),
          changeStatus: changeStatus,

          callBack: (value) => setFilter(value)
        }}
      >
        <div className="m-3">
          {props.faqCategories.deleteAction && (
            <Alert severity={props.faqCategories.success ? 'success' : 'error'}>
              {props.faqCategories.message}
            </Alert>
          )}
        </div>

        <DataTablePage />
      </DataTableContexts.Provider>
    </>
  )
}

export default connect(
  (state) => ({
    faqCategories: state.faqCats,
    queryParams: state.faqCats.queryParams
  }),
  (dispatch) => ({
    getData: (queryParams) => {
      dispatch({
        type: actions.FAQCAT_REQUESTED,
        payload: { ...queryParams }
      })
    },
    DelData: (id) => {
      dispatch({
        type: actions.FAQCAT_DELETE,
        payload: id
      })
    },
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS_FAQCATS,
        payload: queryParams
      })
    }
  })
)(FaqCategories)
