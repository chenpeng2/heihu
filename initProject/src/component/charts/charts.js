import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
class ChartAPIComponent extends React.Component {
    getOtionTem() {
        const option = {
          tooltip: {
            trigger: 'axis',
            position: function(pt) {
              return [pt[0], '10%'];
            }
          },
          title: {
            left: 'center',
            text: '棚内种植温度记录'
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.props.batchModel.WSinfo
              ? this.props.batchModel.WSinfo.map((item, index) => {
                let shijian = new Date(parseInt(item.ctime) * 1000).toLocaleString().substr(0, 9).replace(/\//g, "-");
                return shijian
              })
              : []
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
          },
          dataZoom: [
            {
              type: 'inside',
              start: 0,
              end: 10
            }, {
              start: 0,
              end: 10,
              handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '100%',
              handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgb(254,176,131)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
              }
            }
          ],
          series: [
            {
              name: '棚内温度',
              type: 'line',
              smooth: true,
              symbol: 'none',
              sampling: 'average',
              itemStyle: {
                normal: {
                  color: 'rgb(255, 70, 131)'
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: 'rgb(255, 158, 68)'
                    }, {
                      offset: 1,
                      color: 'rgb(255, 70, 131)'
                    }
                  ])
                }
              },
              data: this.props.batchModel.WSinfo
                ? this.props.batchModel.WSinfo.map((item, index) => {
                  let datas = item.temper;
                  return datas
                })
                : []
            }
          ]
        }
        return option;
    }
    render() {
        function randomData() {
            now = new Date(+now + oneDay);
            value = value + Math.random() * 21 - 10;
            return {
                name: now.toString(),
                value: [
                    [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                    Math.round(value)
                ]
            }
        }
        var data = [];
        var now = +new Date(1997, 9, 3);
        var oneDay = 24 * 3600 * 1000;
        var value = Math.random() * 1000;
        for (var i = 0; i < 1000; i++) {
            data.push(randomData());
        }
        const myOptions = {
            title: {
                text: '动态数据 + 时间坐标轴'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    params = params[0];
                    var date = new Date(params.name);
                    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
                },
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '模拟数据',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: data
            }]
        }
        return (
        <div className="charts-continer" style={{width: "800px", overflowX: "scroll"}}>
            <p>test the charts....</p>
            <ReactEcharts option={myOptions}/>
        </div>)
    }
}


export default ChartAPIComponent