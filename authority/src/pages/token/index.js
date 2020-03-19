import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD, filterUrl } from 'util/index'
import { Button, Table, Icon, message, Form, Popconfirm } from 'antd';
import AddToken from '../component/addToken'
import {connect} from 'react-redux'
import * as loginActions from '../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from '../../redux/selectors/loginSelector'
import Header from 'components/common/Header'

// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    addToken = (data,value)=> {
        this.props.parent.props.setOpenState(data,value)
    }
    render() {
        return (
            <div className="dis-flex">
                <Button size="large" className="filter-add" type="primary" icon="plus" onClick={()=>this.addToken(null,1)}>新增token配置</Button>
            </div>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class Token extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,  // table loading
            data: [],       // 设备数据
            columns: [
                {
                    title: '客户',
                    dataIndex: 'clientId',
                    render: (text,row) => <div>
                        <Icon type="user" style={{marginRight:8}}/>
                        {text}
                    </div>,
                },
                {
                    title: '权限范围',
                    dataIndex: 'scope',
                },
                {
                    title: 'refresh_token过期时间',
                    dataIndex: 'refreshTokenValidity',
                },
                {
                    title: 'access_token过期时间',
                    dataIndex: 'accessTokenValidity',
                },
                {
                    title: '授权代理类型',
                    dataIndex: 'authorizedGrantTypes',
                },
                {
                    title: '操作',
                    dataIndex: '',
                    width:110,
                    render: (text,row) => <div className="table-btn dis-flex">
                        <span className="btn" onClick={()=>this.editToken(row,3)}>
                            <i className='icon-iconmoon icon-Edit_Pencil-24px cursor'></i>
                        </span>
                        <Popconfirm
                            icon={null}
                            title="您确认删除【已有】token配置吗?"
                            onConfirm={() => this.deleteToken(row)}
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
    //新增token
    editToken = (data,openType)=> {
        // 1，添加，3，修改
        this.props.setOpenState(data,openType)
    }
    //删除权限
    deleteToken = (row)=> {
        request({
            url: `/oauth/deleteOauthClientDetail?clientId=${row.clientId}`,
            method: 'DELETE',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.getOauthClientDetails({})
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    getOauthClientDetails() {
        this.setState({ loading: true })
        const pageNum = `pageNum=1`
        const pageSize = `&pageSize=10`
        const pams = filterUrl(`${pageNum}${pageSize}`)
        request({
            url: `/oauth/getOauthClientDetails?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ data: res.data&&res.data.OauthClientDetailList.map( (item, key) =>{
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
    componentDidMount() {
        this.getOauthClientDetails({})
    }
    render() {
        const {columns, data, loading} = this.state;
        return (
            <div>
                <Header cleanComponent={true} header={'安全设置'} headerMenu={[{title: 'token安全设置', key: '/token'}]}/>
                <div className="main-panel">
                    <div className="filter-panel">
                        <FilterFormBox parent={this}/>
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
                <AddToken width={540} height={360} refresh={()=>this.getOauthClientDetails()}/>
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
export default connect(mapStateToProps, mapDispatchToProps)(Token)
