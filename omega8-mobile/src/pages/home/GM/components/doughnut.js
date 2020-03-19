import React, { PureComponent } from 'react';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';

export default class Bar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {}
    }

    getOptions() {
        const { data } = this.props;
        return {
            tooltip: {
                show: false
            },
            legend: {
                show: false
            },
            color: ['#107F3E', '#DC0D0E', '#E9730C'],
            series: [
                {
                    name: '',
                    type: 'pie',
                    hoverAnimation: false,
                    stillShowZeroSum: false,
                    center: ['50%', '50%'],
                    radius: ['75%', '90%'],
                    label: {
                        normal: {
                            show: false,
                        }
                    },
                    data: data ? data : [0, 0, 0]
                }
            ]
        }
    }

    render() {
        return (
            <ReactEchartsCore
                echarts={echarts}
                option={ this.getOptions() }
                notMerge={true}
                lazyUpdate={true}
                style={{width: '100%', height: '100%'}}
            />
        )
    }
}