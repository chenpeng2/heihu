import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
            },
            options: {
                // tooltip : {
                //     trigger: 'axis',
                //     axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                //         type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                //     }
                // },
                legend: {
                    left: 'left',
                    x: 'left',
                    data:['已完成', '标准完成'],
                    heigth: '5px',
                    textStyle: {
                        fontSize: '10',
                    },
                    itemWidth: 12,
                    itemHeight: 7,
                    bottom: 20,
                },
                grid: {
                    left: '3%',
                    right: '5%',
                    top: '3%',
                    containLabel: true
                },
                xAxis:  {
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
                yAxis: {
                    type: 'category',
                    data: ['仓库1','仓库2','仓库3','仓库4','仓库5','仓库6','仓库7'],
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
                series: [
                    {
                        name: '已完成',
                        type: 'bar',
                        itemStyle: {
                            color: '#5899DA'
                        },
                        barWidth: 24,
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '标准完成',
                        data: [130, 122, 131, 154, 110, 330, 410],
                        type: 'line',
                        symbol: 'rect',
                        symbolSize: [2, 20],
                        itemStyle: {
                            color: '#1866B4'
                        },
                        lineStyle: {
                            color: 'transparent'
                        }
                    }
                ]
            }
        }
    }

    onChartClick = (param) => {
        // this.props.linkTo(param);
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.state.options }
                lazyUpdate={true}
                onEvents={ this.state.EventsDict }
                style={{width: '100%', height: '400px'}}
            />
        )
    }
}