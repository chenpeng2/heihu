import React, { PureComponent } from 'react';
import { Card, CardHeader, CardContent, Actions } from 'framework7-react';

import { connect } from 'react-redux'

import ActionInner from '../../action-inner';
import Bar from '../../charts/bar';

import { setDoneJob } from '../../../../../../redux/action'

import Span from '../../../../../../components/span'

class CardContext extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        actionOpend: false,
        chartData: null,
        total: '--',
        utd: '',
        unit: '板数',
        $units: ['plt', 'unit'],
        units: ['板数', '箱数']
      };
    }

    getDoneJob(unit) {
        window.axios({
            url: `/chart/warehouse/donejob?unit=${unit}`,
            success: (res => {
                const data = JSON.parse(res.data);
                if(unit === 'plt') {
                    this.props.setDonejob(data.total)
                }
                this.setState({
                    total: data.total,
                    utd: data.utd,
                    chartData: this.formatChartData(data.detail)
                })
            })
        })
    }

    actionClick = (item, key) => {  // 切换部门
        this.getDoneJob(this.state.$units[key]);
        this.setState({
            unit: item
        });
        this.refs.actionsPop.close()
    }

    formatChartData(data) {
        if(!data || !data.length ) {
            return null
        }
        const chartData = {
          Ylist: [],
          legend: ['已完成'],
          series: {'已完成': { key: 1, data: []}}
        }
        data.forEach( (item) => {
            chartData.Ylist.push('仓库' + item.whsId);
            chartData.series['已完成'].data.push(item.count)
        })
        return chartData
    }

    componentDidMount() {
        this.getDoneJob('plt')
    }

    render() {
        const { chartData, total, units, unit, actionOpend, utd } = this.state
        return (
            <Card>
                    <CardHeader>
                        <div className="top">
                            <div className="title">已完成工作量</div>
                            <div className="count"><span className="strong">{ total }</span> { utd }</div>
                            <span className="name">总计</span>
                        </div>
                        {/* <div className="meta">
                            <span className="label">标准完成量</span>
                            <div>280K</div>
                        </div> */}
                    </CardHeader>
                    <CardContent>
                        <span 
                            className="select-link"
                            onClick={ () => this.refs.actionsPop.open() }
                            >{unit}<i className="sap-icon icon-slim-arrow-down"></i></span>
                            { this.props.pageLoaded && chartData ? <Bar toolTip={true} chartData={ chartData } /> : <div className="span-wrapper"><Span /></div> }
                            <Actions ref="actionsPop" onActionsOpen={ ()  => this.setState({ actionOpend: true }) }>
                                { actionOpend ? <ActionInner handleClick={ this.actionClick }  list={ units } /> : '' }
                            </Actions>
                    </CardContent>
                </Card>
        )
    }
  }; 
const mapDispatch = (dispatch) => {
    return {
        setDonejob(donwJob) {
            return dispatch(setDoneJob(donwJob))
        }
    }
}

const mapState = (state) => {
    return {
      pageLoaded: state.board.pageLoaded
    }
}

  export default connect(mapState, mapDispatch)(CardContext)