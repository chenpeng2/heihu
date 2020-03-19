import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';

import chartConfig from '../../../../../../components/charts.config';

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            colorMap: chartConfig.blueColorList[2]
        }
    }

    getOptions() {
        const { chartData } = this.props
        return {
            tooltip: {
                ...chartConfig.tooltip,
                show: true
            },
            legend: {
                data: chartData.legend,
                ...chartConfig.legend
            },
            grid: {
                ...chartConfig.grid
            },
            xAxis:  {
                type: 'value',
                ...chartConfig.xAxis,
                minInterval: 1,
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return data >= 10000 ? data/1000 + 'K' : data
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: chartData.Ylist,
                ...chartConfig.yAxis
            },
            series: this.getSeries(chartData.series)
        }
    }

    getSeries(series) {
        const { colorMap } = this.state;
        let result = [];
        for(let key in series) {
            const item = series[key];
            result.unshift({
                name: key,
                type: 'bar',
                stack: 'stack',
                itemStyle: {
                    color: function(param) {
                        const index = param.seriesIndex;
                        return colorMap[index]
                    }
                },
                barWidth: 24,
                data: item
            })
        }
        return result
    }

    onChartClick = (param) => {
        
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                lazyUpdate={true}
                notMerge={true}
                style={{width: '100%', height: '400px'}}
            />
        )
    }
}