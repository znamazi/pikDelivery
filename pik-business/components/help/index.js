import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import axios from '../../utils/axios'

const useStyles = makeStyles({
  title: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold'
  }
})
const Help = () => {
  const classes = useStyles()

  const [categories, setCategories] = useState([])
  useEffect(() => {
    axios
      .get('business/help/list')
      .then(({ data }) => {
        if (data.success) {
          setCategories(data.categories)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }, [])

  return (
    <div className="row">
      <div className="col-lg-12 card card-custom card-stretch gutter-b">
        <div className="card-body d-flex flex-column">
          <div className="row">
            {categories.map((item) => (
              <div className="col-md-4 mb-3" key={item._id}>
                <Link href="/help/[id]" as={`/help/${item._id}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        className={classes.title}
                        color="textSecondary"
                      >
                        {item.category}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
