import React, { PureComponent } from 'react';
import 'static/style/app.less'

import Header from 'components/common/Header'


//路由
// import { HashRouter } from 'react-router-dom'

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: 'CHINAUST'
    }
  }

  render() {
    return (
      <div className="App">
        <Header title={this.state.title}/>
      </div>
    );
  }
}

export default App;
