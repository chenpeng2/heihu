import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/chart/bar';

import chartConfig from '../../../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }

    getOptions() {
        const { chartData } = this.props;
        return {
            title: {
                ...chartConfig.title
            },
            tooltip : {
                ...chartConfig.tooltip,
                formatter: ( (param) => {
                    this.onChartClick(param[0]);
                    return null
                })
            },
            legend: {
                ...chartConfig.legend,
                data: ['重货', '抛货']
            },
            grid: {
               ...chartConfig.grid,
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
                data: chartData.Ylist
            },
            series: this.getSeries(chartData.series)
        }
    }

    getSeries(series) {
        const { total } = this.props.chartData
        const nameMap = ['重货', '抛货'], colorMap = chartConfig.blueColorList[2];
        return series.map( (item, key) => {
            let labelDict = {}
            if(key >= series.length - 1) {
                labelDict = {
                    label: { 
                        normal: {
                           ...chartConfig.barLabel.normal,
                            formatter: (param) => {
                                return total[param.dataIndex]
                            }
                        }
                    }
                }
            }
            return {
                name: nameMap[key],
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    color: colorMap[key]
                },
                barWidth: 24,
                data: item,
                ...labelDict
            }
        })
    }

    onChartClick = (param) => {
        this.props.linkTo({
            isnextday: false
        });
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                lazyUpdate={true}
                style={{width: '100%', height: '400px'}}
            />
        )
    }
}