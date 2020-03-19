import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'

class ScatterChart extends React.Component {
    render() {
        const options = {
            tooltip: {},
            toolbox: {
                left: 'center',
                feature: {
                    dataZoom: {}
                }
            },
            dataZoom: [{
                type: 'inside'
            }, {
                type: 'slider'
            }],
            xAxis: {
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: '#555'
                    }
                },
            },
            color: ['#286EB4'],
            yAxis: {
                splitLine: {
                },
                axisLine: {
                show: false,
            }},
            series: [{
                symbolSize: 20,
                data: [
                    [10.0, 8.04],
                    [8.0, 6.95],
                    [13.0, 7.58],
                    [9.0, 8.81],
                    [11.0, 8.33],
                    [14.0, 9.96],
                    [6.0, 7.24],
                    [4.0, 4.26],
                    [12.0, 10.84],
                    [7.0, 4.82],
                    [1.0, 5.68],
                    [7.0, 1.82],
                    [6.0, 3.82],
                    [4.0, 4.82],
                    [5.0, 5.82],
                    [5.0, 0.82],
                    [8.0, 6.82],
                    [9.0, 1.82],
                ],
                type: 'scatter'
            }]
        }       
        return (
        <div className="charts-continer">
            <ReactEcharts option={options} style={{width: '100%'}}/>
        </div>)
    }
}

export default ScatterChart

