import BomRouter from './bom';
import CooperateRouter from './cooperate';
import StockRouter from './stock';
import DashboardRouter from './dashboard';
import AuthorityRouter from './authority';
import KnowledgeManagementRouter from './knowledgeManagement';
import EquipmentMaintenanceRouter from './equipmentMaintenance';
import ExceptionalEventRouter from './exceptionalEvent';
import QualityManagementRouter from './qualityManagement';
import Logistics from './logistics';
import ElectronicTag from './electronicTags';
import WeighingManagementRouter from './weighingManagement';
import OrganizationConfig from './organizationConfig';

const viewsRoute = [
  ...BomRouter,
  ...StockRouter,
  ...KnowledgeManagementRouter,
  ...AuthorityRouter,
  ...CooperateRouter,
  ...DashboardRouter,
  ...ExceptionalEventRouter,
  ...QualityManagementRouter,
  ...ElectronicTag,
  ...Logistics,
  ...EquipmentMaintenanceRouter,
  ...WeighingManagementRouter,
  ...OrganizationConfig,
];

export default viewsRoute;
