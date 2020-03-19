import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';

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
        const { chartData, label } = this.props;
        return {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c}"
            },
            legend: {
                left: 'left',
                right: 0,
                heigth: '5px',
                textStyle: {
                    fontSize: '10',
                },
                itemWidth: 12,
                itemHeight: 7,
                bottom: 0,
                data: chartData.map( (item) => { return item.name })
            },
            color: ['#5899DA', '#E8743B', '#19A979', '#ED4A7B'],
            series: [
                {
                    name:'',
                    type:'pie',
                    hoverAnimation: false,
                    center: ['50%', '45%'],
                    radius: ['30%', '70%'],
                    label: {
                        normal: {
                            show: label,
                            color: '#666',
                            formatter: (param) => {
                                return param.value
                            },
                        }
                    },
                    labelLine: {
                        normal: {
                        length: 7,
                        length2: 5,
                            show: label,
                            lineStyle: {
                                color: '#666'
                            }
                        }
                    },
                    data: chartData
                }
            ]
        }
    }

    onChartClick = (param) => {
        const { linkTo, isAll } = this.props;
        const keyMap = {
            '超时4h': 4,
            '超时10h': 10,
            '超时24h': 24,
            '超时48h': 48,
        }
        const items = {'即将满柜': 1, '超时': 2, '装柜中': 3, '已摆柜': 4, '等待摆柜': 5}
        if(param.name === '未摆柜') return
        linkTo && linkTo({
            isAll: isAll, 
            timerange: keyMap[param.name], 
            status: {name: param.name, id: items[param.name]},
            wh: this.props.wh
        });
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                onEvents={ this.state.EventsDict }
                style={{width: '100%', height: '250px'}}
            />
        )
    }
}