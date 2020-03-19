import React, { PureComponent, useState, useEffect } from 'react';
import { Form, Input, InputNumber, Popconfirm, Select, Button, Table, Icon, Affix, DatePicker, Modal } from 'antd';
import XLSX from 'xlsx';
import ExcelUtil from '@src/components/tableExport/index';
import moment from 'moment';
const { Search } = Input;
const { Option } = Select;
const EditableContext = React.createContext();
class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber />;
        }
        return <Input />;
    };

    renderCell = ({ getFieldDecorator }) => {
        let {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        if(title&&title.hasOwnProperty('props')){
            title = title.props.children[1];
        }
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: title=='备注'?false:true,
                                    message: `请输入${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}
class ParamStandMaintenance extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            columns: [
                {
                    title: '异常编号',
                    render: text => <a>{text}</a>,
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.number - b.number,
                    key:'number',
                    dataIndex: 'number'
                },
                {
                    title: <span><span className="required-mark">*</span>异常原因</span>,
                    key:'reason',
                    dataIndex: 'reason',
                    editable: true,
                },
                {
                    title: <span><span className="required-mark">*</span>异常类型</span>,
                    key:'type',
                    dataIndex: 'type',
                    editable: true,
                },
                {
                    title: '备注',
                    key:'notice',
                    dataIndex: 'notice',
                    editable: true,
                },
                {
                    title: '创建时间',
                    render: text => <a>{text}</a>,
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => moment(a.time).valueOf() - moment(b.time).valueOf(),
                    key:'time',
                    dataIndex: 'time',
                },
                {
                    title: '操作',
                    key:'operate',
                    dataIndex: 'operate',
                    render: (text, record) => {
                        const { editingKey } = this.state;
                        const editable = this.isEditing(record);
                        return editable ? (
                            <span>
                                  <EditableContext.Consumer>
                                    {form => (
                                        <a
                                            onClick={() => this.save(form, record.key)}
                                            style={{ marginRight: 8 }}
                                        >
                                            保存
                                        </a>
                                    )}
                                  </EditableContext.Consumer>
                                  <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
                                    <a>取消</a>
                                  </Popconfirm>
                            </span>
                        ) : (
                            <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)} style={{color:'#0854A0'}}>
                                编辑
                            </a>
                        );
                    },
                    width: 80,
                }
            ],
            data: [
                {
                    key: 1,
                    number: '0013',
                    reason: 'This ia an',
                    type: 'This ia an',
                    notice: 'This ia an',
                    time: '2019-09-11',
                    operate: '',
                },
                {
                    key: 2,
                    number: '0003',
                    reason: 'This ia an',
                    type: 'This ia an',
                    notice: 'This ia an',
                    time: '2019-09-19',
                    operate: '',
                }
            ],
            editingKey: '',
            isShowFilter: true,
            isPingFilters: false,
            device: {
                number: null,  // 设备名称
                type: null,  // 设备类型
                time: null,  // 编码
            },
            deleteModal:false,
        }
    }
    isEditing = record => record.key === this.state.editingKey;
    cancel = () => {
        this.setState({ editingKey: '' });
    };
    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ data: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' });
            }
        });
    }
    edit(key) {
        this.setState({ editingKey: key });
    }
    handleSubmit = (e) => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            // console.log('Received values of form: ', fieldsValue);
        });
    }
    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
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
    handleInputChange = (e, key) => {
        const item = {}; item[key] = e.target ? e.target.value : e;
        //去筛选表格
        const {data} = this .state;
        let newData = data.filter((itm)=>{return itm.number.indexOf(item.number)>-1})
        let device = Object.assign({}, this.state.device, item )
        this.setState({ device, data: newData })
    }
    changeTime = ()=> {

    }
    deleteModalCancel = ()=> {
        this.setState({deleteModal:false})
    }
    renderFilters() {
        const { isShowFilter, isPingFilters, device } = this.state;
        const errorText="该异常原因已被使用，无法删除。"
        return (
            <div className="create-device-page abnormal-reason">
                <div className="filter-panel">
                    <div className="flex-container" style={{display: isShowFilter ? "flex" : "none"}}>
                        <section className="basic-info">
                            <div className="item">
                                <div className="label">异常编号:</div>
                                <Input defaultValue={ device.number } placeholder="选择异常编号" onChange={ (e) => { this.handleInputChange(e, 'number') } } />
                            </div>
                            <div className="item">
                                <div className="label">异常类型:</div>
                                <Input defaultValue={ device.type } placeholder="选择异常类型" onChange={ (e) => { this.handleInputChange(e, 'type') } } />
                            </div>
                            <div className="item">
                                <div className="label">创建时间:</div>
                                <DatePicker size="small" suffixIcon={<i className="sap-icon icon-appointment-2"></i>} placeholder="创建时间" onChange={this.changeTime} />
                            </div>
                            <div className="item" style={{position:'relative'}}>
                                <Button type="primary" style={{position:'absolute',bottom:0}}>查询</Button>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="subtitle-panel data-report">
                    <div className="bottom-botton-panel">
                        <div className="button-panel">
                            <div className="button" onClick={(e)=>this.changeFilter(e)}>
                                {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}
                            </div>
                            <div className="button" onClick={this.pingFilters.bind(this)}>
                                {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    wrapClassName="reason-modal"
                    title={<span><i className="sap-icon icon-alert"></i>错误</span>}
                    visible={this.state.deleteModal}
                    onCancel={this.deleteModalCancel}
                    footer={[
                        <Button key="close" type="primary" onClick={this.deleteModalCancel}>Close</Button>,
                    ]}
                >
                    <span>{errorText}</span>
                </Modal>
            </div>
        )
    }
    deleteReason = ()=> {
        this.setState({deleteModal:true})
    }
    initColumn = (columns)=> {
        let newColumns=JSON.parse(JSON.stringify(columns));
        newColumns.map((item,index)=>{
            if(item.title.hasOwnProperty('props')){
                const ctn = item.title.props.children[1];
                newColumns[index].title=ctn;
            }
        })
        return newColumns
    }
    /* 质朴长存法 by lifesinger */
    padZreo(num, n) {
        var len = num.toString().length;
        while(len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    }
    chooseMax = (data,type)=> {
        let arr=[];
        data.map((item,index)=>{
            arr.push(item[type])
        })
        return Math.max.apply(null,arr)
    }
    appendData = ()=> {
        const { data } =this.state;
        const max =this.chooseMax(data,'number');
        const newData={
            key: max+1,
            number: this.padZreo(max+1,4),
            reason: 'This ia an',
            type: 'This ia an',
            notice: 'This ia an',
            time: '2019-09-19',
            operate: '',
        };
        this.setState({editingKey: max+1, data:[...this.state.data,newData]})

    }
    importFile = (e)=> {
        ExcelUtil.importExcel(e)
        var timer = setInterval(()=>{
            if(ExcelUtil.importFile()){
                clearInterval(timer)
            }
        })
    }
    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };
        let { columns, data, isPingFilters } = this.state;
        columns = columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });
        const initColumn = this.initColumn(columns)
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRows
                })
            },
            type:'radio'
        };
        return (
            <div className="reason">
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div> { this.renderFilters()} </div>
                }
                <div className="main-panel">
                    <div className="operate">
                        <span>设备参数监控列表 (12)</span>
                        <div className="flex-space-between">
                            <Button onClick={this.appendData}>添加原因</Button>
                            <span onClick={this.deleteReason}>删除</span>
                            <span className="import">
                                <span>导入</span>
                                <input type='file' accept='.xlsx, .xls' onChange={(e)=>{this.importFile(e)} }/>
                            </span>
                            <span onClick={() => {ExcelUtil.exportExcel(initColumn, data,"异常原因.xlsx")}}>导出</span>
                        </div>
                    </div>
                    <EditableContext.Provider value={this.props.form}>
                        <Table
                            rowSelection={rowSelection}
                            components={components}
                            bordered
                            dataSource={data}
                            columns={columns}
                            rowClassName="editable-row"
                            pagination={false}
                        />
                    </EditableContext.Provider>
                </div>
            </div>
        );
    }
}
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default WrappedParamStandMaintenance;
