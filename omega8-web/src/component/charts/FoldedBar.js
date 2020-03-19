import React, { PureComponent } from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import { format } from 'util';


const formateTime = (time) => {
    if (time) {
        let hour = parseInt(time / 3600) ? `${parseInt(time / 3600)}小时` : ''
        let minnut = parseInt(time % 3600 / 60) ? `${parseInt(time % 3600 / 60)}分钟` : ''
        // let second = parseInt(time % 60)
        return `${hour} ${minnut}`
      } else {
        return 0
      }
}
export default class FoldedBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const { showLegend, isFull, data, unit } = this.props
        const options = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    return `${params[0].seriesName}: ${params[0].value}<br/>
                    ${params[1].seriesName}: ${params[1].value}<br/>${params[2].seriesName}: ${formateTime(params[2].value)}<br/>`
                },
                backgroundColor: '#ffffff',
                borderColor: '#d5d5d5d5',
                padding: [5, 10],
                borderWidth: 1,
                textStyle: {
                    color: '#32363A',
                    fontSize: 12,
                }
            },
            color: ['#5899DA', '#E8743B'],
            legend: {
                show: showLegend,
                data: ['当前C区货量', '预计到来量', '预计工作时长'],
                heigth: '15px',
                textStyle: {
                    fontSize: '12',
                },
                itemWidth: 16,
                itemHeight: 16,
                top: 10,
                right: 10,
                orient: 'vertical',
            },
            grid: {
                left: '3%',
                right: '130',
                bottom: '5%',
                containLabel: true
            },
            xAxis: [
                {
                    axisTick: {
                        show: false,
                    },
                    type: 'category',
                    data: data && data.chartData.Ylist,
                }
            ],
            yAxis: [
                {
                    name : unit === 'unit' ? '箱数（箱）' : '板数（板）',
                    type: 'value',
                    // splitNumber: 8,
                    // max: 7000,
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        formatter: '{value}'
                    },
                }, {
                    // max: 7,
                    // splitNumber: 8,
                    nameLocation: 'start',
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: false,
                    },
                    type: 'value',
                    axisLabel: {
                        formatter: '{value} 小时'
                    },
                }
            ],
            dataZoom: {
                type: 'slider',
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            series: [
                {
                    name: '当前C区货量',
                    type: 'bar',
                    barMaxWidth: 36,
                    stack: '当前C区货量',
                    data: data && data.chartData.series['当前C区货量'],
                },
                {
                    name: '预计到来量',
                    yAxisIndex: 0,
                    barMaxWidth: 36,
                    type: 'bar',
                    stack: '当前C区货量',
                    data: data && data.chartData.series['预计到来量'],
                }, {
                    name: '预计工作时长',
                    data: data && data.chartData.series['预计工作时长'],
                    type: 'line',
                    symbol: 'diamond',
                    yAxisIndex: 1,
                    symbolSize: [11, 11],
                    itemStyle: {
                        color: '#19A979'
                    },
                    lineStyle: {
                        color: 'transparent'
                    }
                }
            ]
        }
        return (
            <div className="charts-continer">
                <ReactEchartsCore
                    notMerge={true}
                    echarts={echarts}
                    option={options}
                    lazyUpdate={true}
                    showLoading={false}
                    style={{ width: '100%', height: isFull ? window.document.body.offsetHeight - 100 : window.document.body.offsetHeight - 300 }}
                />
            </div>

        )
    }
}