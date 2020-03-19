import { ROLES_HAS_AUDIT_AUTHORITY } from 'src/constants';

export const checkUserAuditAuthority = user => {
  if (!(user && user.roles && Array.isArray(user.roles))) {
    return false;
  }
  return !!user.roles.filter(e => ROLES_HAS_AUDIT_AUTHORITY.includes(e.id)).length;
};

export default 'dummy';
