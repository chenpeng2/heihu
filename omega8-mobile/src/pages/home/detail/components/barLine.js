import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/timeline';
// import 'echarts/lib/component/dataZoom';
import 'echarts/lib/chart/bar';

import chartConfig from '../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
    }

    getOptions() {
        const { series, legend, axis } = this.props.chartData;
        const options = {
            tooltip : {
                ...chartConfig.tooltip,
                formatter: ( (param) => {
                    this.onChartClick(param[0]);
                    return null
                })
            },
            // dataZoom: [
            //     {
            //         type: 'slider',
            //         show: true,
            //         xAxisIndex: [0],
            //         showDetail: false,
            //         left: 30,
            //         right: 0,
            //         bottom: 26,
            //         startValue: 0, //数据窗口范围的起始百分比
            //         endValue: 5
            //     }
            // ],
            legend: {
                ...chartConfig.legend,
                data: legend,
                bottom: 0,
            },
            grid: {
                ...chartConfig.grid,
                left: 0,
                right: 20,
                top: 20
            },
            xAxis:  [{
                ...chartConfig.yAxis,
                type: 'value',
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return data
                    }
                }
            }, {
                ...chartConfig.yAxis,
                position: 'top',
                type: 'value',
                minInterval: 1,
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return data >= 10000 ? data/1000 + 'K' : data
                    }
                }
            }],
            yAxis: [{
                type: 'category',
                data: axis,
                ...chartConfig.xAxis
            }],
            series: this.formatSeries(series)
        }
        return options
    }

    formatSeries(series) {
        const { legend } = this.props.chartData, color = ['#5F99D9', '#E8743B', '#19A979'];
        let result = [];
        series.map( (item, key) => {
            const temp = {
                name: legend[key],
                data: item,
                xAxisIndex: 1,
                itemStyle: {
                    color: color[key]
                },
            }
            key > 1 ?
            result.push({
                ...temp,
                hoverAnimation: false,
                type: 'line',
                xAxisIndex: 0,
                symbol: 'rect',
                symbolSize: [6, 6],
                lineStyle: {
                    color: 'transparent'
                }
            }) :
            result.push({
                ...temp,
                type: 'bar',
                stack: 'stack',  
                barMaxWidth: 24,
                barMinWidth: 12
            })
        } )
        return result
    }

    onChartClick = (param) => {
        const { legend, series } = this.props.chartData;
        let item = { name: param.name, data: [] }
        for(let key = 0; key < series.length; key++) {
            item.data.push({
                name: legend[key],
                count: series[key][param.dataIndex]
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
        const height = this.props.chartData.axis.length*30;
        return (
            <ReactEchartsCore
                ref="echart"
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                onChartReady={ this.onChartReadyCallback}
                style={{width: '100%', height: height + 'px'}}
            />
        )
    }
}