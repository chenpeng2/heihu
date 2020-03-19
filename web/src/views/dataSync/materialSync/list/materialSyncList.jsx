// // @flow
// import * as React from 'react';
// import { graphql, createRefetchContainer } from 'react-relay';
// import { format } from 'utils/time';
// import { message, Button, Search, PagingTable, Drawer, Link, Timeline } from 'components';
// import { getQuery } from 'src/routes/getRouteParams';
// import styles from '../index.scss';

// const TimelineItem = Timeline.Item;

// type PropsType = {
//   viewer: any,
//   match: any,
//   relay: any,
// };

// type StateType = {
//   syncing: boolean,
//   showDrawer: boolean,
//   materialId: string,
//   record: any,
// };

// class MaterialSyncList extends React.Component<PropsType, StateType> {
//   state = {
//     syncing: false,
//     showDrawer: false,
//     materialId: '',
//     record: null,
//   };

//   syncAll = () => {
//     const { relay, match } = this.props;
//     // this.setState({
//     //   syncing: true,
//     // });
//     // AddMaterialLog({ variables: { input: {} } })()
//     //   .then(() => {
//     //     relay.refetch(getQuery(match));
//     //     this.setState({ syncing: false });
//     //     this.setState({ syncing: false });
//     //   })
//     //   .catch(() => {
//     //     message.success('同步成功');
//     //   });
//   };

//   getColumns = (): Array<mixed> => {
//     return [
//       {
//         title: '物料编码',
//         dataIndex: 'materialCode',
//         key: 'materialCode',
//       },
//       {
//         title: '物料名称',
//         dataIndex: 'materialName',
//         key: 'materialName',
//       },
//       {
//         title: '最新同步时间',
//         dataIndex: 'updatedAt',
//         key: 'updatedAt',
//         render: (time: string): string => format(time),
//       },
//       {
//         title: '最新同步失败原因',
//         dataIndex: 'msg',
//         key: 'statusDisplay',
//       },
//       {
//         title: '操作',
//         render: (text: string, record: mixed): React.Node => (
//           <Link
//             onClick={() => {
//               this.handleWatchRecord(record);
//             }}
//           >
//             查看记录
//           </Link>
//         ),
//       },
//     ];
//   };

//   handleWatchRecord = (record: any) => {
//     this.setState({
//       showDrawer: true,
//       record,
//     });
//   };
//   renderTable = (): React.Node => {
//     const dataSource = this.props.viewer.organization.logs.edges.map(({ node }: any): mixed => ({
//       ...node,
//       key: node.id,
//     }));
//     return <PagingTable columns={this.getColumns()} dataSource={dataSource} />;
//   };
//   renderFilter = (): React.Node => {
//     const { viewer: { organization } } = this.props;
//     const obj = {
//       time: format(organization.syncDateTime.createdAt),
//     };
//     const params = getQuery(this.props.match);
//     const { time } = obj;
//     const { syncing } = this.state;
//     return (
//       <div className={styles.top}>
//         <span>最近同步时间:{time}</span>
//         <Button loading={syncing} onClick={this.syncAll} className={styles.syncButton}>
//           {syncing ? '同步中' : '执行同步'}
//         </Button>
//         <div className={styles.search}>
//           <Search placeholder="物料编码/物料名称" filterName="conditions" defaultValue={params.conditions} />
//         </div>
//       </div>
//     );
//   };

//   renderRecordDrawer = (): React.Node => {
//     const { showDrawer, record } = this.state;
//     if (!record) {
//       return null;
//     }
//     return (
//       <Drawer
//         title="同步记录"
//         open={showDrawer}
//         onCancel={() => {
//           this.setState({
//             showDrawer: false,
//           });
//         }}
//         sidebar={
//           <div>
//             <p>物料编码: {record.materialName}</p>
//             <Timeline>{record.logHistories.map((log: any): any => <TimelineItem title={format(log.updatedAt)}>{log.msg}</TimelineItem>)}</Timeline>
//           </div>
//         }
//       />
//     );
//   };
//   render(): ?React.Node {
//     if (!this.props.viewer) {
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
//   MaterialSyncList,
//   {
//     viewer: graphql`
//       fragment materialSyncList_viewer on Account
//         @argumentDefinitions(
//           first: { type: "Int", defaultValue: 1 }
//           from: { type: "Int", defaultValue: 0 }
//           conditions: { type: "String", defaultValue: "" }
//         ) {
//         organization {
//           syncDateTime {
//             createdAt
//           }
//           logs(logType: "materialType", first: $first, from: $from, conditions: $conditions) {
//             count
//             edges {
//               node {
//                 id
//                 materialCode
//                 materialName
//                 createdAt
//                 updatedAt
//                 msg
//                 status {
//                   display
//                 }
//                 logHistories {
//                   status {
//                     display
//                   }
//                   createdAt
//                   updatedAt
//                   msg
//                 }
//               }
//             }
//           }
//         }
//       }
//     `,
//   },
//   graphql`
//     query materialSyncList_Query($first: Int, $from: Int, $conditions: String) {
//       viewer {
//         ...materialSyncList_viewer @arguments(first: $first, from: $from, conditions: $conditions)
//       }
//     }
//   `,
// );
