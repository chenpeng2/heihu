import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';

import chartConfig from '../../../../../../components/charts.config'

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        const len = Object.keys(props.chartData.series).length
        this.state = {
            colorMap: [
                chartConfig.redColorList[len], 
                chartConfig.yellowColorList[len], 
                chartConfig.greenColorList[len], 
                chartConfig.blueColorList[1], 
                ['#848F94'], 
                ['#BAC1C4']
            ]
        }
    }

    getOptions() {
        const { chartData } = this.props;
        return {
            tooltip : {
                ...chartConfig.tooltip
            },
            legend: {
                show: false
            },
            grid: {
                ...chartConfig.grid,
                top: '5%',
                bottom: '5%'
             },
            yAxis:  {
                ...chartConfig.xAxis,
                type: 'value',
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
                ...chartConfig.yAxis
            },
            series: this.getSeries(chartData.series)
        }
    }

    getSeries(series) {
        const { used } = this.props.chartData;
        const limit  = this.props.chartData.series_1['满载'];
        // const { colorMap } = this.state
        const len = Object.keys(this.props.chartData.series).length
        const colorMap = [
            chartConfig.redColorList[len], 
            chartConfig.yellowColorList[len], 
            chartConfig.greenColorList[len], 
            chartConfig.blueColorList[1], 
            ['#848F94'], 
            ['#BAC1C4']
        ]
        let result = [];
        for(let key in series) {
            const item = series[key];
            if( key !== '满载' ) {
                result.unshift({
                    name: key,
                    type: 'bar',
                    stack: 'stack',
                    itemStyle: {
                        color: function(param) {
                            const index = param.seriesIndex;
                            const per = used[param.dataIndex]/limit[param.dataIndex]
                            if(per < 0.5) {
                                return colorMap[2][index]
                            }else if(per < 0.8) {
                                return colorMap[1][index]
                            }else {
                                return colorMap[0][index]
                            }
                        }
                    },
                    barWidth: 24,
                    data: item
                })
            }else {
                result.unshift({
                    name: key,
                    data: item,
                    type: 'line',
                    symbol: 'rect',
                    symbolSize: [20, 2],
                    itemStyle: {
                        color: '#1866B4'
                    },
                    lineStyle: {
                        color: 'transparent'
                    }
                })
            }
        }
        for(let i = result.length - 1; i >= 0; i--) {
            if(result[i].type === 'bar') {
                result[i].label = {
                    normal: {
                        ...chartConfig.barLabel.normal,
                        formatter: (param) => {
                            return used[param.dataIndex]
                        }
                    }
                }
                break;
            }
        }
        result.push({
            name: '满载',
            data: limit,
            type: 'line',
            symbol: 'rect',
            symbolSize: [20, 2],
            itemStyle: {
                color: '#1866B4'
            },
            lineStyle: {
                color: 'transparent'
            }
        })
        return result
    }

    render() {
        const { legend } = this.props.chartData;
        const { colorMap } = this.state
        return (
            <div>
                <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                lazyUpdate={true}
                notMerge={true}
                style={{width: '100%', height: '350px'}}
            />
            <div className="legend-box">
                {
                    legend && legend.map( (item, key) => 
                        <div key={key} className="item">
                            <div className={item.type} style={ { background: (colorMap[key] ? colorMap[key][0] : '') } }></div>
                            { item.name }
                        </div>
                    )
                }
            </div>
            </div>
        )
    }
}