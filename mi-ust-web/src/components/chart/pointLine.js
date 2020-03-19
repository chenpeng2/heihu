import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import Mock from 'mockjs';
class PointChar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        const data = Mock.mock({
            "array|10-10": [
                '12:00'
            ]
        })
        const myOptions = {
            title: {
                text: '',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                padding: [2, 10],
                textStyle: {
                    fontSize: 16
                }
            },
            toolbox: {
                show: true,
                feature: {
                    dataZoom: {},
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        // width: 1
                    }
                },
                axisTick: {
                    show: true,
                    alignWithLabel: true,
                    lineStyle: {
                        // width:3
                    }
                },
                axisLabel: {
                    // rotate: 45,
                    fontWeight: "bold",
                    formatter: function(value) {
                        return value.split(" ")[1];
                    }
                },
                data: ["2017-09-11 16:23:34", "2017-09-11 16:28:34", "2017-09-11 16:33:34", "2017-09-11 16:38:34", "2017-09-11 16:43:34", "2017-09-11 16:48:34", "2017-09-11 16:53:34"]
            },
            grid: {
                left: '2%',
                right: '4%',
                bottom: '4%',
                containLabel: true
            },
            visualMap: {
                show: false,
                pieces: [{
                    gt: 0,
                    lte: 120,
                    color: 'red'
                }, {
                    gt: 120,
                    lte: 200,
                    color: 'blue'
                }, {
                    gt: 200,
                    color: 'blue'
                }],
                seriesIndex: 0
            },
            yAxis: {
                type: 'value',
                name: '',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        // width: 3,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: 'red'
                            }, {
                                offset: 1,
                                color: 'blue'
                            }],
                            globalCoord: false // 缺省为 false
                        }
                    }
                },
                axisTick: {
                    lineStyle: {
                        // width: 3
                    }
                },
                axisLabel: {
                    fontWeight: "bold",
                }
            },
            series: [{
                type: 'line',
                symbol: 'circle',
                symbolSize: 6,
                smooth: true,
                animationDuration: 2000,
                itemStyle: {
                    normal: {
                        color: 'rgb(103, 99, 99)',
                        shadowBlur: 2,
                        shadowColor: "rgba(0, 0, 0, .12)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                },
                lineStyle: {
                    normal: {
                        // width: 3,
                        shadowColor: 'rgba(0,0,0,0.4)',
                        shadowBlur: 10,
                        shadowOffsetX: 4,
                        shadowOffsetY: 10
                    }
                },
                data: [130, 90, 34, 65, 89, 201, 130],
                markLine: {
                    silent: true,
                    data: [
                        {
                            name: '标准最高值',
                            yAxis: 200
                        },
                        {
                            name: '标准最低值',
                            yAxis: 120
                        },
                        ]
                },
                markPoint: {
                    label: {
                        normal: {
                            show: true,
                            align: 'center',
                            color: 'WHITE',
                            fontWeight: 100,
                            formatter: '{b}'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: {
                                type: 'radial',
                                x: 0.4,
                                y: 0.4,
                                r: 0.9,
                                colorStops: [{
                                    offset: 0,
                                    color: '#51e0a2'
                                }, {
                                    offset: 1,
                                    color: 'rgb(33,150,243)'
                                }],
                                globalCoord: false
                            },
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                            shadowBlur: 10,
                        }
                    },

                }
            }]
        }
        return (
            <div className="chart-line">
                <ReactEcharts option={myOptions}/>
            </div>
        )
    }
}

export default PointChar
