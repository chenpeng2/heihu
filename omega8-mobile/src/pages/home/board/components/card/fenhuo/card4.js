import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import ActionInner from '../../action-inner';
import Pie from '../../charts/pie';
import { connect } from 'react-redux'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        actionOpend: false,
        data: {},
        chartData: null,
        model: '全部',
        models: ['全部', '京东 & 社区店']
      };
    }

    formatChartData(data) {
        const keyMap = {
            'h4': '超时4h',
            'h10': '超时10h',
            'h24': '超时24h',
            'h48': '超时48h',
        }
        let result = []
        for(let key in data) {
            if(key in keyMap) {
                result.push({
                    value: data[key],
                    name: keyMap[key]
                })
            }
        }
        return result
    }

    getTimeout(isAll) {
        window.axios({
            url: '/chart/receipt/receipting/timeout/overview?isAll=' + isAll,
            success: (res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = JSON.parse(res.data)
               this.setState({
                   data,
                   chartData: this.formatChartData(data)
               })
            })
        })
    }

    actionClick = (item, key) => {  // 切换
        this.getTimeout(key === 0)
        this.setState({
            model: item
        });
        this.refs.actionsPop.close()
    }

    componentDidMount() {
        this.getTimeout(true)
    }

    render() {
        const { chartData, model, models, actionOpend, data } = this.state;
        const { pageLoaded, linkTo } = this.props
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">超时待分拣货量</div>
                        <div className="count"><span className="strong">{ data.total }</span> { data.utd }</div>
                        <span className="name">即将满柜数量</span>
                    </div>
                    <div className="meta">
                        <span className="label"> 京东 & 社区店超时数量</span>
                        <div>{ data.jdSuperTotal }{ data.utd }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <span 
                        className="select-link"
                        onClick={ () => this.refs.actionsPop.open() }
                        >{ model }<i className="sap-icon icon-slim-arrow-down"></i></span>
                        { pageLoaded && chartData ? <Pie isAll={ model === '全部' } label={true} chartData={ chartData } linkTo={ linkTo }/> : '' }
                        <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                            { 
                                actionOpend ? 
                                <ActionInner
                                    handleClick={ this.actionClick } 
                                    list={ models } /> : '' 
                            }  
                        </Actions>
                </CardContent>
            </Card>
        )
    }
}; 
const mapDispatch = (dispatch) => {
    return {}
}

const mapState = (state) => {
    return {
        pageLoaded: state.board.pageLoaded
    }
}

  export default connect(mapState, mapDispatch)(CardContext)  