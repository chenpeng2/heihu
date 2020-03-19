import React, { PureComponent } from 'react';
import './auth0.css'
class Landing extends PureComponent {
    constructor(props) {
      super(props);
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <div className="main-wrapper">
                <main className="ulp-outer">
                    <section className="ulp-box">
                        <div className="ulp-box-inner">
                            <div className="ulp-main">
                                <header className="ulp-header">
                                    <img id="prompt-logo-center" src="https://mi.blacklake.cn/resource/logo_without_brand.png" alt="欢迎" />
                                    <h1>黑湖智造 MI</h1>
                                    <p className="text-simple">沃尔玛(中国) 仓储物流分析应用</p>
                                </header>
                                <div className="ulp-container">
                                    <div method="POST" className="ulp-db">
                                        <input type="hidden" name="state" value="g6Fo2SBFSHk5aHN4MmRrTE5pOFg1RnNhNEUzeG0zS0gxQ0l5aaN0aWTZIGVKWHVOQmlpX3NNel8xWWYybWtMcjcyY084T05TOUdro2NpZNkgMk4wTlg1azllb21YWUZEY25FWG5iMlg3cWx1bzJ2UDE" />
                                        {
                                            this.props.flag ?
                                            '' : 
                                            <div className="button-bar">
                                                <button onClick={ (e) => this.props.login() } name="action" value="default" className="ulp-button ulp-button-default ">登录</button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        )
    }
};

export default Landing