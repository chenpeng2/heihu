import React from 'react';
//echarts compoment
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import '../../styles/charts.less'
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import NativeSelect from '@material-ui/core/NativeSelect'
import {  BootstrapInput } from 'utils/chartHelper'

class PieChart extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            EventsDict: {
                'click': this.onChartClick,
                'legendselectchanged': this.onChartLegendselectchanged
            },
            isAll: true,
            area: ''
        }
    }

    onChartClick = (params) => {
        const { name } = params
        const { detailPath } = this.props
        const { isAll, area } = this.state
        const parms = {
            tag: name,
            isAll, 
            area,
        }
        if (name !== '未摆柜') {
            this.props.getTodetail(detailPath, parms)
        }
    }

    changeArea = (event) => {
        const { getData } = this.props
        this.setState({
            area: event.target.value
        })
        getData(event.target.value)
    }

    changeStore = (event) => {
        const { getData } = this.props
        this.setState({
            isAll: event.target.value
        })
        getData(event.target.value)
    }


    componentWillReceiveProps (nextProps) {
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
            this.setState({
                isAll: true,
                area: '',
            })
        }
    }

    render() {
        const { data, valueToText } = this.props
        const values = []
        for (let key in data) {
            const item = {
                value: data[key],
                name: valueToText[key]
            }
            values.push(item)
        }

        const myOptions = {
            tooltip: {
                trigger: 'item',
                formatter: "状态： {b} <br/> 数量： {c}",
                backgroundColor: '#ffffff',
                borderColor: '#d5d5d5d5',
                padding: [5, 10],
                borderWidth: 1,
                textStyle: {
                    color: '#32363A',
                    fontSize: 12,
                }
            },
            grid: {
                left: '1%',
                right: '1%',
                top: '0',
                bottom: '1%',
            },
            color: ['#5899DA', '#E8743B', '#19A979', '#ED4A7B', '#945ECF', '#13A4B4', '#525DF4', '#BF399E', '#6C8893', '#EE6868', '#2F6497'],
            legend: {
                x: 'left',
                data: data.lengend || Object.values(valueToText),
                heigth: '5px',
                textStyle: {
                    fontSize: '12',
                },
                selectedMode: false,
                padding: 5,
                itemWidth: 10,
                itemHeight: 7,
                bottom: 10,
                left: 10,
            },
            series: [
                {
                    type: 'pie',
                    radius: ['30%', '70%'],
                    center: ['50%','40%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '20',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: values
                }
            ]
        }

        const { warehouseList, selectList } = this.props
        return (
            <div className="charts-continer-little">
                {selectList ?
                    <NativeSelect
                        className="chart-select"
                        value={this.state.isAll}
                        onChange={this.changeStore}
                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                    >
                        {
                            selectList && selectList.map((option, index) => {
                                return <option key={index} value={option.value}>{option.title}</option>
                            })
                        }
                    </NativeSelect> :
                    <NativeSelect
                        className="chart-select"
                        value={this.state.area}
                        onChange={this.changeArea}
                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                    >
                        <option value={''}>全仓</option>
                        {
                            warehouseList && warehouseList.map((warehouse, index) => {
                                return <option key={index} value={warehouse.whsId}>{`仓库${warehouse.whsId}`}</option>
                            })
                        }
                    </NativeSelect>}

                <ReactEchartsCore
                    notMerge={true}
                    echarts={echarts}
                    lazyUpdate={true}
                    showLoading={false}
                    option={myOptions}
                    style={{ width: '100%', height: '280px' }}
                    onEvents={this.state.EventsDict}
                />
            </div>)
    }
}

export default PieChart
