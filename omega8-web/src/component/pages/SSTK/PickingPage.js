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
import { BootstrapInput } from 'utils/chartHelper'

class PickingPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      department: '',
      unit: '',
      area: '',
      showLegend: true,
      pickingData: {
        isLoading: true,
      },
      defaultSelect: false,
    }
  }

  formateBarData = (data) => {
    const chartData = {
      Xlist: [],
      legend: ['已拣货量'],
      series: {
         '已拣货量': []
      },
    }
    data.forEach(item => {
      chartData.Xlist.push(item.tripId)
      chartData.series['已拣货量'] && chartData.series['已拣货量'].push(item.count || 0)
    })
    return chartData
  }

  getData = (whsId) =>{
    const whsParam = whsId ? `?whsid=${whsId}` : ''
    return request({
      url: `/sstk/chart/sstk/picking/checking/detail${whsParam}`,
      method: 'GET'
    }).then(res => {
      if (!res) {
        this.setState({
          pickingData: {
            isLoading: false,
            fetchError: true,
          }
        })
        return
      } else {
        const pickingData = JSON.parse(res.data)
        pickingData.chartData = this.formateBarData(pickingData.detail)
        this.setState({
            pickingData,
        })
      }
    })
  }

  getWarehouseList = () => {
    request({
        url: `/statistic/sstk/warehouselist`,
        method: 'GET'
    }).then(res => {
        if (res) {
            const data = JSON.parse(res.data)
            const selectList = [{ title: '全部', value: '' }]
            // const { whsListData } = this.state
            data.whs.forEach(item => {
                selectList.push({
                    title: `分拣区${item}`,
                    value: item,
                })
            })
            // whsListData[0].selectList = selectList
            this.setState({
              selectList,
            })
        } else {
            this.setState({
                overViewData: {
                    isLoading: false,
                    fetchError: true,
                }
            })
        }
    })
}

changeArea = event => {
  this.getData(event.target.value)
  this.setState({
    area:event.target.value,
  })
}


  componentDidMount() {
    this.getWarehouseList()
    this.getData()
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
    const { fullScreen, showLegend, pickingData, selectList } = this.state
    return (
      <div className="main-panel-light">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#/SSTKOverview">
            稳定库存实时状态
          </Link>
          <span>拣货路径箱数</span>
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
                {
                    selectList && selectList.map((warehouse, index) => {
                        return  <option key={index} value={warehouse.value}>{warehouse.title}</option>
                    })
                }
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
              {pickingData.isLoading ?
                <div className="loading-content"> <CircularProgress /> </div>
                : pickingData.fetchError ?
                  <div className="empty-content">没有数据</div> :
                  <BarColors
                    unit={'箱'}
                    isPreview={false}
                    showLegend={showLegend}
                    isManyColor={false}
                    data={pickingData.chartData}
                    hasFull={false}
                    isFullScreent={fullScreen}
                    getData={this.getData}
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
    warehouseList: list
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PickingPage);