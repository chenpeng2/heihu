import React from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
//utils
import { colorsList } from 'utils/chartHelper'

export default class RingChart extends React.Component{
    render() {
        const { data } = this.props
        const options = {
            tooltip: {
                show: false,
            },
            color: [colorsList['red'][3], colorsList['yellow'][3], colorsList['green'][3]],
            legend: {
                show: false,
            },
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    radius: ['50%', '60%'],
                    center: ['35%','35%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    hoverAnimation: false,
                    data:[
                        {value:data.r, name:''},
                        {value:data.y, name:''},
                        {value:data.g, name:''}
                    ]
                }
            ]
        }
        return (
            <div>
                <ReactEchartsCore
                    notMerge={true}
                    echarts={echarts}
                    option={options}
                    lazyUpdate={true}
                    showLoading={false}
                    style={{ width: '90px', height: '90px'}}
                />
            </div>

        )
    }
}

