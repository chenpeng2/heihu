import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import ActionInner from '../../action-inner';
import Bar from '../../charts/bar';

import { connect } from 'react-redux'
import { setWarehouse } from '../../../../../../redux/action'
import Span from '../../../../../../components/span'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
          actionOpend: false,  // 解决radio组件嵌在action里无法默认选中的问题
          total: '',  // 总计
          utd: '',  // 单位
          chartData: null,  // 图表数据
          depart: { name: '全部', id: '' },
          department: '所有部门',
          departList: ['所有部门', '收货部', '分货部', '稳定库存']
      };
    }

    componentDidMount() {
        this.initData()
    }

    actionClick = (item, key) => {  // 切换部门
        const index =  ( key === 0 ? '' : (key-1) );
        this.initData( index );
        this.setState({
            department: item,
            depart: { name: index === '' ? '全部' : item, id: index }
        });
        this.refs.actionsPop.close()
    }

    initData(depart) { // 获取total , charData
        const department = (typeof depart === 'undefined' ? '' : '?department=' + depart)
        window.axios({
            url: '/chart/warehouse/expectedarrival' + department,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
                this.setState({
                    utd: data.utd,
                    total: data.total,
                    chartData: this.formatData(data.detail)
                })
            })
        })
    }

    formatData(data) {
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
            $Ylist: [],
            Ylist: [],
            legend: [],
            series: {}
        };
        const warehouse = [];
        data.forEach(item => {
            chartData.Ylist.unshift('仓库' + item.whsId);
            chartData.$Ylist.unshift(item.whsId);
            warehouse.unshift({name: '仓库' + item.whsId, id: item.whsId});
            for(let i in item.departmentInfo) {
                let departName = this.state.departList[+i+1];
                if(!chartData.series[departName]) {
                    chartData.legend.push(departName)
                    chartData.series[departName] = {
                        key: i,
                        data: []
                    }
                }
                chartData.series[departName].data.unshift(item.departmentInfo[i])
            }
        })
        this.props.setWarehouse(warehouse)
        return chartData
    }

    render() {
        const { pageLoaded } = this.props;
        const { total, chartData, department, actionOpend, departList, depart, utd } = this.state
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">预计到来工作量/板数</div>
                        <div className="count"><span className="strong">{ typeof total === 'undefined' ? '--' : total }</span> { utd }</div>
                        <span className="name">总计</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <span 
                        className="select-link"
                        onClick={ () => this.refs.actionsPop.open() }
                        >{ department }<i className="sap-icon icon-slim-arrow-down"></i></span>
                        { 
                            pageLoaded && chartData ? 
                            <Bar depart={ depart } chartData={ chartData } linkTo={ this.props.linkTo } />
                             : 
                             <div className="span-wrapper"><Span /></div>
                        }
                        <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                            {
                                actionOpend ? 
                                <ActionInner
                                    handleClick={ this.actionClick } 
                                    list={ departList } /> : ''
                            }
                        </Actions>
                </CardContent>
            </Card>
        )
    }
  };

const mapDispatch = (dispatch) => {
    return {
        setWarehouse(list) {
            return dispatch(setWarehouse(list))
        }
    }
}

const mapState = (state) => {
    return {
      depart: state.department.depart,
      pageLoaded: state.board.pageLoaded
    }
}

  export default connect(mapState, mapDispatch)(CardContext)