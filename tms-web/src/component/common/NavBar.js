import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PivotLinkSize, PivotLinkFormat, PivotItem, Pivot } from 'office-ui-fabric-react/lib/Pivot';
// import { CalloutBasicExample } from '../../Callout/examples/Callout.Basic.Example';
// import { SpinnerBasicExample } from '../../Spinner/examples/Spinner.Basic.Example';
// import { PersonaBasicExample } from '../../Persona/examples/Persona.Basic.Example';

export class PivotFabric extends React.Component {
  constructor(props) {
    super(props);
    // this.method1 = this.method1.bind(this);
  }

  _handleLinkClick = (item) => {
    console.log(item.props)
    // this.setState({
    //   selectedKey: item.props.itemKey
    // })
  }

  render() {
  console.log(PivotLinkFormat)
    return (
      <div>
         {/* <div><Link  to="/NewUserTrackTable">Table</Link></div> */}
          {/* <div><Link  to="/TableComponent">antd Table</Link></div>
          <div><Link  to="/ChartAPIComponent">charts</Link></div> */}
        <Pivot linkFormat={PivotLinkFormat.links} linkSize={PivotLinkSize.normal}
         onLinkClick={this._handleLinkClick.bind(this)}>
          <PivotItem headerText="Callout" link="/NewUserTrackTable">
            <Label>Callout Example</Label>
            {/* <CalloutBasicExample /> */}
          </PivotItem>
          <PivotItem headerText="Spinner" link="/TableComponent">
            <Label>Spinner Example</Label>
            {/* <SpinnerBasicExample /> */}
          </PivotItem>
          <PivotItem headerText="Persona" link="/ChartAPIComponent">
            <Label>Persona Example</Label>
            {/* <PersonaBasicExample /> */}
          </PivotItem>
        </Pivot>
      </div>
    );
  }
  
}