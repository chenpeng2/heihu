import { Tabs, Modal, Checkbox } from 'antd';
import React from "react"

const { TabPane } = Tabs
const CheckboxGroup = Checkbox.Group;

class SetTableDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        dataList: [],
        currentTab:'定义列属性',
    }
  }

  onChange = checkedList => {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < this.props.columnsCheckList.length,
      checkAll: checkedList.length === this.props.columnsCheckList.length,
    })
}

  handleOk = () => {
    const { changeColumns, getColumns } = this.props
    const { checkedList, dialog } = this.state
    const newlist = getColumns.filter(column => {
        if (checkedList.includes(column.dataIndex)) {
            return column
        } else {
            return
        }
    })
    changeColumns(newlist)
}

tabChanges = (activeKey) => {
  console.log(activeKey)
  let currentTab = ''
  if (activeKey === 'setFilters') {
    currentTab = '过滤器'
  } else if (activeKey === 'setColumns') {
    currentTab = '定义列属性'
  }
  this.setState({
    currentTab,
  })
}

onCheckAllChange = e => {
  const { columnsCheckList } = this.props
  console.log(columnsCheckList,e.target.checked, this)
  const list = []
  columnsCheckList.forEach(item => {
    list.push(item.value)
  })
    this.setState({
      checkedList: e.target.checked ? list : [],
      indeterminate: false,
      checkAll: e.target.checked,
    })
  console.log(this.state.checkedList)
}

  render() {
    const { columnsCheckList, visible, closeModal } = this.props
    return (
        <Modal
        title={this.state.currentTab}
        visible={visible}
        onOk={this.handleOk}
        onCancel={closeModal}
        >
        <div className="bl-dialog">
            <div className="setting-dialog-content">
                <div className="dialog-title">
                    <Tabs onChange={this.tabChanges}>
                        <TabPane tab="Tab 1" key="setColumns">
                            {
                                // dataColumns.map(column => {
                                    // return (
                                        <div className="checkbox-group-list">
                                        <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                                            <Checkbox
                                                indeterminate={this.state.indeterminate}
                                                onChange={this.onCheckAllChange}
                                                checked={this.state.checkAll}
                                            >
                                                    全选
                                                </Checkbox>
                                        </div>
                                        <CheckboxGroup
                                            options={columnsCheckList}
                                            value={this.state.checkedList}
                                            onChange={this.onChange}
                                        />
                                        </div>
                                    // )
                                // })
                            }
                        </TabPane>
                        <TabPane tab="Tab 2" key="setFilters">
                            Content of Tab 2
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
        </Modal>
    )
}
}

export default SetTableDialog

