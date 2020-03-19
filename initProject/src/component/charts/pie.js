import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
import NoData from 'component/common/noData'

class PieChart extends React.Component {
    render() {
        const { wheelScrapPie, styleSheet, isWheelScrapPie } = this.props;
        let proportion = wheelScrapPie && wheelScrapPie.proportion?wheelScrapPie.proportion:[];
        let xDimension = wheelScrapPie && wheelScrapPie.xDimension?wheelScrapPie.xDimension:[];
        let xDimensionArr = [],newPieArr = [],otherSum=0;
        if(xDimension.length&&proportion.length){
            proportion.map((item,index)=>{
                if(item>0.003){
                    xDimensionArr.push(xDimension[index]);
                    newPieArr.push({value:item,name:xDimension[index]})
                }else{
                    otherSum = otherSum + item;
                }
                if(index == proportion.length -1){
                    xDimensionArr.push(xDimension[index]);
                    newPieArr.push({value:otherSum,name:'其他'})
                }
            })
        }
        const myOptions = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            color: ['#5899DA', '#E8743B','#1AA979','#ED4A7B','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            legend: {
                show: false,
                orient: 'vertical',
                left: 'right',
                data: xDimensionArr,
                textStyle: {
                    fontSize: 13
                }
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    clickable: true,　　　　　　 //是否开启点击
                    minAngle: 5,           　　 //最小的扇区角度（0 ~ 360），用于防止某个值过小导致扇区太小影响交互
                    avoidLabelOverlap: true,   //是否启用防止标签重叠策略
                    hoverAnimation: true,　　  //是否开启 hover 在扇区上的放大动画效果。
                    silent: false,　　　　　　　　//图形是否不响应和触发鼠标事件
                    radius: ['30%', '60%'],
                    center: ['50%', '52%'],
                    data: newPieArr,
                    label: {
                        align: 'left',
                        normal: {
                            formatter(value) {
                                // 10 6 这些你自定义就行
                                const ellipsisIndex = localStorage.getItem('pieShow');
                                if(ellipsisIndex){return}
                                var v = value.name.substring(0, 6) + '...'
                                return value.name.length > 10 ? v : value.name
                                // let text = v.percent + '%' + '' + v.name
                                // if (text.length <= 8) {
                                //     return text;
                                // } else if (text.length > 8 && text.length <= 16) {
                                //     return text = `${text.slice(0, 8)}\n${text.slice(8)}`
                                // } else if (text.length > 16 && text.length <= 24) {
                                //     return text = `${text.slice(0, 8)}\n${text.slice(8, 16)}\n${text.slice(16)}`
                                // } else if (text.length > 24 && text.length <= 30) {
                                //     return text = `${text.slice(0, 8)}\n${text.slice(8, 16)}\n${text.slice(16, 24)}\n${text.slice(24)}`
                                // } else if (text.length > 30) {
                                //     return text = `${text.slice(0, 8)}\n${text.slice(8, 16)}\n${text.slice(16, 24)}\n${text.slice(24, 30)}\n${text.slice(30)}`
                                // }
                            }
                        }
                    }
                }
            ]
        }
        return (
        <div className="charts-continer">
            {xDimension.length?<ReactEcharts option={myOptions} style={{width: '100%',height: styleSheet.height}}/>
                :<NoData height={styleSheet.height} isWheelScrapPie={isWheelScrapPie}/>}
        </div>)
    }
}

export default PieChart
