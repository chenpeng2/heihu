import React, { PureComponent } from 'react';
import ImgUrl from '../static/img/restTime.svg'
import ImgUrl2 from '../static/img/restTimeLogo.svg'
import { Input, message } from 'antd'
import {connect} from 'react-redux'
import * as loginActions from '../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from '../redux/selectors/loginSelector'
class RestTime extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            value:'',
            fontS:''
        }
    }
    enterSystem = ()=> {
        const {value} = this.state
        const user = this.props.userInfo && this.props.userInfo.user;
        if(value == user.username || value == user.email){
            window.location.hash='userManage'
        }else{
            message.error('邮箱号码/用户账号错误！')
        }
    }
    resize = ()=> {
        let fontS
        const clientW = document.body.clientWidth
        if(clientW < 1200){
            fontS = 30
        }else if(clientW < 1300){
            fontS = 37
        }else if(clientW < 1400){
            fontS = 45
        }else if(clientW < 1500){
            fontS = 52
        }else{
            fontS = 60
        }
        this.setState({fontS})
    }
    componentDidMount(){
        const _this = this
        document.onkeydown=function(e){
            var keyNum=window.event ? e.keyCode :e.which;
            if(keyNum==13){
                _this.enterSystem()
            }
        }
        _this.resize()
        window.onresize = function(){
            _this.resize()
        }
    }
    render() {
        const { fontS } = this.state
        const ReStyle={
            divS:{
                minWidth:'1200px',
                height:'100%',
                position:'relative',
                // background:`url(${ImgUrl}) no-repeat #fff`,
                // backgroundSize:'100%'
            },
            topLogo:{
                position: 'absolute',
                left: '64px',
                top: '32px',
            },
            posS:{
                width:'30%',
                position: 'absolute',
                left: '8%',
                top: '32%',
                text:{
                    width:'68%',
                    textAlign: 'justify',
                    textAlignLast: 'justify',
                    fontSize:fontS+'px',
                    color:'#fff',
                },
                pText:{
                    fontSize:'16px',
                    textAlign: 'justify',
                    textAlignLast: 'justify',
                    margin:'20px 0px 50px 0px'
                }
            }
        }
        return (
            <div style={ReStyle.divS} className="rest-time">
                <img src={ImgUrl} style={{width:'100%'}}/>
                <div style={ReStyle.topLogo}>
                    <img src={ImgUrl2} style={{width:'100%'}}/>
                </div>
                <div style={ReStyle.posS}>
                    <div style={ReStyle.posS.text}>
                        黑湖制造智能
                        <p style={ReStyle.posS.pText}>让数据驱动制造</p>
                    </div>
                    <div className="btn-container">
                        <Input placeholder="请输入邮箱号码/用户账号" onChange={e => this.setState({value:e.target.value})}/>
                        <span onClick={()=>this.enterSystem()}>点击进入系统</span>
                    </div>
                </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(RestTime)
