import React, { PureComponent } from 'react';
import { Tag, Select, message, Form, Button } from 'antd';
import EditableTable from 'components/antdEditTable/editTable'
import request from 'util/http'
const { Option } = Select;
const children = [];
for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    componentDidMount(){
        this.getErrorEquipment()
    }
    // 获取异常原因
    getErrorEquipment() {
        request({
            url: `/equipment/getEquipmentCodeList`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                this.props.parent.getEquipment(data)
            },
            error: () => {
                message.error('请求失1败！')
            }
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { typeList, codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='all'>全部</Option>];
        const types = defaultItem.concat( typeList.map( (item) => { return <Option key={ item.type }>{ item.type }</Option> } ) );
        return (
            <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
                <Form.Item label="用户名：">
                    {getFieldDecorator('email')(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="选择用户名" style={{ width: '200px' }}>{ types }</Select>
                    )}
                </Form.Item>
                <Button onClick={this.submit} className="filter-submit" type="primary">查询</Button>
            </Form>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);
class PointChart extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            columns: [
                {
                    title: '用户名',
                    field: 'email',
                },
                // {
                //     title: '职位',
                //     field: 'position',
                // },
                {
                    title: '管理设备',
                    field: 'equipmentCode',
                    editComponent: props => {
                        let equipmentCode = props.rowData.equipmentCode, valueArr = []
                        if(equipmentCode && typeof(equipmentCode) === 'string'){
                            equipmentCode = equipmentCode.split(',')
                        }
                        const { resultData } = this.state
                        const children = resultData && resultData.length > 0 ? resultData.map((item,index)=><Option key={item}>{item}</Option>) : null
                        return  <Select
                                    className='cause-list'
                                    mode="multiple"
                                    style={{ width: '50%' }}
                                    placeholder="请选择设备!"
                                    value={equipmentCode ? equipmentCode : []}
                                    onChange={e => props.onChange(e)}
                                >
                                    {children}
                                </Select>
                    },
                    render: (text,aa) => {
                        const manageDevice = text.equipmentCode && text.equipmentCode.split(',')
                        return <div style={{padding:'5px'}}>{manageDevice && manageDevice.length > 0 && manageDevice.map((item,index)=> 
                            {
                                // const colors = ['magenta','red','volcano','orange','gold','lime','green','cyan','blue','geekblue','purple']
                                // const colorIndex = Math.floor(Math.random(0,1)*colors.length)
                                return <span key={index}>
                                            <Tag>
                                                {item}
                                            </Tag>
                                        </span>
                        })}
                        </div>
                    },
                    // editable:'onAdd',
                }],
            data: [],
            emails: [],
            isShowFilter: true,
            isPingFilters: false,
            visible: false,
            isFetching:true,
            pageSize:10,
            pageNum:1,
        }
    }
    componentDidMount(){
        this.getUserEquipmentAll()
    }
    //过滤前面有没有&
    filterUrl = (url) => {
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    // 获取全部通知设备
    getUserEquipmentAll(params) {
        const pageNum = (params && params.page) ? `&pageNum=${params.page}` : '&pageNum=1'
        const pageSize = (params && params.page_size) ? `&pageSize=${params.page_size}` : '&pageSize=10'
        const pams = this.filterUrl(`${pageNum}${pageSize}`)
        request({
            url: `/equipment/getEquipmentForUser/all?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                //过滤用户名
                let emails = []
                data && data.result.length > 0 ? data.result.map((item,index)=>{
                    emails.push({type: item.email})
                }):null
                this.setState({ data,emails, isFetching:false })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    // 获取通知设备
    getUserEquipment(data) {
        request({
            url: `/equipment/getEquipmentForUser`+(data.email === 'all' ? '' : `?email=${data.email}`),
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                this.setState({ data })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    handleChange = ()=> {

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
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };
    getStandardList = (e)=> {

    }
    // 添加通知设备
    addUserEquipment = (data) => {
        const haveComma = data.equipmentCode && data.equipmentCode.indexOf(',')
        if(haveComma){
            data.eqList=data.equipmentCode.split(',')
        }
        return request({
            url: `/equipment/bond?email=${data.email}`,
            method: 'POST',
            data: data.eqList,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    message.success('添加成功!');
                    return res
                }
            },
            error: (err) => {
                message.error('数据出错');
            }
        })
    }
    // 编辑通知设备
    updateUserEquipment = (data) => {console.log(data)
        const { email, equipmentCode } = data
        return request({
            url: `/equipment/bond?email=${email}`,
            method: 'POST',
            data: equipmentCode,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    message.success('更新成功!');
                    return res
                }
            },
            error: (err) => {
                message.error('数据出错');
            }
        })
    }
    // 删除通知设备
    deleteUserEquipment = (data) => {
        return request({
            url: `/equipment/bond?email=${data.email}`,
            method: 'POST',
            data: [],
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    message.success('删除成功!');
                    return res
                }
            },
            error: (err) => {
                message.error('数据出错');
            }
        })
    }
    getFilterFormMsg(child, formData) {
        this.getUserEquipment(formData);
    }
    getUserEquipmentList = (data)=> {
        this.getUserEquipmentAll(data)
    }
    getEquipment = (data)=> {
        this.setState({resultData:data})
    }
    render() {
        const { columns, data, isFetching, pageSize, pageNum, emails } = this.state;
        const total = data && data.total ? data.total : 0
        return (
            <div className="reason equipment-monitoring back-color">
                <div className="filter-panel">
                    <FilterFormBox parent={this} typeList={emails} />
                </div>
                <div className="main-panel">
                    <EditableTable
                        title={"通知设备（" + total + '）'}
                        hasPaging={false} columns={columns}
                        updateData={this.updateUserEquipment}
                        // createData={this.addUserEquipment}
                        createData={false}
                        data={{list: data?data.result:[], isFetching,pageInfo:{
                            total:total,
                            pageSize:pageSize,
                            page:pageNum
                        }}}
                        // deleteData={this.deleteUserEquipment}
                        deleteData={false}
                        getTableList={this.getUserEquipmentList}
                        antdPagination={true}
                    />
                </div>
            </div>

        );
    }
}

export default PointChart;
