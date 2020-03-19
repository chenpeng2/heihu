import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import chartConfig from '../../../../../components/charts.config'
export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            colorMap: [
                chartConfig.redColorList[1], 
                chartConfig.yellowColorList[1], 
                chartConfig.greenColorList[1], 
                chartConfig.blueColorList[1], 
                ['#848F94'], 
                ['#BAC1C4']
            ],
            EventsDict: {
                'click': this.onChartClick,
            }
        }
    }

    getOption() {
        const props = this.props;
        const isUtil = props.isUtil;
        return {
            tooltip : {
                ...chartConfig.tooltip,
                show: false,
            },
            legend: {
                show: false
            },
            grid: {
                ...chartConfig.grid,
                top: '8%'
             },
            yAxis:  {
                type: 'value',
                minInterval: 1,
                max: isUtil ? 100 : null,
                ...chartConfig.xAxis,
                axisLabel: {
                    color: '#4A4A4A',
                    formatter: function(data) {
                        return (isUtil ? data + '%' : (data >= 10000 ? data/1000 + 'K' : data))
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: props.chartData.Ylist,
                ...chartConfig.yAxis,
                type: 'category',
            },
            series: this.formatSeries()
        }
    }

    formatSeries() {
        const isUtil = this.props.isUtil;
        const series = this.props.chartData.series;
        const { colorMap } = this.state
        const total = [{
                name: 'total',
                type: 'bar',
                itemStyle: {
                    color: function(param) {
                        if (series['utilization'][param.dataIndex] >= 80) {
                            return colorMap[0][0]
                        } else if (series['utilization'][param.dataIndex] > 50 && series['utilization'][param.dataIndex] < 80) {
                            return colorMap[1][0]
                        } else if (series['utilization'][param.dataIndex] <= 50) {
                            return colorMap[2][0]
                        }
                    }
                },
                barWidth: 24,
                data: isUtil ? series['utilization'] : series['pltTotal']
            }]
        if(!isUtil) {
            total.push({
                name: 'spot',
                data: series['slotTotal'],
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
        return total
    }

    onChartClick = (param) => {
        this.props.linkTo({
            warehouse: {
                name: param.name,
                id: this.props.chartData.$Ylist[param.dataIndex]
            },
            department: this.props.depart,
            warehouseList: this.props.chartData.$Ylist
        });
    }

    render() {
        const { legend } = this.props.chartData;
        const { colorMap } = this.state
        return (
            <div>
                <ReactEchartsCore
                    echarts={echarts}
                    option={ this.getOption() }
                    notMerge={true}
                    lazyUpdate={true}
                    onEvents={ this.state.EventsDict }
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