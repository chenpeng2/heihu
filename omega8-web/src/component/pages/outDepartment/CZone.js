import React from "react"
import { connect } from "react-redux"
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import FoldedBar from 'component/charts/FoldedBar'
import NativeSelect from '@material-ui/core/NativeSelect'
import IconButton from '@material-ui/core/IconButton'
import request from 'utils/urlHelpers'
import { bindActionCreators } from "redux"
import { BootstrapInput } from 'utils/chartHelper'

//redux
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { getWarehouseList } from 'redux/selectors/outPartSelector'

class CZonePage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      department: '',
      area: '',
      unit: 'plt',
      fullScreen: false,
      showLegend: true,
    }
  }

  getChartData(data) {
    const chartData = {
        Ylist: [],
        series: {
          '当前C区货量': [],
          '预计到来量': [],
          '预计工作时长': [],
          'timeShow': [],
        }
    }

    data && data.forEach(item => {
        chartData.Ylist.push(`${item.storeId}`)
        chartData.series['当前C区货量'].push(item.storeValid)
        chartData.series['预计到来量'].push(item.expectedArral)
        chartData.series['预计工作时长'].push(item.expectedTime/3600)
        chartData.series['timeShow'].push(item.expectedTime)
    })
    return chartData
  }

  getData() {
    const { area, unit } = this.state
    const warehouseParam = area ? `whsId=${area}` : ''
    const unitParam = unit ? `&unit=${unit}` : ''
    return request({
        url: `/chart/warehouse/estimatedwork?${warehouseParam}${unitParam}`,
        method:'GET'
    }).then(res => {
        if (res && res.code === 0) {
            const CAreaData = {}
            const data = JSON.parse(res.data)
            CAreaData.chartData = this.getChartData(data)
            this.setState({
              CAreaData,
            })
        }
    })
  }

  componentWillMount() {
    const {getWareHouseList, warehouseList } = this.props
    if (!warehouseList) {
      getWareHouseList()
    }
  }

  componentDidMount() {
    const keys = this.props.location.state
    if (keys) {
      const { area } = keys
      const areaId = area && parseInt(area.substring(area.length - 1, area.length))
      console.log(areaId)
      this.setState({
        area: areaId,
      },()=> {
        this.getData()  
      })
    } else {
      this.getData()  
    }
   
  }
  
  changeArea = (event) => {
    this.setState({
      area: event.target.value
    }, () => {
      this.getData()
    })
  }

  changeDepartment = (event) => {
    event.target.value && this.setState({
      department: event.target.value
    }, () => {
      this.getData()
    })
  }

  changeUnit = (event) => {
    this.setState({
      unit: event.target.value
    }, () => {
      this.getData()
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
    const { fullScreen, showLegend, CAreaData } = this.state
    const { warehouseList } = this.props
    return (
      <div className="main-panel-light">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#/outControl">
            出货部实时状态
          </Link>
          <span>当前C区状态详情</span>
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
                        return  <option key={index} value={warehouse.whsId}>{`仓库${warehouse.whsId}`}</option>
                    })
                  }
                </NativeSelect>
                <NativeSelect
                  className="chart-select"
                  value={this.state.unit}
                  onChange={this.changeUnit}
                  input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                >
                  <option value={'plt'}>板数</option>
                  <option value={'unit'}>箱数</option>
                </NativeSelect>
              </div>
              <div className="right-actions">
                <IconButton aria-label="legend" onClick={this.setLegend}>
                  <i className="sap-icon icon-legend"></i>
                </IconButton>
                <IconButton aria-label="legend" onClick={this.toFullScreen}>
                  <i className="sap-icon icon-full-screen"></i>
                </IconButton>
                <IconButton aria-label="legend" onClick={this.toSysScreen}>
                  <i className="sap-icon icon-sys-monitor"></i>
                </IconButton>
              </div>            
            </div>
            <Paper className="item-content">
              <FoldedBar data={CAreaData} unit={this.state.unit}  showLegend={showLegend} isFull={fullScreen} getData={this.props.getWillComeData} hideControl={true} />
              <div className="bottom-title">门店</div>
            </Paper>
          </Grid>
        </div>
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
)(CZonePage);