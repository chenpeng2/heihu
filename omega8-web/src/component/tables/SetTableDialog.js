import React from "react"
import { connect } from "react-redux"
//actions
import { bindActionCreators } from "redux"
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
// ui component
// import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import Checkbox from '@material-ui/core/Checkbox'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';

class SetTableDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataList: [],
      currentTab: 'setColumns',
      tabTitle: '定义列属性',
    }
  }

  setDefaultColumns() {
    const { defaultCheckedList } = this.props

    this.setState({
      checkedList: defaultCheckedList,
      checkAll: defaultCheckedList.length === this.props.columnsCheckList.length,
    })
  }

  setDefaultFilters = () => {
    const { defaultFilters } = this.props
    if (defaultFilters) {
      const { programNo, designNo, startDay, endDay } = defaultFilters
      this.setState({
        programNo,
        designNo,
        startDay: startDay,
        endDay: endDay,
      })
    }
  }

  componentWillMount() {
    const { defaultTab } = this.props
    console.log(defaultTab)
    this.setDefaultColumns()
    this.setDefaultFilters()
    this.setState({
      currentTab: defaultTab || 'setColumns',
      tabTitle: defaultTab === 'setColumns' ? '定义列属性' : '过滤器',
    })
  }

  onChange = checkedList => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < this.props.columnsCheckList.length,
      checkAll: checkedList.length === this.props.columnsCheckList.length,
    })
  }

  saveSetting = () => {
    const { changeColumns, getColumns, changeFilters, changeSettings } = this.props
    const { checkedList, programNo, designNo, startDay, endDay } = this.state
    const newColumnlist = getColumns.filter(column => {
      return checkedList.includes(column.field) || column.isMust
    })
    const filters = {
      programNo,
      designNo,
      startDay: startDay,
      endDay: endDay,
    }
    const settingData = {
      columns: checkedList,
      filters,
    }
    changeColumns(newColumnlist)
    changeFilters(filters)
    changeSettings(settingData)
  }

  changeTab(value) {
    let tabTitle = ''
    if (value === 'setFilters') {
      tabTitle = '过滤器'
    } else if (value === 'setColumns') {
      tabTitle = '定义列属性'
    }
    this.setState({
      currentTab: value,
      tabTitle,
    })
  }

  onCheckAllChange = e => {
    const { columnsCheckList } = this.props
    const { checkAll } = this.state
    const list = []
    columnsCheckList.forEach(item => {
      list.push(item.value)
    })
    this.setState({
      checkedList: checkAll ? [] : list,
      checkAll: !checkAll,
    })
  }

  onChangeDateStart = (event) => {
    this.setState({
      startDay: event.target.value,
    })
  }

  onChangeDateEnd = (event) => {
    this.setState({
      endDay: event.target.value,
    })
  }

  resetSettings = () => {
    this.setState({
      programNo: '',
      designNo: '',
      startDay: '',
      endDay: '',
    })
  }

  disabledStartDate = startDay => {
    const { endDay } = this.state
    if (!startDay || !endDay) {
      return false;
    }
    return startDay.valueOf() > endDay.valueOf()
  }

  disabledEndDate = endDay => {
    const { startDay } = this.state;
    if (!endDay || !startDay) {
      return false;
    }
    return endDay.valueOf() <= startDay.valueOf();
  }

  chaneText = event => {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  handleToggle = value => () => {
    const { checkedList } = this.state
    const currentIndex = checkedList.indexOf(value);
    const newChecked = [...checkedList];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checkedList: newChecked,
    })
  }

  renderCheckList(items) {
    const { checkedList } = this.state
    return (
      <div>
        <Checkbox
          onClick={() => this.onCheckAllChange(items)}
          checked={checkedList.length === items.length && items.length !== 0}
          indeterminate={checkedList.length !== items.length && checkedList.length !== 0}
          disabled={items.length === 0}
          color="primary"
          inputProps={{ 'aria-label': 'all items selected' }}
        />
        <span>全选</span>
        <Divider />
        <List dense component="div" role="list" className="tab-list">
          {items.map(item => {
            const labelId = `transfer-list-all-item-${item.value}-label`;

            return (
              <ListItem key={item.value} role="listitem" className="list-item" button onClick={this.handleToggle(item.value)}>
                <ListItemIcon>
                  <Checkbox
                    checked={checkedList.indexOf(item.value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    color="primary"
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${item.label}`} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </div>
    )
  }

  render() {
    const { columnsCheckList, visible, closeModal, defaultTab } = this.props
    const { currentTab } = this.state
    return (
      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={visible}
        className="bl-dialog"
        onBackdropClick={closeModal}
      >
        <DialogTitle id="confirmation-dialog-title"> 
        <div className="dialog-title" style={{width: '500px'}}>
          <ButtonGroup
            defaultValue={defaultTab}
            color="primary"
            aria-label="Outlined primary button group"
            size="small"
          >
            <Button data-value="setColumns" className={currentTab === 'setColumns' ? 'active' : ''} onClick={() => this.changeTab('setColumns')}><i className="sap-icon icon-table-column"></i></Button>
            {/* <Button data-value="setFilters" className={currentTab === 'setFilters' ? 'active' : ''} onClick={() => this.changeTab('setFilters')}><i className="sap-icon icon-filter"></i></Button> */}
          </ButtonGroup>
          <div className="title-text" style={{ marginRight: currentTab === 'setColumns' ? '22%' : '' }}>{this.state.tabTitle}</div>
          <Button hidden={currentTab === 'setColumns'} size="small" onClick={this.resetSettings} variant="outlined" color="primary" >重置</Button>
        </div>
        </DialogTitle>
        <DialogContent dividers>
          <div className="setting-dialog-content">
            <div className={currentTab === 'setColumns' ? 'visiable setting-tab-content' : 'setting-tab-content'} key="setColumns">
              {this.renderCheckList(columnsCheckList)}
            </div>
            <div className={currentTab === 'setFilters' ? 'visiable setting-tab-content' : 'setting-tab-content'} key="setFilters">
              <div className="tab-title">过滤对象</div>
              <div className="tab-list">
                {/* <div className="list-item"><label>起始查询创建日期</label>
                  <TextField
                    id="date"
                    type="date"
                    value={this.state.startDay}
                    onChange={this.onChangeDateStart}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
                <div className="list-item"><label>截止查询创建日期</label>
                  <TextField
                    id="date"
                    type="date"
                    value={this.state.endDay}
                    onChange={this.onChangeDateEnd}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div> */}
                <div className="list-item">
                  <label>Program No.</label>
                  <input id="programNo" value={this.state.programNo} onChange={this.chaneText} />
                </div>
                <div className="list-item">
                  <label>Design No.</label>
                  <input id="designNo" value={this.state.designNo} onChange={this.chaneText} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            取消
          </Button>
          <Button onClick={this.saveSetting} color="primary">
            确认
          </Button>
        </DialogActions>
      </Dialog >
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SetTableDialog)

