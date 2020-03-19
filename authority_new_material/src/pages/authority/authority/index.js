import React, { PureComponent } from 'react';
import request from '../../../util/http'
import { formatterYMD } from '../../../util/index'
import EditTable from '../../../components/common/editTable'
import { Select, Button, Table, Icon, message, Form } from 'antd';
const { Option } = Select;

// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const { typeList, codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='all'>全部</Option>];
        const types = defaultItem.concat( typeList.map( (item,index) => { return <Option key={ index }>{ item.name }</Option> } ) );
        const codes = defaultItem.concat( codeList.map( (item,index) => { return <Option key={ index }>{ item.username }</Option> } ) );
        return (
            <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
                {/* 选择框支持输入搜索 */}
                <Form.Item label="用户：">
                    {getFieldDecorator('equipmentCode')(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="选择设备编码" style={{ width: '200px' }}>{ codes }</Select>
                    )}
                </Form.Item>
                <Form.Item label="角色：">
                    {getFieldDecorator('equipmentType')(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="选择设备类型" style={{ width: '200px' }}>{ types }</Select>
                    )}
                </Form.Item>
                <Button onClick={this.submit} className="filter-submit" type="primary">查询</Button>
            </Form>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class DeviceList extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,  // table loading
            data: [],       // 设备数据
            codeList: [], // 设备编码列表
            typeList: [], // 设备型号列表
            columns: [
                {
                    title: '#',
                    field: 'key',
                    editable: 'never',
                    sorting: false,
                },
                {
                    title: 'id',
                    field: 'id',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '描述',
                    field: 'description',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '权限',
                    field: 'authority',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '组织者',
                    field: 'organization',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '创造者',
                    field: 'created_by',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '创建时间',
                    field: 'created_at',
                    sorting: false
                },
                {
                    title: '更新时间',
                    field: 'updated_at',
                    sorting: false
                }
            ]
        }
    }
    getFilterFormMsg(child, formData) {
        this.getDeviceList(formData)
    }
    // 点击设备行进入详情页
    clickRow(record) {
        this.props.history.push('device/' + record.equipmentCode)
    }
    // 获取设备api
    getDeviceList(data) {
        let url = ''
        if(data) {
            for(let key in data) {
                const item = data[key];
                if(item && item !== 'all') {
                    const symbol = ( url === '' ? '?' : '&' );
                    url += ( symbol + key + '=' + item )
                }
            }
        }
        this.setState({ loading: true })
        request({
            url: `/app/mock/237540/authority/authority`,
            urlHead:'http://rap2api.taobao.org',
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ data: res.data.map( (item, key) =>{
                    item.key = key;
                    return item
                }), loading: false  })
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }

    // 获取设备编码列表
    getEquipmentCodeList() {
        request({
            url: `/app/mock/237540/authority/user/userList`,
            urlHead:'http://rap2api.taobao.org',
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ codeList: res.data })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    // 获取设备型号列表
    getEquipmentTypeList() {
        request({
            url: `/app/mock/237540/authority/role/roleList`,
            urlHead:'http://rap2api.taobao.org',
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ typeList: res.data })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }


    componentDidMount() {console.log(this.props)
        this.getDeviceList(); // 设备列表
        this.getEquipmentCodeList();    // 设备编码列表
        this.getEquipmentTypeList();    // 设备类型列表
    }
    /*修改异常记录备注*/
    updateParameter = (data)=>{
        //去修改异常记录
        // const urlHead="http://rap2api.taobao.org/app/mock/233676"
        const pam = `id=${data.id}&remark=${data.remark}`
        return request({
            url: `/record/updateRemark?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    initParameterList = (params)=>{
        //去初始化
        const {equipmentItem} = this.props.location.state || this.state.locationState;
        const {page,page_size}=params
        this.setState({pageNum:page,pageSize:page_size},()=>{
            this._getParameterList(equipmentItem.equipmentCode,page,page_size)
        })
    }
    // 删除参数
    deleteParameter = (id) => {
        return request({
            url: `/parameter/deleteParameter?parameterId=${id}`,
            method: 'DELETE',
            success: res => {
                if (!res || res.code !== 0) {
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                message.error('网络请求错误');
            }
        })
    }
    addParameter = (param) => {
        const { detail } = this.state
        const { equipmentCode } = detail
        param.equipmentCode = equipmentCode
        if (!param.measurementId) {
            alert('请选择 measurementId 再提交')
            return
        }
        const moduleParam = {
            parameterName:param.parameterName?param.parameterName:'',
            unit:param.unit?param.unit:'',
            importance:param.importance?param.importance:''
        }
        const data = [{ ...param ,...moduleParam}]
        return request({
            url: `/parameter/addParameterList`,
            method: 'POST',
            data,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                if (err.response.data.code === -2) {
                    message.error('数据出错，请检查填写数据');
                } else {
                    message.error('网络请求错误');
                }
            }
        })
    }
    render() {
        const {columns, data, loading, typeList, codeList} = this.state;
        return (
            <div>
                <div className="filter-panel">
                    <FilterFormBox parent={this} typeList={typeList} codeList={codeList}  />
                </div>

                <div className="main-panel">
                    <div className="table">
                        <EditTable title={`权限组 (${ data.length })`}
                                   hasDefaultDate={true}
                                   hasPaging={false}
                                   columns={ columns }
                                   updateData={this.updateParameter}
                                   createData={this.addParameter}
                                   data={{list: data, isFetching:loading,pageInfo:{
                                       total:0,
                                       pageSize:1,
                                       page:2
                                   }}}
                                   deleteData={this.deleteParameter}
                                   getTableList={this.initParameterList}
                                   preserveRefreshTable={true}
                                   history={this.props.history}
                        >
                        </EditTable>
                    </div>
                </div>
            </div>
        );
    }
}

export default DeviceList;
