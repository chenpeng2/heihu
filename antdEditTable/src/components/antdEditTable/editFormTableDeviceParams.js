import React from "react"
import { Table, Input, InputNumber, Popconfirm, Form, Checkbox, Select } from 'antd';
import _ from 'lodash'
const { Option } = Select;
const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        const {options,record,inputtype,dataIndex,handlesave}=this.props;
        const {datasource}=this.props;
        if(inputtype === 'number') {
            return <InputNumber />;
        }
        if(inputtype === 'select') {
            return <Select  style={{ width: 120 }} onChange={e=>setTimeout(()=>handlesave(this.form,record.key),200)}>
                {options.map((item,index)=><Option key={index} value={item.key}>{item.props.children}</Option>)}
            </Select>;
        }
        if(['e','ue','g','ge','l','le'].indexOf(record && record.condition)>-1){
            if(dataIndex==='value2'){
                return <Input disabled={true} ref={node => (this.input = node)} placeholder="不用填"/>
            }
        }
        return <Input ref={node => (this.input = node)}/>;
    };
    initChildren = (children,initialValue)=> {
        const {
            inputtype,
            options,
            record,
            dataIndex
        } = this.props;
        if(inputtype==='select'){
            return <Select disabled={true} defaultValue={initialValue} style={{ width: 120 }} >
                {options}
            </Select>
        }
        if(['e','ue','g','ge','l','le'].indexOf(record && record.condition)>-1){
            if(dataIndex==='value2'){
                return <div style={{cursor:'not-allowed'}}>不用填</div>
            }
        }
        return children
    }
    renderCell = (form) => {
        this.form=form;
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            required,
            options,
            index,
            children,
            ...restProps
        } = this.props;
        let initialValue = record&&record[dataIndex];
        // if(dataIndex == 'measurementId'){
        //     initialValue=record[dataIndex]
        // }
        // if(dataIndex == 'importance'){
        //     initialValue=record[dataIndex]
        // }
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {form.getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: required,
                                    message: '该项为必填项',
                                },
                            ],
                            initialValue: initialValue,
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                    this.initChildren(children,initialValue)
                )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initEdit:true,
            editingKey: this.props.editingKey ,
            columns: props.columns,
            dataSource: props.dataSource,
        };
    }
    componentWillMount(){
        let {columns}=this.state;
        columns[columns.length-1]={
            title: '操作',
            dataIndex: 'operation',
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
                                    确定
                                </a>
                            )}
                          </EditableContext.Consumer>
                          <Popconfirm title="确认取消吗?" okText="确定" cancelText="取消" onConfirm={() => this.cancel(record.key)}>
                            <a>取消</a>
                          </Popconfirm>
                    </span>
                        ) : (
                            <span>
                                <EditableContext.Consumer>
                                   {form => (
                                       <a disabled={editingKey===0 || editingKey} style={(editingKey===0 || editingKey)?{opacity:0.5}:{}} onClick={() => this.edit(form,record.key,'nosave')}>
                                           编辑
                                       </a>
                                   )}
                                </EditableContext.Consumer>
                            </span>
                    );
            },
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource!==this.props.dataSource) {
            this.setState({ dataSource: nextProps.dataSource})
        }
        if (nextProps.editingKey!==this.props.editingKey) {
            this.setState({ editingKey: nextProps.editingKey})
        }
    }
    isEditing = record => {return record.key === this.state.editingKey};

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key,type) {
        //除了这里select选择跟着联动，点击编辑的时候也需要判断
        if(type=='nosave'){
            const fieldValue = form.getFieldsValue()
            const newData = [...this.state.dataSource];
            const item = newData[key];
            newData.splice(key, 1, {
                ...item,
                ...fieldValue,
            });
            this.props.setDataSource(newData,this.state.editingKey,type,'changeTable')
            return
        }
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            //处理select的第五个和value的问题
            const newData = [...this.state.dataSource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.props.setDataSource(newData,this.state.editingKey,type)
                if(!type){
                    this.setState({ editingKey: '' });
                }

            } else {
                newData.push(row);
                this.props.setDataSource(newData,this.state.editingKey,type)
                if(!type){
                    this.setState({ editingKey: '' });
                }
            }
        });
    }
    edit(form,key,type) {
        this.setState({ editingKey: key },()=>{
            this.save(form,key,type)
        });
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };
        const columns = this.state.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputtype: col.inputtype,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                    handlesave:(e,key)=>this.save(e,key,'nosave'),
                    options:col.options,
                    datasource:this.state.dataSource,
                    required:col.required
                }),
            };
        });

        return (
            <EditableContext.Provider value={this.props.form}>
                <Table
                    components={components}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                    rowClassName="editable-row"
                    pagination={false}
                />
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);
export default EditableFormTable
