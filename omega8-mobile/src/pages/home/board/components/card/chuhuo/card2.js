import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import ActionInner from '../../action-inner';
import BarLine from '../../charts/barLine'
import Span from '../../../../../../components/span'

import { connect } from 'react-redux'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        actionOpend: false,
        detail: {},
        chartData: null,
        unit: '板数',
        unitList: ['板数', '百分比']
      };
    }

    componentDidMount() {
        this.getCAreaData()
    }

    actionClick = (item, key) => {
        this.setState({
            unit: item
        });
        this.refs.actionsPop.close();
        this.formatCAreaChartData();
    }

    formatCAreaChartData = () => {
        const data = this.state.detail.detail;
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
            $Ylist: [],
            Ylist: [],
            legend: [{name: '拥堵', type: 'bar'}, {name: '可能拥堵', type: 'bar'},{name: '通畅', type: 'bar'}, {name: '满载', type: 'line'}],
            series: {pltTotal: [], slotTotal: [], utilization: []}
        }
        data.forEach(item => {
            chartData.Ylist.push('仓库' + item.whsId);
            chartData.$Ylist.push(item.whsId);
            chartData.series['pltTotal'].push(item.pltTotal);
            chartData.series['slotTotal'].push(item.slotTotal);
            chartData.series['utilization'].push( parseInt(item.utilization*100) );
        })
        return chartData
    }

    getCAreaData() {
        window.axios({
            url: `/chart/warehouse/c-status`,
            method:'GET',
            success: (res => {
                const data = JSON.parse(res.data)
                this.setState({
                    detail: data
                })
                this.setState({
                    chartData: this.formatCAreaChartData()
                })
            })
        })
    }

    getIntPercent(num) {
        if(typeof num === 'number') {
            return parseInt( num * 100 ) + '%'
        }
        return '--'
    }

    render() {
        const { actionOpend, unit, unitList, chartData } = this.state;
        const { overview } = this.state.detail;
        const { pageLoaded } = this.props;
        const isUtil = unit === '百分比'
        return (
            <Card>
                <CardHeader>
                    <div className="top">
                        <div className="title">当前C区状态</div>
                        <div className="count"><span className="strong">{ overview ? ( isUtil ? this.getIntPercent(overview.storedRate) : overview.storedTotal ) : '--' }</span>  { isUtil ? '' : overview && overview.utd }</div>
                        <span className="name">总计</span>
                    </div>
                    <div className="meta">
                        <span className="label">一期</span>
                        <div>{ overview ? ( isUtil ? this.getIntPercent(overview.group1Rate) : overview.group1 + overview.utd ) : '--' }</div>
                    </div>
                    <div className="meta">
                        <span className="label">一期</span>
                        <div>{ overview ? ( isUtil ? this.getIntPercent(overview.group2Rate) : overview.group2 + overview.utd ) : '--' }</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <span 
                        className="select-link"
                        onClick={ () => this.refs.actionsPop.open() }
                        >{ unit }<i className="sap-icon icon-slim-arrow-down"></i></span>
                        { 
                            pageLoaded && chartData ? 
                            <BarLine depart={ this.props.depart } isUtil={ isUtil } chartData={ chartData } linkTo={ this.props.linkTo } />
                             :  
                             <div className="span-wrapper"><Span /></div> 
                        }
                        <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                            {
                                actionOpend ?
                                <ActionInner handleClick={ this.actionClick }  list={ unitList } /> : ''
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
      depart: state.department.depart,
      pageLoaded: state.board.pageLoaded
    }
}

  export default connect(mapState, mapDispatch)(CardContext)