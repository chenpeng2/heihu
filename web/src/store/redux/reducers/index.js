import { reducer as lastFormPayload } from './lastFormPayload';
import { reducer as menu } from './menu';
import gantt from './gantt';
import fetch from './fetch';
import { reducer as expandStorageReducer, createStorage, editStorage } from './expandStorage';
import { reducer as notificationMenuState } from './notification';
import { reducer as productionTabReducer } from './productionCapacityRecords';
import { reducer as electronicTagPrint } from './electronicTagPrintReducers';
import { reducer as projectData } from './saveProjectData';
import qualityManagement from './qualityManagement';
import organizationConfig from './organizationConfig';
import app from './app';

const reducers = {
  fetch,
  lastFormPayload,
  menu,
  gantt,
  notificationMenuState,
  expandStorageReducer,
  createStorage,
  editStorage,
  productionTabReducer,
  projectData,
  electronicTagPrint,
  qualityManagement, // 质量管理
  organizationConfig, // 系统配置
  app,
};

export default reducers;
