import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress'
import NativeSelect from '@material-ui/core/NativeSelect'
import { BootstrapInput } from 'utils/chartHelper'

export default class ListDividers extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      department: 'All',
      outTime: 4,
      isLoading: false,
    }
  }

  changeSelect = (event) => {
    const { getData } = this.props
    this.setState({
      outTime: event.target.value,
      isLoading: true
    })
    getData(event.target.value).then(res => {
      this.setState({
        isLoading: false
      })
    })
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

  componentWillReceiveProps (nextProps) {
    if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) {
        this.setState({
          outTime: 4,
        })
    }
}

  render() {
    const { list } = this.props
    const { outTime } = this.state
    return (
      <List style ={{padding: 0}} component="nav" aria-label="mailbox folders">
        <NativeSelect
          className="chart-select"
          onChange={this.changeSelect}
          value={outTime}
          input={<BootstrapInput name="department" id="department-customized-native-simple" />}
        >
          <option value={4}>超时4小时</option>
          <option value={10}>超时10小时</option>
          <option value={24}>超时24小时</option>
          <option value={48}>超时48小时</option>
        </NativeSelect>
        <Divider />
        {
          this.state.isLoading ? <div className="loading-content-little"> <CircularProgress /> </div>
        :
        <div>{
          list && list.length ?
          <div className="list-content-total">
            {list.map((list, index) => {
            return (<div key={index}>
              {index !== 0 && <Divider />}
              <ListItem key={index} onClick={() => this.props.getTodetail('doorCabinet', { tag: '超时' })}>
                <div className="list-item">
                  <div className="list-content">
                    <div className="list-avatar">
                      <i className="sap-icon icon-fridge"></i>
                    </div>
                    <div>
                      <div className="list-title">门{list.doorId}</div>
                      <div className="list-subtitle">装柜时间 {this.formateTime(list.loadTime)}</div>
                    </div>
                  </div>
                  <div className="time">{list.timeOut}小时</div>
                </div>
              </ListItem>
            </div>)
          })}
          </div>
          :
          <div className="charts-continer-little  empty-content">
            当前没有超时{this.state.outTime}小时的数据
          </div>
        }</div> 
        }
      </List>
    )
  }
}