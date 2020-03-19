import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD, filterUrl } from 'util/index'
import { Select, Button, Table, Icon, message, Form, Input, Popconfirm } from 'antd';
import AddAuth from '../../component/addAuth'
import {connect} from 'react-redux'
import * as loginActions from '../../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from '../../../redux/selectors/loginSelector'
import Header from 'components/common/Header'
import {getCookie} from 'util/userApi'
const { Option } = Select;

// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    addAuthority = (data,value)=> {
        this.props.parent.props.setOpenState(data,value)
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='' value="">全部</Option>];
        const codes = defaultItem.concat( codeList.map( (item,index) => { return <Option key={index} value={item}>{ item }</Option> } ) );
        return (
            <div className="dis-flex">
                <Button className="filter-add" type="primary" icon="plus" onClick={()=>this.addAuthority(null,1)}>新增权限</Button>
                <Form layout="inline" className="default-form">
                    {/* 选择框支持输入搜索 */}
                    <Form.Item label="">
                        {getFieldDecorator('organization',{
                            rules: [{ required: false, message: '' }],
                        })(
                            <Select
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder="请选择你所在的机构" style={{ width: '200px' }}>{ codes }</Select>
                        )}
                    </Form.Item>
                    <Form.Item label="">
                        {getFieldDecorator('authority', {
                            rules: [{ required: false, message: '' }],
                        })(<Input placeholder="请输入你的权限名称"/>)}
                    </Form.Item>
                    <Button onClick={this.submit} className="filter-submit" type="primary" icon="search">查询</Button>
                </Form>
            </div>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class Authority extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,  // table loading
            data: [],       // 设备数据
            codeList: [], // 设备编码列表
            columns: [
                {
                    title: '机构',
                    dataIndex: 'organization',
                    render: (text,row) => <div>
                        {text}
                    </div>,
                },
                {
                    title: '权限',
                    dataIndex: 'authority',
                },
                {
                    title: '权限描述',
                    dataIndex: 'description',
                },
                {
                    title: '操作',
                    dataIndex: '',
                    width:110,
                    render: (text,row) => <div className="table-btn dis-flex">
                        <span className="btn" onClick={()=>this.editAuthority(row,3)}>
                            <i className='icon-iconmoon icon-Edit_Pencil-24px cursor'></i>
                        </span>
                        <Popconfirm
                            icon={null}
                            title="您确认删除【已有】权限吗?"
                            onConfirm={() => this.deleteAuthority(row)}
                            okText="删除"
                            cancelText="取消"
                        >
                            <span className="btn">
                                <i className='icon-iconmoon icon-delete_trashcan-24px cursor cursor'></i>
                            </span>
                        </Popconfirm>

                    </div>,
                }
            ],
            openType:null,
            roleEditData:null,//角色编辑数据
        }
    }
    //编辑权限
    editAuthority = (data,openType)=> {
        // 1，添加，3，修改
        this.props.setOpenState(data,openType)
    }
    //删除权限
    deleteAuthority = (row)=> {
        request({
            url: `/authority/deleteAuthority?id=${row.id}`,
            method: 'DELETE',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.getAuthorityList({})
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    getFilterFormMsg(child, formData) {
        this.getAuthorityList(formData)
    }
    getAuthorityList(data) {
        this.setState({ loading: true })
        const authority = data.authority?`&authority=${data.authority}`:''
        const userInfo = localStorage.getItem('login_data')
        const JSONUserInfo = userInfo && JSON.parse(userInfo)
        const organ = JSONUserInfo && JSONUserInfo.user.organization
        let organization = data.organization?`&organization=${data.organization}`:`&organization=${organ}`
        if(organization.indexOf('0') > -1){
            organization = ''
        }
        const pageNum = `&pageNum=1`
        const pageSize = `&pageSize=10`
        const pams = filterUrl(`${authority}${organization}${pageNum}${pageSize}`)
        request({
            url: `/authority/getAuthorityByCondition?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                let filterList = res.data&&res.data.authList
                this.setState({ data: filterList.map( (item, key) =>{
                    const newItem={}
                    newItem.key=key;
                    return {...newItem,...item}
                }), loading: false  })
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    // 获取机构列表
    getOrganizationList() {
        request({
            url: `/user/getOrganization`,
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
    componentDidMount() {
        this.getOrganizationList()
        this.getAuthorityList({})
    }
    render() {
        let {columns, data, loading, codeList} = this.state
        const { userInfo } = this.props
        if(userInfo.user && userInfo.user.organization!=='0'){
            codeList = codeList.filter((item,index)=>item === userInfo.user.organization)
        }
        return (
            <div>
                <Header/>
                <div className="main-panel">
                    <div className="filter-panel">
                        <FilterFormBox parent={this} codeList={codeList}  />
                    </div>
                    <div className="table">
                        <Table
                            className={data.length>0?'':'no-border'}
                            pagination={false}
                            loading={loading}
                            columns={columns}
                            dataSource={data}
                            size="large"
                        />
                    </div>
                </div>
                {/*模态框*/}
                <AddAuth width={540} height={360} refresh={()=>this.getAuthorityList({})} codeList={codeList}/>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        userInfo
    }
}
//映射Redux actions到组件的属性
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}
//连接组件
export default connect(mapStateToProps, mapDispatchToProps)(Authority)
