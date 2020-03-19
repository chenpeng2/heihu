import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ParetoChart from 'component/charts/pareto'
import Dashboard from 'component/charts/dashboard'
import PieChart from 'component/charts/pie'
import LineChart from 'component/charts/line'
// import BlDatePicker from 'component/common/datePicker'
import { Menu, Dropdown, Icon, Select, DatePicker, Affix } from 'antd'
// import { PrimaryButton } from 'office-ui-fabric-react';
import HeatMapChart from 'component/charts/heatMap'
import $ from 'jquery'
// import MaterialTable from 'material-table'
const { Option } = Select;
const viewList = [{
      name: '标准视图',
      id: 1,
      isDefault: false,
},{
    name: '视图1',
    id: 2,
    isDefault: false,
},{
    name: '视图2',
    id: 3,
    isDefault: false,
}]

  
class ReportPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentView: '标准视图',
            isShowFilter: true,
            isPingFilters: false,
        }
    }
    changeView(e,view) {
        console.log('change the view')
        e.stopPropagation()
        $('.ant-dropdown').addClass('ant-dropdown-hidden')
        if (view && view.name) {
            this.setState({
                currentView: view.name,
            })
        }
        
    }

   
    onChange(val) {
        console.log(`selected ${val}`);
        this.setState({
            number: val,
        })
    }

    onChangeReason(val) {
        console.log(`selected ${val}`);
        this.setState({
            scrapReason: val,
        })
    }

    submitSearch() {
        const { currentDate, number, scrapReason } = this.state
        const data = {
            scrapReason,
            currentDate,
            number,
        }
        console.log('submit', data)
    }

    handleClick(e) {
        e.stopPropagation()
    }

    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter } = this.state
        this.setState({
            isShowFilter: !isShowFilter
        })
    }

    pingFilters() {
        const { isPingFilters } = this.state
        this.setState({
            isPingFilters: !isPingFilters,
        })
    }

    changeDate(date, time) {
        this.setState({
            currentDate: date.format('YYYY-MM-DD'),
        })
    }

    renderMenuList() {
        return (
        <Menu>
            {
                viewList.map((view, index) => {
                    return (<div key={index}>
                        <Menu.Item>
                            <a ref="view" onClick={e => this.changeView(e, view)}>
                                {view.name}
                            </a>
                        </Menu.Item>
                    </div>)
                })
            }
           
        </Menu>
        )
    }

    stopPagation = (event) => {
        var e=event || window.event;
        if (e && e.stopPropagation){
            e.stopPropagation();
        } else{
            e.cancelBubble=true;
        }
    }
    renderFilters() {
        const menu = this.renderMenuList()
        const { isShowFilter } = this.state
        return (
            <div className="subtitle-panel data-report">
            <div className="subtitle-header" onClick={(e)=>this.changeFilter(e)}>
                <Dropdown overlay={menu} trigger={['click']}>
                    <a className="ant-dropdown-link" ref="dropdown" href="#" onClick={(e)=>this.handleClick(e)}>
                        {this.state.currentView} <Icon type="down" />
                    </a>
                </Dropdown>
                <div onClick={this.stopPagation}>
                    {/*<PrimaryButton*/}
                        {/*allowDisabledFocus={true}*/}
                        {/*text="按钮"*/}
                        {/*onClick={console.log('an')}*/}
                        {/*style={{width: 69,height: 26,borderRadius: 4}}*/}
                    {/*/>*/}
                    {/*<PrimaryButton*/}
                        {/*allowDisabledFocus={true}*/}
                        {/*text="按钮"*/}
                        {/*onClick={console.log('an')}*/}
                        {/*style={{width: 69,height: 26,borderRadius: 4}}*/}
                    {/*/>*/}
                    <Icon type="shrink"></Icon>
                </div>
            </div>
            <div className="filter-content" style={{display: isShowFilter ? "flex" : "none"}}>
                <div className="filter-item">
                    <p className="lable">检测日期:</p>
                    <DatePicker onChange={this.changeDate.bind(this)}size={'default'} />
                </div>
                <div className="filter-item">
                    <p className="lable">轮毂型号:</p>
                    <Select
                    mode="multiple"
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a person"
                    optionFilterProp="children"
                    onChange={this.onChange.bind(this)}
                    filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    >
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                        <Option value="tom">Tom</Option>
                    </Select>
                </div>
                <div className="filter-item">
                    <p className="lable">报废原因:</p>
                    <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a person"
                    optionFilterProp="children"
                    onChange={this.onChangeReason.bind(this)}
                    filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    >
                        <Option value="jack">Jack</Option>
                        <Option value="lucy">Lucy</Option>
                        <Option value="tom">Tom</Option>
                    </Select>
                </div>
                {/*<PrimaryButton*/}
                    {/*allowDisabledFocus={true}*/}
                    {/*text="更新"*/}
                    {/*onClick={this.submitSearch.bind(this)}*/}
                {/*/>*/}
            </div>
            <div className="bottom-botton-panel">
                    <div className="button-panel">
                        <div className="button" onClick={(e)=>this.changeFilter(e)}>
                            {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}

                        </div>
                        <div className="button" onClick={this.pingFilters.bind(this)}>
                            <img src={require('../../asstes/images/Icon-ping.png')}/>
                        </div>
                    </div>
                </div>
        </div>
        )
    }
      
    render() {
        const { isPingFilters } = this.state
        return (
        <div>
            { isPingFilters ? 
            <Affix offsetTop={0}>
                {this.renderFilters()}
            </Affix> :  
            <div> { this.renderFilters()} </div>
            }
           
            <div className="main-panel-light">
                <Dashboard showArrow = {false}/>
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md10 ms-lg8">
                        <div className="chart-title">
                            报废数量积累
                            <p className="time-text">2019-06-12</p>
                        </div>
                        <ParetoChart />
                    </div>
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md2 ms-lg4">
                        <div className="chart-title">
                            报废原因
                            <p className="time-text">2019-06-12</p>
                        </div>
                        <PieChart />
                    </div>
                </div>
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <div className="chart-title">
                            报废数量趋势
                            <p className="time-text">2019-06-12<span>今天</span></p>
                        </div>
                        <LineChart />
                    </div>
                </div>
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <div className="chart-title">
                            报废分布
                            <p className="time-text">2019-06-12</p>
                        </div>
                        <HeatMapChart />
                    </div>
                </div>
                
            </div>
        </div>)
    }
}

const mapStateToProps = (state) => {
    return {
      list: state,
    }
}
  
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(RouteActionCreators, dispatch);
}
  
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReportPage)