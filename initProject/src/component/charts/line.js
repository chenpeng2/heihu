import React from 'react';
import ReactEcharts from 'echarts-for-react';  // or var ReactEcharts = require('echarts-for-react');
import '../../styles/charts.less'
import NoData from 'component/common/noData'

class LineChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data1:[],
            data2:[],
            itemAllArr:[]
        }
    }
    filterData = (data) => {
        let newArr = [];
        return data.filter((item, index, arr) => {
            if(newArr.indexOf(item.date) == -1){
                newArr.push(item.date)
                return true
            }
            return false
        })
    }
    filterData2 = (data) => {
        let newArr = [];
        return data.filter((item, index, arr) => {
            if(newArr.indexOf(item.type) == -1){
                newArr.push(item.type)
                return true
            }
            return false
        })
    }
    doPaintLine(wheelScrapTrend){
        const data1 = this.filterData(wheelScrapTrend);
        const data2 = this.filterData2(wheelScrapTrend);
        let itemAllArr = [];
        data2.map((item,index)=>{
            const typeName = item.type;
            const itemArr = [];
            //用个小数组把日期也存起来
            const haveDateArr = [];
            wheelScrapTrend.filter((item, index,arr)=>{
                if(typeName == item.type){
                    itemArr.push(item.countNum);
                    haveDateArr.push(item.date);
                    return true
                }
                return false
            })
            if(itemArr.length<data1.length){
                data1.map((item,index)=>{
                    if(haveDateArr.indexOf(item.date) == -1){
                        itemArr.splice(index,0,0)
                    }
                })
            }
            itemAllArr.push(itemArr)
        })
        this.setState({data1,data2,itemAllArr})
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.wheelScrapTrend != this.props.wheelScrapTrend){
            this.doPaintLine(nextProps.wheelScrapTrend)
        }
    }
    getLocalItem(){
        const smallView = localStorage.getItem('smallView');
        const leftDistance = smallView?'120px':'3%';
        const rightDistance = smallView?'120px':'4%';
        this.setState({leftDistance,rightDistance})
    }
    UNSAFE_componentWillMount(){
        this.getLocalItem()
        window.addEventListener('resize',() => {
            this.getLocalItem()
        })
    }
    render() {
        const {isWheelScrapTrend,styleSheet}=this.props;
        const {data1,data2,itemAllArr,leftDistance,rightDistance} =this.state;
        let series = [],headerTitle = [];
        const maxN = Math.max.apply(null,itemAllArr.join(',').split(','));
        data2.map((item,index)=>{
            series.push({
                name:item.type,
                type:'line',
                data: itemAllArr[index],
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    normal: {
                        width: 2
                    }
                },
                markLine: {
                       data: [[
                           {coord:[data1[data1.length-1].date,0],symbol:'symbol',symbolSize:12,symbolRotate:180},
                           {coord:[data1[data1.length-1].date,maxN+30],symbol:'none',symbolSize:0}//如何获取grid上侧最大值，目前是写死的
                       ]],
                       lineStyle:{
                           type:'dashed'
                       }
                    }
            })
            headerTitle.push(item.type)
        })
        let xAData = [];
        data1.map((item,index)=>{
            xAData.push(item.date)
        })
        const myOptions = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: headerTitle,
                left: 60,
                bottom: 0
            },
            grid: {
                left: styleSheet && this.props.styleSheet.left ? this.props.styleSheet.left : leftDistance,
                right: styleSheet && this.props.styleSheet.right ? this.props.styleSheet.right : rightDistance,
                bottom: styleSheet && this.props.styleSheet.bottom ? this.props.styleSheet.bottom : '12%',
                containLabel: true
            },
            color: ['#5899DA', '#E8743B','#1AA979','#ED4A7B','#945ECF','#13A4B4','#525DF4','#6C8893','#EE6868','#2F6497'],
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAData
            },
            yAxis: {
                type: 'value',
                name: '报废数量'
            },
            series: series
        }
        return (
            <div className="charts-continer">
                {xAData.length?<ReactEcharts option={myOptions} style={{width: '100%',height:styleSheet.height}}/>
                    :<NoData height={styleSheet.height} isWheelScrapTrend={isWheelScrapTrend}/>}
            </div>)
    }
}

export default LineChart
