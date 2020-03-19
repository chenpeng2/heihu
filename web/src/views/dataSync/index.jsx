// import React from 'react';
// import { Route } from 'react-router-dom';
// import { graphql } from 'react-relay';
// import relayRender2 from 'routes/relayRender2';
// import { getDefaultPrepareParams } from 'store/relay/helpers';
// import MaterialSyncList from './materialSync';
// import ProductOrderSyncList from './productOrdersSync';

// const materialSyncQuery = graphql`
//   query dataSync_material_Query($first: Int, $from: Int, $conditions: String) {
//     viewer {
//       ...materialSyncList_viewer @arguments(first: $first, from: $from, conditions: $conditions)
//     }
//   }
// `;

// const productOrderQuery = graphql`
//   query dataSync_productOrder_Query($first: Int, $from: Int, $conditions: String) {
//     viewer {
//       ...productOrderSyncList_viewer @arguments(first: $first, from: $from, conditions: $conditions)
//     }
//   }
// `;

// const route = (
//   <Route path="/dataSync">
//     <Route
//       render={relayRender2}
//       path="materialSync"
//       query={materialSyncQuery}
//       key="materialSync"
//       breadcrumbName="物料同步"
//       Component={MaterialSyncList}
//       prepareVariables={getDefaultPrepareParams()}
//     />
//     <Route
//       render={relayRender2}
//       path="productOrderSync"
//       query={productOrderQuery}
//       key="productOrderSync"
//       breadcrumbName="项目同步"
//       Component={ProductOrderSyncList}
//       prepareVariables={getDefaultPrepareParams()}
//     />
//   </Route>
// );

// export default route;
