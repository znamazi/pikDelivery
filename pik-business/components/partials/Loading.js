import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    width: '100px !important',
    height: '100px !important',
    marginLeft: theme.spacing(1),
    color: '#f17817'
  }
}))

const Loading = () => {
  const classes = useStyles()
  return (
    <div className="loading">
      <CircularProgress className={classes.circularProgress} />
    </div>
  )
}

export default Loading
