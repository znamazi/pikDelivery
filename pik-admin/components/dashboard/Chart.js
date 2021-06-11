import React from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { useTranslation } from 'react-i18next'

// const data = [
//   {
//     name: '7',
//     Send: 4000,
//     Request: 2400,
//     amt: 2400,
//     Availables: 1350
//   },
//   {
//     name: '8',
//     Send: 3000,
//     Request: 1398,
//     amt: 2210,
//     Availables: 2100
//   },
//   {
//     name: '9',
//     Send: 2000,
//     Request: 9800,
//     amt: 2290,
//     Availables: 3320
//   },
//   {
//     name: '10',
//     Send: 2780,
//     Request: 3908,
//     amt: 2000,
//     Availables: 1478
//   },
//   {
//     name: '11',
//     Send: 1890,
//     Request: 4800,
//     amt: 2181,
//     Availables: 5203
//   },
//   {
//     name: '12',
//     Send: 2390,
//     Request: 3800,
//     amt: 2500,
//     Availables: 1236
//   },
//   {
//     name: '13',
//     Send: 3490,
//     Request: 4300,
//     amt: 2100,
//     Availables: 2500
//   },
//   {
//     name: '14',
//     Send: 4000,
//     Request: 2400,
//     amt: 2400,
//     Availables: 4100
//   },
//   {
//     name: '15',
//     Send: 3000,
//     Request: 1398,
//     amt: 2210,
//     Availables: 2587
//   },
//   {
//     name: '16',
//     Send: 2000,
//     Request: 9800,
//     amt: 2290,
//     Availables: 3258
//   },
//   {
//     name: '17',
//     Send: 2780,
//     Request: 3908,
//     amt: 2000,
//     Availables: 2478
//   },
//   {
//     name: '18',
//     Send: 1890,
//     Request: 4800,
//     amt: 2181,
//     Availables: 2500
//   },
//   {
//     name: '19',
//     Send: 2390,
//     Request: 3800,
//     amt: 2500,
//     Availables: 2600
//   },
//   {
//     name: '20',
//     Send: 3490,
//     Request: 4300,
//     amt: 2100,
//     Availables: 5200
//   }
// ]

const Chart = ({ weekIncome }) => {
  const { t } = useTranslation()
  return (
    <BarChart
      width={900}
      height={400}
      data={weekIncome}
      margin={{
        top: 20,
        left: 20,
        right: 30,
        bottom: 5
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={t('pages.dashboard.Request')} stackId="a" fill="#FFA800" />
      <Bar dataKey={t('pages.dashboard.Send')} stackId="a" fill="#0073e9" />
      <Bar dataKey={t('pages.common.Availables')} stackId="a" fill="#1BC5BD" />
    </BarChart>
  )
}

export default Chart
