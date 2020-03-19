import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/chart/bar';

import chartConfig from '../../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
            }
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

    onChartClick = (param) => {
        const seriesName = param.seriesName;
        const id = this.props.chartData.series[seriesName].key
        this.props.linkTo && this.props.linkTo({
            warehouse: {
                name: param.name,
                id: this.props.chartData.$Ylist[param.dataIndex]
            },
            depart: { name: seriesName, id: id }
        });
    }

    getOptions = () => {
        const props = this.props;
        return {
            tooltip : {
                ...chartConfig.tooltip,
                show: props.toolTip
            },
            legend: {
                ...chartConfig.legend,
                data: props.chartData.legend
            },
            grid: {
               ...chartConfig.grid
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
                data: props.chartData.Ylist
            },
            series: this.formatSeries()
        }
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                onEvents={ this.state.EventsDict }
                style={{width: '100%', height: '400px'}}
            />
        )
    }
}