import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/line';

import chartConfig from '../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    getOptions() {
        const { chartData } = this.props;
        return {
            legend: {
                ...chartConfig.legend,
                data: chartData.legend
            },
            tooltip : {
                ...chartConfig.tooltip
            },
            grid: {
                ...chartConfig.grid
            },
            yAxis:  {
                type: 'value',
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return data >= 10000 ? data/1000 + 'K' : data
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: chartData.Ylist,
                axisTick: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: '#9B9B9B'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#E5E5E5'
                    }
                },
                axisLabel: {
                    color: '#4A4A4A',
                }
            },
            series: this.getSeries(chartData.series)
        }
    }

    getSeries(series) {
        const { solid } = this.props;
        const { legend } = this.props.chartData;
        const colorMap = ['#5899DA', '#19A979', '#E8743B'];
        return series.map( (item, key) => {
            return {
                name: legend[key],
                type: 'line',
                symbol: 'circle',
                hoverAnimation: false,
                symbolSize: 8,
                data: item,
                itemStyle: {
                    color: colorMap[key]
                },
                lineStyle: {
                    type: solid ? 'solid' : 'dashed'
                }
            }
        })
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                style={{width: '100%', height: '350px'}}
            />
        )
    }
}