import React from 'react'
import Head from 'next/head'

const HeadPage = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  )
}

export default HeadPage
