// import React from 'react';
// import { Button, Search, PagingTable, Link, Drawer, Timeline } from 'components';
// import { graphql, createRefetchContainer } from 'react-relay';
// import { getQuery } from 'src/routes/getRouteParams';
// import { format } from 'utils/time';
// import styles from '../index.scss';

// type Props = {
//   viewer: any,
//   match: any,
//   relay: any,
// };

// const TimelineItem = Timeline.Item;

// class ProductOrderSyncList extends React.Component {
//   props: Props;
//   state = {
//     syncing: false,
//     showDrawer: false,
//     record: null,
//     syncingList: [],
//   };

//   syncAll = () => {
//     const { match, relay } = this.props;
//     // this.setState({ syncing: true });
//     // AddProductOrderLog({ variables: { input: {} } })().then(() => {
//     //   this.setState({ syncing: false });
//     //   const params = getQuery(match);
//     //   relay.refetch(params);
//     // });
//   };

//   getColumns = () => {
//     const { match, relay } = this.props;
//     return [
//       {
//         title: '项目号',
//         dataIndex: 'productOrderNo',
//         key: 'productOrderNo',
//       },
//       {
//         title: '成品物料',
//         maxWidth: 60,
//         dataIndex: 'materialCode',
//         key: 'material',
//         render: (text, record) => (
//           <div>
//             <div>
//               <Link>{record.materialCode}</Link>
//             </div>
//             <div>
//               <Link>{record.materialName}</Link>
//             </div>
//           </div>
//         ),
//       },
//       {
//         title: '订单号',
//         dataIndex: 'orderNo',
//         key: 'orderNo',
//       },
//       {
//         title: '客户名称',
//         dataIndex: 'customer',
//         key: 'customer',
//       },
//       {
//         title: '最新同步时间',
//         dataIndex: 'updatedAt',
//         key: 'updatedAt',
//         render: time => format(time),
//       },
//       {
//         title: '最新同步失败原因',
//         dataIndex: 'msg',
//         key: 'msg',
//       },
//       {
//         title: '操作',
//         maxWidth: 10,
//         render: (text, record) => {
//           const syncingList = this.state.syncingList;
//           const inSync = syncingList.includes(record.id);
//           return (
//             <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
//               {record.status.value === 'failure_2' || record.status.value === 'failure_3' ? (
//                 <Button
//                   style={{ marginRight: 10 }}
//                   loading={inSync}
//                   // onClick={() => {
//                   //   this.setState({ syncingList: syncingList.concat(record.id) });
//                   //   AddProductOrderLog({ variables: { input: { productOrderNo: record.productOrderNo } } })().then(() => {
//                   //     relay.refetch(getQuery(match));
//                   //     this.setState({ syncingList: syncingList.filter(id => id !== record.id) });
//                   //   });
//                   // }}
//                 >
//                   强制同步
//                 </Button>
//               ) : null}
//               <Link
//                 onClick={() => {
//                   this.handleWatchRecord(record);
//                 }}
//               >
//                 查看记录
//               </Link>
//             </div>
//           );
//         },
//       },
//     ];
//   };

//   handleWatchRecord = record => {
//     this.setState({
//       showDrawer: true,
//       record,
//     });
//   };

//   renderFilter = () => {
//     const { viewer, match } = this.props;
//     const params = getQuery(match);
//     const obj = {
//       time: format(viewer.organization.syncDateTime.createdAt),
//       count: viewer.organization.logs.count,
//     };
//     const { time, count } = obj;
//     const { syncing } = this.state;
//     return (
//       <div className={styles.top}>
//         <span>最近同步时间：{time}</span>
//         <span className={styles.item}>总计同步失败项目：{count}个</span>
//         <Button loading={syncing} onClick={this.syncAll} className={styles.syncButton}>
//           {syncing ? '同步中' : '全部同步'}
//         </Button>
//         <span className={styles.search}>
//           <Search className={styles.searchInput} placeholder="输入项目号" filterName="conditions" defaultValue={params.conditions} />
//         </span>
//       </div>
//     );
//   };
//   renderTable = () => {
//     const { organization: { logs } } = this.props.viewer;
//     const dataSource = logs.edges.map(({ node }) => ({
//       ...node,
//       key: node.id,
//     }));
//     return <PagingTable columns={this.getColumns()} dataSource={dataSource} total={logs.count} />;
//   };

//   renderRecordDrawer = () => {
//     const { showDrawer, record } = this.state;
//     if (!record) {
//       return null;
//     }
//     return (
//       <Drawer
//         title="同步记录"
//         open={showDrawer}
//         onCancel={() => this.setState({ showDrawer: false })}
//         sidebar={
//           <div>
//             <p>项目号: {record.productOrderNo}</p>
//             <Timeline>{record.logHistories.map(log => <TimelineItem title={format(log.updatedAt)}>{log.msg}</TimelineItem>)}</Timeline>
//           </div>
//         }
//       />
//     );
//   };

//   render() {
//     const { viewer } = this.props;
//     if (!viewer) {
//       return null;
//     }
//     return (
//       <div>
//         {this.renderFilter()}
//         {this.renderTable()}
//         {this.renderRecordDrawer()}
//       </div>
//     );
//   }
// }

// export default createRefetchContainer(
//   ProductOrderSyncList,
//   {
//     viewer: graphql`
//       fragment productOrderSyncList_viewer on Account
//         @argumentDefinitions(
//           first: { type: "Int", defaultValue: 10 }
//           from: { type: "Int", defaultValue: 0 }
//           conditions: { type: "String", defaultValue: "" }
//         ) {
//         organization {
//           syncDateTime {
//             id
//             createdAt
//           }
//           logs(logType: "productOrderType", first: $first, from: $from, conditions: $conditions) {
//             count
//             edges {
//               node {
//                 id
//                 msg
//                 productOrderNo
//                 materialCode
//                 materialName
//                 orderNo
//                 customer
//                 updatedAt
//                 status {
//                   display
//                   value
//                 }
//                 logHistories {
//                   status {
//                     display
//                   }
//                   msg
//                   updatedAt
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }
//     `,
//   },
//   graphql`
//     query productOrderSyncList_Query($first: Int, $from: Int, $conditions: String) {
//       viewer {
//         ...productOrderSyncList_viewer @arguments(first: $first, from: $from, conditions: $conditions)
//       }
//     }
//   `,
// );
