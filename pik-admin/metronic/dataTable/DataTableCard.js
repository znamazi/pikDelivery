import React, { useMemo, useEffect, useContext } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar
} from '../partials/controls'
import Table from './Table'
import CircularProgress from '@material-ui/core/CircularProgress'
import DataTableContexts from '../contexts/DataTableContexts'
import ExportData from './ExportData'
import { useDTUIContext } from './DTUIContext'
import Filter from './Filter'

export const DataTableCard = (props) => {
  const loadingStyle = {
    display: 'block',
    position: 'absolute',
    left: '50%',
    top: '70%'
  }
  const DTUIContext = useDTUIContext()
  const DTUIProps = useMemo(() => {
    return {
      ids: DTUIContext.ids
    }
  }, [DTUIContext])
  const DataTableContext = useContext(DataTableContexts)
  const DTProps = useMemo(() => {
    return {
      callBack: DataTableContext.callBack,
      exportUrl: DataTableContext.exportUrl,
      listLoading: DataTableContext.listLoading,
      title: DataTableContext.title,
      filter: DataTableContext.filter,
      showButtonFilter: DataTableContext.showButtonFilter,
      Tools: DataTableContext.Tools,
      exportButton: DataTableContext.exportButton,
      csvData: DataTableContext.csvData,
      Grouping: DataTableContext.Grouping,
      changeStatus: DataTableContext.changeStatus,
      changeTypeStatus: DataTableContext.changeTypeStatus,
      component: DataTableContext.component,
      actionDisptachFilter: DataTableContext.actionDisptachFilter
    }
  }, [DataTableContext])
  let content = DTProps.listLoading ? (
    <div style={loadingStyle}>
      <CircularProgress />
    </div>
  ) : (
    <Table
      component={DTProps.component}
      actionDisptachFilter={DTProps.actionDisptachFilter}
    />
  )
  return (
    <Card>
      <CardHeader title={DTProps.title}>
        <CardHeaderToolbar>
          {DTProps.Tools && <DTProps.Tools />}
          {DTProps.exportButton && (
            <ExportData
              url={DTProps.exportUrl}
              title={DTProps.title}
              component={DTProps.component}
              actionDisptachFilter={DTProps.actionDisptachFilter}
            />
          )}
        </CardHeaderToolbar>
      </CardHeader>
      <CardBody style={{ position: 'relative' }}>
        {DTProps.filter && (
          <Filter
            filter={DTProps.filter}
            showButtonFilter={DTProps.showButtonFilter}
            changeStatus={DTProps.changeStatus}
            changeTypeStatus={DTProps.changeTypeStatus}
            component={DTProps.component}
            actionDisptachFilter={DTProps.actionDisptachFilter}
          />
        )}
        {DTUIProps.ids.length > 0 && <DTProps.Grouping />}
        {content}
      </CardBody>
    </Card>
  )
}
