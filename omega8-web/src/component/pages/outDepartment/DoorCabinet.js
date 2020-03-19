import React from "react"
import { connect } from "react-redux"

import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import MTable from 'component/tables/MaterialTable'
import NativeSelect from '@material-ui/core/NativeSelect'

import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'

//my component
import SetTableDialog from 'component/tables/SetTableDialog'
import Progress from 'component/common/Progress'
import { getQueryString } from 'utils/formatHelper'
import request from 'utils/urlHelpers'

//redux
import { gettableSettings, getWarehouseList } from 'redux/selectors/outPartSelector'
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { bindActionCreators } from "redux"
import InputBase from '@material-ui/core/InputBase'
import { BootstrapInput } from 'utils/chartHelper'

class DoorCabinetPage extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.columns = [
      {
        title: '门',
        field: 'door',
        cellStyle: {
          align: 'left'
        }
      }, {
        title: '门店名',
        field: 'store',
        align: 'center',
        sorting: false,
        cellStyle: {
          width: '6%',
        }
      }, {
        title: '已装柜货量',
        field: 'loaded',
        align: 'right',
        sorting: false
      }, {
        title: '当前柜已装载重量',
        field: 'wgt',
        align: 'left',
        isPrograss: true,
        sorting: false,
        render: rowData =>
          <div className="progress-cell">
            <Progress percentageNum={rowData.wgt} />
          </div>
      }, {
        title: '当前柜已装载体积',
        field: 'cube',
        align: 'right',
        sorting: false,
        render: rowData =>
          <div className="progress-cell">
            <Progress percentageNum={rowData.cube} />
          </div>
      }, {
        title: 'C区货量',
        field: 'cStored',
        align: 'right',
        sorting: false,
      }, {
        title: 'C区容量',
        field: 'cTotal',
        align: 'right',
        sorting: false,
        // render: rowData =>
        //   <div className="progress-cell">
        //     <Progress percentageNum={0.2}/>
        //   </div>
      }, {
        title: '收货整板',
        field: 'rCount',
        sorting: false,
        align: 'right',
      }, {
        title: '分货缓存区',
        field: 'sCount',
        sorting: false,
        align: 'right',
        cellStyle: {
          width: '6%',
        }
      }, {
        title: '分货已组板',
        field: 'scCount',
        sorting: false,
        align: 'right'
      }, {
        title: '稳定库存',
        field: 'ssCount',
        sorting: false,
        align: 'right'
      }, {
        title: '装柜超时',
        field: 'timeOut',
        sorting: false,
        align: 'right',
        render: (props) => {
          return props.timeOut ? `超时${props.timeOut}小时` : '未超时'
      }
      }, {
        title: '装柜时间',
        field: 'loadTime',
        sorting: false,
        render: (props) => {
          return this.formateTime(props.loadTime)
        }
      }, {
        title: '标签',
        field: 'tagList',
        sorting: false,
        render: rowData =>
          <div className="tag-content">
            {rowData.tagList['isAlmostFull'] && <i className="sap-icon icon-warning"></i>}
            {rowData.tagList['isTimeOut'] && <i className="sap-icon icon-time-out"></i>}
            {rowData.tagList['isLoading'] && <i className="sap-icon icon-check"></i>}
            {rowData.tagList['isTrailed'] && <i className="sap-icon icon-fridge"></i>}
            {rowData.tagList['isToTrail'] && <i className="sap-icon icon-lateness"></i>}
          </div>
      }, {
        title: '等待装柜时间',
        field: 'waitTrail',
        sorting: false,
        align: 'right',
        render: (props) => {
          return this.formateTime(props.waitTrail)
        }
      }
    ]
    this.state = {
      columnsCheckList: this.getColmunsCheckList(),
      filters: {
        tag: '',
        searchValue: '',
        orderBy: '',
        totalCount: '',
        area: '',
        unit: 'plt',
      },
      isLoading: true,
      tagFilters: [
        {
          title: '即将满柜',
          value: 'willFull',
          icon: 'icon-warning',
          count: '',
          id: '1'
        }, {
          title: '超时',
          value: 'timeOut',
          icon: 'icon-time-out',
          count: '',
          id: '2'
        }, {
          title: '装柜中',
          value: 'loading',
          icon: 'icon-check',
          count: '',
          id: '3'
        }, {
          title: '已摆柜',
          value: 'loaded',
          icon: 'icon-fridge',
          count: '',
          id: '4'
        }, {
          title: '等待摆柜',
          value: 'waitLoad',
          icon: 'icon-lateness',
          count: '',
          id: '5'
        }
      ],
      pageParam: {
        pageNum: 0,
        pageSize: 10,
      }
    }
  }

  getTotalData() {
    const { tagFilters, filters } = this.state
    return request({
      url: `/statistic/doors/detail`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 0) {
        const totalData = JSON.parse(res.data)
        filters.totalCount = totalData.total
        tagFilters[0].count = totalData.almostFull
        tagFilters[1].count = totalData.timeOut
        tagFilters[2].count = totalData.isLoading
        tagFilters[3].count = totalData.isTrailed
        tagFilters[4].count = totalData.toTrail
        this.setState({
          filters,
          totalData,
        })
      }
    })
  }

  getData() {
    const { filters, pageParam } = this.state
    const { area, unit, tag } = filters
    const warehouseParam = area ? `&whsid=${area}` : ''
    const unitParam = unit ? `unit=${unit}` : ''
    const filterParam = tag ? `&filter=${tag}` : ''
    const pageNum = pageParam ? `&pageNum=${pageParam.pageNum + 1}` : '&pageNum=1' // 分页插件是从0开始计数，所以在请求接口的时候加1
    const pageSize = pageParam ? `&pageSize=${pageParam.pageSize}` : '&pageSize=10' //此处需要和调用的地方都是写10条
    this.setState({
      isLoading: true,
    })
    return request({
      url: `/chart/doors/detail?${unitParam}${warehouseParam}${filterParam}${pageNum}${pageSize}`,
      method: 'GET'
    }).then(res => {
      if (res && res.code === 0) {
        const tableData = JSON.parse(res.data)
        this.setState({
          tableData,
          isLoading: false,
        })
      }
    })
  }

  componentWillMount() {
    const { getWareHouseList, warehouseList } = this.props
    if (!warehouseList) {
      getWareHouseList()
    }
  }

  componentDidMount() {
    const keys = this.props.location.state
    const searchKeys = this.props.location.search
    const tag = (keys && keys.tag) || getQueryString(searchKeys, 'tag')
    const from =  keys && keys.from
    const area =  keys && keys.area
    const { filters } = this.state
    let defaultTag
    switch (tag) {
      case '即将满柜':
        defaultTag = '1'
        break;
      case '超时':
        defaultTag = '2'
        break;
      case '装柜中':
        defaultTag = '3'
        break;
      case '已摆柜':
        defaultTag = '4'
        break;
      case '等待摆柜':
        defaultTag = '5'
        break;
      default:
        defaultTag = ''
        break;
    }
    this.setState({
      from,
      filters: {
        ...filters,
        area,
        tag: defaultTag || '',
      }
    }, () => {
      this.getData()
      this.getTotalData()
    })
  }

  getColmunsCheckList = () => {
    const dataColumns = []
    const { columns } = this
    columns && columns.forEach(column => {
      dataColumns.push({
        label: column.title,
        value: column.field,
        checked: true,
      })
    })
    return dataColumns
  }

  formateTime(time) {
    if (time) {
      let hour = parseInt(time / 3600) ? `${parseInt(time / 3600)}小时` : ''
      let minnut = parseInt(time % 3600 / 60) ? `${parseInt(time % 3600 / 60)}分钟` : ''
      // let second = parseInt(time % 60)
      return `${hour} ${minnut}`
    } else {
      return 0
    }
  }

  openModal(openTab) {
    this.setState({
      defaultTab: openTab,
      isShowSetingDialog: true,
    })
  }

  closeSetTableDialog = () => {
    this.setState({
      isShowSetingDialog: false,
    })
  }

  changeColumns = (newColumns) => {
    this.closeSetTableDialog()
  }

  changePage = (pageParam) => {
    this.setState({
        pageParam,
        setDefaultPageNum: false,
    },() => {
      this.getData()
    })
  }

  changeFilters = (filters) => {
    // const { getTableList } = this.props
    // const { pageNum, pageSize } = this.state
    // const params = {
    //   pageNum,
    //   pageSize,
    //   ...filters
    // }
    // getTableList(params)
    this.closeSetTableDialog()
  }


  changeArea = (event) => {
    const { filters, pageParam } = this.state
    pageParam.pageNum = 0
    filters.area = event.target.value
    this.setState({
      pageParam,
      filters,
      setDefaultPageNum: true
    }, () => {
      this.getData()
    })
  }

  changeUnit = (event) => {
    const { filters, pageParam } = this.state
    pageParam.pageNum = 0
    filters.unit = event.target.value
    this.setState({
      pageParam,
      filters,
      setDefaultPageNum: true
    }, () => {
      this.getData()
    })
  }

  changeTag = (value) => {
    const { pageParam } = this.state
    pageParam.pageNum = 0
    const { filters } = this.state
    filters.tag = value
    this.setState({
      filters,
      pageParam,
      setDefaultPageNum: true,
    }, () => {
      this.getData()
    })
  }

  renderModal = () => {
    const { isShowSetingDialog, columnsCheckList, defaultTab } = this.state
    const { settingData } = this.props
    const { columns, filters } = settingData || {}
    let checkedValues = []
    columnsCheckList && columnsCheckList.forEach(column => {
      checkedValues.push(column.value)
    })

    const defaultCheckedList = columns || checkedValues
    return (
      isShowSetingDialog &&
      <SetTableDialog
        columnsCheckList={columnsCheckList}
        visible={this.state.isShowSetingDialog}
        closeModal={this.closeSetTableDialog}
        getColumns={this.columns}
        defaultTab={defaultTab}
        defaultCheckedList={defaultCheckedList}
        defaultFilters={filters}
        changeColumns={this.changeColumns}
        changeFilters={this.changeFilters}
      />
    )
  }

  changeSearchValue = (event) => {
    this.setState({
      searchValue: event.target.value,
    })
  }

  search = () => {
    const { searchData } = this.props
    const { searchValue } = this.state
    searchData(searchValue)
  }

  render() {
    const { filters, tableData, from, setDefaultPageNum } = this.state
    const { settingData, warehouseList } = this.props
    const columns = this.columns.filter(column => {
      if (settingData) {
        return settingData.columns.includes(column.field || column.isMust)
      } else {
        return column
      }
    })
    return (
      <div>
        {this.renderModal()}
        <div className="subtitle-panel">
          <Breadcrumbs aria-label="breadcrumb">
            {from === 'split' ?
            <Link href="#/splitControl">
               分货部实时状态
                </Link>
                :<Link href="#/outControl">
              出货部实时状态
                </Link>}
            <span>当前门柜状态详情</span>
          </Breadcrumbs>
          <div className="title-filter">
            <div className={filters.tag === '' ? "filter-total active" : "filter-total"} onClick={() => this.changeTag('')}>
              <div className="count"><span className="number">{this.state.filters.totalCount}</span> 门</div>
            </div>
            <br></br>
            {this.state.tagFilters.map((filter, index) => {
              return (
                <div className={filters.tag === filter.id ? `active filter-item ${filter.value}`
                  : `filter-item ${filter.value}`}
                  key={`filter-${index}`}
                  onClick={() => this.changeTag(filter.id)}
                >
                  <i className={`sap-icon ${filter.icon}`}></i>
                  <span>{filter.title}</span>
                  <div className="right-number">{filter.count}</div>
                </div>)
            })}
          </div>
        </div>
        <div className="main-panel-light" style={{ paddingTop: '167px' }}>
          <div className="panel-content">
            {
              <div className="table-actions">
                <div className="left-action">
                  <NativeSelect
                    className="chart-select"
                    value={this.state.filters.area}
                    onChange={this.changeArea}
                    data-key={'department'}
                    input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                  >
                    <option value={''} >全仓</option>
                    {
                      warehouseList && warehouseList.map((warehouse, index) => {
                        return <option key={index} value={warehouse.whsId}>{`仓库${warehouse.whsId}`}</option>
                      })
                    }
                  </NativeSelect>
                  <NativeSelect
                    className="chart-select"
                    value={this.state.unit}
                    onChange={this.changeUnit}
                    input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                  >
                    <option value={'plt'}>按板</option>
                    <option value={'unit'}>按箱</option>
                  </NativeSelect>
                </div>

                <Paper className="search-content">
                  <InputBase
                    className="search-input"
                    placeholder="search"
                    inputProps={{ 'aria-label': 'search google maps' }}
                    onChange={this.changeSearchValue}
                  />
                  <i className="sap-icon icon-search" onClick={this.search}></i>
                </Paper>
                {/* <IconButton aria-label="filter" onClick={this.openModal.bind(this, 'setFilters')}>
                  <i className="sap-icon icon-filter"></i>
                </IconButton> */}
                <IconButton aria-label="setting" onClick={this.openModal.bind(this, 'setColumns')}>
                  <i className="sap-icon icon-setting"></i>
                </IconButton>
              </div>
            }
            <MTable
              columns={columns}
              rows={tableData}
              className="big-table"
              canAction={true}
              isLoading={this.state.isLoading}
              tag={this.state.filters.tag}
              getData={this.getData}
              changePage={this.changePage}
              setDefaultPageNum={setDefaultPageNum}
            />
          </div>
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  const settingData = gettableSettings(state)
  const list = getWarehouseList(state)
  return {
    list: state,
    department: '',
    settingData,
    warehouseList: list
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DoorCabinetPage);
