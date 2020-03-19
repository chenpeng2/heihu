import React from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import NativeSelect from '@material-ui/core/NativeSelect'
import IconButton from '@material-ui/core/IconButton'

import request from 'utils/urlHelpers'
import { departmentToText, textToDepartValue, BootstrapInput } from 'utils/chartHelper'
import BarListChart from 'component/charts/BarList'
//action
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { getWarehouseList } from 'redux/selectors/outPartSelector'

class WillComePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      department: '',
      unit: 'plt',
      area: '',
      showLegend: true,
    }
  }

  getChartData(data) {
    const chartData = {
      Ylist: [],
      series: {},
    }
    const keys = {
      ...data[0].departmentInfo
    }
    delete keys.whsId // whsId 是X轴坐标，不需要放入series data中
    for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
      const key = departmentToText[dataKey] ? departmentToText[dataKey] : dataKey
      if (dataKey !== 'whsId') {
        chartData.series[key] = []
      }
    }
    data && data.forEach(item => {
      chartData.Ylist.unshift(`门店${item.storeId}`)
      if (this.state.department) {
        chartData.series[departmentToText[this.state.department]].unshift(item.departmentInfo[this.state.department] || 0)
      } else {
        for (let key in departmentToText) {
          chartData.series[departmentToText[key]] && chartData.series[departmentToText[key]].unshift(item.departmentInfo[key] || 0)
        }
      }
    })
    if (this.state.department) {
      for (let key in chartData.series) {
        if (key !== departmentToText[this.state.department]) {
          delete chartData.series[key]
        }
      }
    }
    return chartData
  }

  getData() {
    const { department, area, unit } = this.state
    const departmentParam = department ? `&department=${department}` : ''
    const warehouseParam = area ? `warehouse=${area}` : ''
    const unitParam = unit ? `&unit=${unit}` : ''
    return request({
      url: `/chart/store/expectedarrival?${warehouseParam}${departmentParam}${unitParam}`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 0) {
        const willComeData = {}
        const data = JSON.parse(res.data)
        willComeData.total = data.total
        willComeData.chartData = this.getChartData(data.detail)
        this.setState({
          willComeData,
        })
        return JSON.parse(res.data)
      } else {
        return {
          fetchError: true,
        }
      }
    })
  }

  handleClick(event) {
    event.preventDefault();
    alert('You clicked a breadcrumb.');
  }

  changeDepartment = (event) => {
    this.setState({
      department: event.target.value,
    }, () => {
      this.getData()
    })
  }

  changeArea = (event) => {
    this.setState({
      area: event.target.value,
    }, () => {
      this.getData()
    })
  }

  changeUnit = (event) => {
    this.setState({
      unit: event.target.value,
    }, () => {
      this.getData()
    })
  }

  setSelect = () => {
    const departmentSelects = []
    for (let key in textToDepartValue) {
      departmentSelects.push({
        value: textToDepartValue[key],
        title: key
      })
    }
    this.setState({
      departmentSelects,
    })
  }

  componentDidMount() {
    const { warehouseList, location } = this.props
    const keys = location.state
    if (!warehouseList) {
      this.props.getWareHouseList()
    }
    if (!keys) {
      this.getData()
    } else {
      const { area, department } = keys
      const areaId = area && parseInt(area.substring(area.length - 1, area.length))
      this.setState({
        area: areaId,
        department: textToDepartValue[department],
      }, () => {
        this.getData()
      })
    }
    this.setSelect()
  }

  toFullScreen = () => {
    this.setState({
      fullScreen: true,
    })
  }

  toSysScreen = () => {
    this.setState({
      fullScreen: false,
    })
  }

  setLegend = () => {
    const { showLegend } = this.state
    this.setState({
      showLegend: !showLegend,
    })
  }

  render() {
    const { fullScreen, showLegend, willComeData, departmentSelects } = this.state
    const { warehouseList } = this.props
    const { chartData } = willComeData || {}
    return (
      <div className="main-panel-light">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#/outControl">
            出货部实时状态
          </Link>
          <span>预计到来工作量详情</span>
        </Breadcrumbs>
        <div className={fullScreen ? 'full-chart-mask' : ''}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <div className="actions-container">
              <div className="left-actions">
                <NativeSelect
                  className="chart-select"
                  value={this.state.area}
                  onChange={this.changeArea}
                  input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                  <option value={''}>所有仓库</option>
                  {
                    warehouseList && warehouseList.map((warehouse, index) => {
                      return <option key={index} value={warehouse.whsId}>{`仓库${warehouse.whsId}`}</option>
                    })
                  }
                </NativeSelect>
                <NativeSelect
                  className="chart-select"
                  value={this.state.department}
                  onChange={this.changeDepartment}
                  input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                > {
                    departmentSelects && departmentSelects.map((department, index) => {
                      return <option key={index} value={department.value}>{department.title}</option>
                    })
                  }
                </NativeSelect>
                <NativeSelect
                  className="chart-select"
                  defaultValue={''}
                  onChange={this.changeUnit}
                  input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                  <option value={'plt'}>板</option>
                  <option value={'unit'}>箱</option>
                </NativeSelect>
              </div>
              <div className="right-actions">
                <IconButton aria-label="legend" onClick={this.setLegend}>
                  <i className="sap-icon icon-legend" ></i>
                </IconButton>
                {!fullScreen && <IconButton aria-label="legend" onClick={this.toFullScreen}>
                  <i className="sap-icon icon-full-screen"></i>
                </IconButton>}
                {fullScreen && <IconButton aria-label="legend" onClick={this.toSysScreen}>
                  <i className="sap-icon icon-sys-monitor"></i>
                </IconButton>}
              </div>
            </div>

            <Paper className="item-content">
              {/* {(this.state.area || this.state.department) &&
                <div className="filters">
                  过滤器：{this.state.area && `C-${this.state.area},`} {this.state.department}
                </div>} */}
              <BarListChart showLegend={showLegend} data={chartData} isFull={fullScreen} getData={this.getData} hideControl={true} />
            </Paper>
          </Grid>
        </div>
        <br />
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  const list = getWarehouseList(state)
  return {
    list: state,
    warehouseList: list
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WillComePage);