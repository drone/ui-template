import React, { useState, useEffect, useMemo } from 'react'
import { Container } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import moment from 'moment'
import merge from 'lodash-es/merge'

import { useStrings } from 'framework/strings'

import styles from './PolicyDashboard.module.scss'

export interface ExecutionsChartProps {
  titleText: React.ReactNode
  customTitleCls?: string
  data?: Array<{
    time?: number
    success?: number
    failed?: number
    warnings?: number
  }>
  loading: boolean
  range: number[]
  onRangeChange(val: number[]): void
  yAxisTitle: string
  successColor?: string
}

export default function PoliciesBarChart({
  series,
  loadingChart
}: {
  series: { date: number; error_count: number; pass_count: number; warning_count: number }[] | any
  loadingChart: boolean
}) {
  const { getString } = useStrings()

  const [range, setRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

  const transformedData: Array<{
    time?: number
    success?: number
    failed?: number
    warnings?: number
  }> = []

  if (series && series.length) {
    series.map((v: { date: number; error_count: number; pass_count: number; warning_count: number }) => {
      transformedData.push({
        time: v.date,
        success: v.pass_count,
        failed: v.error_count,
        warnings: v.warning_count
      })
    })
  }

  const { data, loading } = {
    data: transformedData,
    loading: loadingChart
  }

  const chartData = useMemo(() => {
    if (data?.length) {
      return data.map(val => ({
        time: val?.time,
        success: val?.success,
        failed: val?.failed,
        warnings: val?.warnings
      }))
    }
  }, [data])

  return (
    <ExecutionsChart
      titleText={getString('executionsText')}
      data={chartData}
      loading={loading}
      range={range}
      onRangeChange={setRange}
      yAxisTitle=""
    />
  )
}

export function ExecutionsChart({ data, range, yAxisTitle }: ExecutionsChartProps) {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>()
  generateEmptyChartData(range[0], range[1], {
    yAxis: {
      title: { text: yAxisTitle }
    }
  })
  useEffect(() => {
    const successful: number[] = []
    const warnings: number[] = []
    const failed: number[] = []
    const empty: number[] = []
    const xCategories: string[] = []
    if (data?.length) {
      let totalMax = data.reduce((acc, curr) => {
        return Math.max(curr.success! + curr.failed!, acc)
      }, 0)
      totalMax = Math.ceil(Math.max(totalMax * 1.2, 10))
      data.forEach(val => {
        warnings.push(val.warnings!)
        successful.push(val.success!)
        failed.push(val.failed!)
        empty.push(totalMax - val.success! - val.failed!)
        xCategories.push(moment(val.time).format('YYYY-MM-DD'))
      })
      setChartOptions(
        merge({}, defaultChartOptions, {
          chart: {
            animation: false
          },
          yAxis: {
            endOnTick: false,
            title: {
              text: yAxisTitle
            }
          },
          xAxis: {
            categories: xCategories
          },
          series: [
            // {
            //   type: 'column',
            //   name: 'empty',
            //   color: '#f3f3fa',
            //   showInLegend: false,
            //   enableMouseTracking: false,
            //   data: empty
            // },

            {
              type: 'column',
              name: 'Evaluations passed',
              color: '#00ade4',
              data: successful,
              legendIndex: 2
            },
            {
              type: 'column',
              name: 'Warnings',
              color: '#fcc026',
              data: warnings,
              legendIndex: 3
            },
            {
              type: 'column',
              name: 'Evaluations failed',
              color: '#e43326',
              data: failed,
              legendIndex: 1
            }
          ]
        })
      )
    }
  }, [data])

  return (
    <Container className={styles.main}>
      <Container className={styles.chartWrapper}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    </Container>
  )
}

function generateEmptyChartData(start: number, end: number, config: Highcharts.Options): Highcharts.Options {
  let n = moment(end).diff(start, 'days')
  const empty: number[] = []
  const xCategories: string[] = []
  while (n-- > 0) {
    xCategories.push(moment().subtract(n, 'days').format('YYYY-MM-DD'))
    empty.push(10)
  }
  return merge({}, defaultChartOptions, config, {
    xAxis: {
      labels: { enabled: false },
      categories: xCategories
    },
    yAxis: {
      labels: { enabled: false }
    },
    series: [
      {
        type: 'column',
        name: 'nn',
        color: '#f3f3f3',
        showInLegend: false,
        enableMouseTracking: false,
        data: empty
      }
    ]
  })
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    type: 'column',
    height: 215
  },
  title: {
    text: ''
  },
  credits: undefined,
  legend: {
    align: 'right',
    verticalAlign: 'top',
    symbolHeight: 12,
    symbolWidth: 19,
    symbolRadius: 7,
    squareSymbol: false,
    itemStyle: {
      fontWeight: '400',
      fontSize: '10',
      fontFamily: 'Inter, sans-serif'
    }
  },
  xAxis: {
    title: {
      text: 'Date',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    labels: {
      enabled: true,
      // autoRotation: false,
      formatter: lab => moment(lab.value).date() + '',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    tickWidth: 0,
    lineWidth: 0
  },
  yAxis: {
    labels: {
      enabled: true,
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    title: {
      text: '',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    gridLineWidth: 0,
    lineWidth: 0
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 6,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  }
}
