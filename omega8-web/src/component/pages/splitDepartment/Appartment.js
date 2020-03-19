import React from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import NativeSelect from '@material-ui/core/NativeSelect'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'

import request from 'utils/urlHelpers'
import BarColors from 'component/charts/BarChartColors'
//action
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { getWarehouseList } from 'redux/selectors/outPartSelector'
import { typeToText, BootstrapInput } from 'utils/chartHelper'

class AppartmentPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      department: '',
      unit: '',
      area: '',
      showLegend: true,
      reviewData: {
        isLoading: true,
      },
      defaultSelect: false,
    }
  }

  formateBarData = (data) => {
    const chartData = {
      Xlist: [],
      series: {
        'total': [],
      },
    }
    const keys = {
      ...data[0]
    }
    for (let dataKey in keys) {  // 得到series 里的所以key  typeToText 是一个数据到文本的转换
      const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
      if (typeToText[dataKey]) {
        chartData.series[key] = []
      }
    }
    data && data.forEach(item => {
      chartData.Xlist.push(`${item.time}`)
      for (let dataKey in keys) {
        const key = typeToText[dataKey] ? typeToText[dataKey] : dataKey
        if (typeToText[dataKey]) {
          chartData.series[key] && chartData.series[key].push(item[dataKey] || 0)
        }

      }
    })
    return chartData
  }

  getData(isNextDay) {
    return request({
      url: `/chart/receipt/appointment/time/detail?isnextday=${isNextDay}`,
      method: 'GET'
    }).then(res => {
      if (!res) {
        this.setState({
          reviewData: {
            isLoading: false,
            fetchError: true,
          }
        })
        return
      }
      const data = JSON.parse(res.data)
      const reviewData = {}
      reviewData.chartData = this.formateBarData(data)
      this.setState({
        reviewData,
      })
    })
  }

  componentDidMount() {
    const { warehouseList, location } = this.props
    const keys = location.state
    if (!keys) {
      this.getData(this.state.defaultSelect)
      return
    }
    const { isNextDay } = keys
    if (!warehouseList) {
      this.props.getWareHouseList()
    }
    this.setState({
      isNextDay,
    }, () => {
      this.getData(isNextDay)
    })
  }

  changeTime = (event) => {
    this.setState({
      isNextDay: event.target.value,
    }, () => {
      this.getData(this.state.isNextDay)
    })
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
    const { fullScreen, showLegend, reviewData } = this.state
    return (
      <div className="main-panel-light">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#/splitControl">
            分货部实时状态
          </Link>
          <span>预约未到货量详情</span>
        </Breadcrumbs>
        <div className={fullScreen ? 'full-chart-mask' : ''}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <div className="actions-container">
              <div className="left-actions">
                <NativeSelect
                  className="chart-select"
                  value={this.state.isNextDay}
                  onChange={this.changeTime}
                  input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                  <option value={false}>今天</option>
                  <option value={true}>明天</option>
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
              {reviewData.isLoading ?
                <div className="loading-content"> <CircularProgress /> </div>
                : reviewData.fetchError ?
                  <div className="empty-content">没有数据</div> :
                  <BarColors
                    unit={'箱'}
                    isPreview={false}
                    showLegend={showLegend}
                    isManyColor={false}
                    data={reviewData.chartData}
                    hasFull={false}
                    isFullScreent={fullScreen}
                    getData={this.getData}
                    manyType={true}
                    defaultType={1}
                    hideControl={true} />}

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
)(AppartmentPage);