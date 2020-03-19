import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';

import chartConfig from '../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
            }
        }
    }

    getOptions() {
        const { chartData, isnextday } = this.props;
        const time = new Date();
        const timeStr = (isnextday ? '明天 ' : '今天 ') + time.getFullYear() + '年' + (time.getMonth() + 1) +'月' + ( +time.getDate() + (isnextday ? 1 : 0) ) + '日'
        return {
            title: {
                ...chartConfig.title,
                text: '箱数  ' + timeStr
            },
            legend: {
                ...chartConfig.legend,
                data:['重货', '抛货']
            },
            tooltip : {
                ...chartConfig.tooltip,
                formatter: ( (param) => {
                    this.onChartClick(param[0]);
                    return null
                })
            },
            grid: {
               ...chartConfig.grid,
               left: '0',
               top: '10%'
            },
            yAxis:  {
                ...chartConfig.xAxis,
                type: 'value',
                minInterval: 1,
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return data >= 10000 ? data/1000 + 'K' : data
                    }
                }
            },
            xAxis: {
                ...chartConfig.yAxis,
                type: 'category',
                data: chartData.Ylist,
                axisLabel: {
                    rotate: '-45'
                }
            },
            series: this.getSeries(chartData.series)
        }
    }

    getSeries(series) {
        const nameMap = ['重货', '抛货'], colorMap = chartConfig.blueColorList[2];
        return series.map( (item, key) => {
            return {
                name: nameMap[key],
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    color: colorMap[key]
                },
                barMaxWidth: 24,
                data: item
            }
        })
    }

    onChartClick = (param) => {
        const nameMap = ['重货', '抛货']
        const series = this.props.chartData.series;
        let result = { name: param.name, data: [] }
        series.forEach( (item, key) => {
            result.data.push({
                name: nameMap[key],
                count: item[param.dataIndex]
            })
        })
        this.props.handleClick(result)
    }

    onChartReadyCallback(chart) {
        setTimeout(() => {
            chart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: 0
            })
        }, 300)
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                lazyUpdate={true}
                onEvents={ this.state.EventsDict }
                onChartReady={ this.onChartReadyCallback}
                style={{width: '100%', height: '400px'}}
            />
        )
    }
}