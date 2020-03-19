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
        const { chartData, utd } = this.props;
        return {
            title: {
                ...chartConfig.title,
                top: '5%',
                text: '货量（' + utd + '）'
            },
            legend: {
               show: false
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
            //    left: '0',
               top: '15%'
            },
            yAxis:  {
                ...chartConfig.xAxis,
                type: 'value',
                max: function(value) {
                    return value.max + 5
                },
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
            series: [{
                name: '货量',
                type: 'bar',
                itemStyle: {
                    color: chartConfig.blueColorList[1][0]
                },
                barMaxWidth: 24,
                data: chartData.serie
            }]
        }
    }

    onChartClick = (param) => {
        let result = { name: param.name, data: [{
            name: '货量',
            count: param.value + this.props.utd
        }] }
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