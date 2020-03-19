import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import ActionInner from '../../action-inner';
import Pie from '../../charts/pie';
import { connect } from 'react-redux'
import Span from '../../../../../../components/span'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        whName: '全仓',
        whId: [''],
        warehouseProp: { name: '全部', id: '' },
        warehouse: ['全仓'],
        chartData: null
      };
    }

    getDoorStatus(whsId) {
        window.axios({
            url: '/chart/doors/doorstatus' + ( whsId ? '?whsId=' + whsId : '' ),
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({
                    chartData: this.formatChartData( JSON.parse(res.data) )
                })
            })
        })
    }

    formatChartData(data) {
        const keyMap = {
            'trailed': '已摆柜',
            'untrail': '未摆柜',
            'loading': '装柜中',
            'totrail': '等待摆柜',
        }
        let result = []
        for(let key in data) {
            result.push({
                value: data[key],
                name: keyMap[key]
            })
        }
        return result
    }

    getStatisticWarehouse() {
        window.axios({
            url: '/statistic/warehouse/all',
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = this.state.warehouse.concat(res.data.map((item) => { return '仓库' + item.whsId }))
                this.setState({
                    whId: this.state.whId.concat(res.data.map((item) => { return item.whsId })),
                    warehouse: data
                })
            })
        })
    }

    componentDidMount() {
        this.getStatisticWarehouse()
        this.getDoorStatus()
    }

    actionClick = (item, key) => {
        const index = this.state.whId[key];
        this.getDoorStatus(index)
        this.setState({
            whName: item,
            warehouseProp: { name: index === '' ? '全部' : item, id: index }
        });
        this.refs.actionsPop.close()
    }

    render() {
        const { whName, warehouse, chartData, warehouseProp } = this.state;
        const { doors } = this.props;
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">装柜与摆柜状态</div>
                        <div className="count"><span className="strong">{ doors.full }</span></div>
                        <span className="name">即将满柜数量</span>
                    </div>
                    <div className="meta">
                        <span className="label">总计柜门数量</span>
                        <div>{ doors.all }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <span 
                        className="select-link"
                        onClick={ () => this.refs.actionsPop.open() }
                        >{ whName }<i className="sap-icon icon-slim-arrow-down"></i></span>
                        { 
                            this.props.pageLoaded && chartData ? 
                            <Pie wh={ warehouseProp } label={true} linkTo={ this.props.linkTo } chartData={ chartData } /> : <div className="span-wrapper"><Span /></div>
                             }
                        <Actions ref="actionsPop">
                            <ActionInner handleClick={ this.actionClick }  list={ warehouse } />
                        </Actions>
                </CardContent>
            </Card>
        )
    }
  };  
const mapDispatch = (dispatch) => {
    return {
    }
}

const mapState = (state) => {
    return {
      pageLoaded: state.board.pageLoaded
    }
}

  export default connect(mapState, mapDispatch)(CardContext)