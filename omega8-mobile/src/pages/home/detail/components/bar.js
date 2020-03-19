import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';

import chartConfig from '../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            height: props.chartData.Ylist.length
         }
    }

    formatSeries() {
        let result = [], color = chartConfig.blueColorList[3];
        for(let key in this.props.chartData.series) {
            let item = this.props.chartData.series[key];
            result.push({
                name: key,
                type: 'bar',
                stack: 'stack',
                itemStyle: {
                    color: color[item.key]
                },
                barWidth: 24,
                data: item.data
            })
        }
        return result
    }

    getOptions() {
        const { chartData } = this.props;
        return {
            tooltip : {
                ...chartConfig.tooltip,
                formatter: ( (param) => {
                    this.onChartClick(param[0]);
                    return null
                })
            },
            legend: {
                ...chartConfig.legend,
                data: chartData.legend
            },
            grid: {
               ...chartConfig.grid,
               top: 10
            },
            xAxis:  {
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
            yAxis: {
                ...chartConfig.yAxis,
                type: 'category',
                data: chartData.Ylist
            },
            series: this.formatSeries()
        }
    }

    onChartClick = (param) => {
        const series = this.props.chartData.series;
        let item = { name: param.name, data: [] }
        for(let key in series) {
            item.data.push({
                name: key,
                count: series[key].data[param.dataIndex]
            })
        }
        this.props.handleClick(item)
    }

    onChartReadyCallback(chart) {
        setTimeout(() => {
            chart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: chart.getOption().yAxis[0].data.length - 1
            })
        }, 300)
    }

    render() {
        const { chartData } = this.props;
        const height = 40 * chartData.Ylist.length
        return (
            <ReactEchartsCore
                ref="echart"
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                onChartReady={ this.onChartReadyCallback}
                style={{width: '100%', height: (height + 50) + 'px'}}
            />
        )
    }
}