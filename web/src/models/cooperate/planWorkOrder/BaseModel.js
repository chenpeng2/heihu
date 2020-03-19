import { formatUnix } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { replaceSign } from 'src/constants';

import { PRODUCT_BATCH_TYPE_INPUT } from 'containers/plannedTicket/constants';

export class ProcessRouteModel {
  code: String;
  name: String;

  static fromJson(data: Object): ProcessRouteModel {
    if (!data) return null;
    const model = new ProcessRouteModel();
    const { code, name } = data;
    model.code = code;
    model.name = name;
    return model;
  }

  get processRouteDisplay(): String {
    return `${this.code || replaceSign}/${this.name || replaceSign}`;
  }
}

export class MBomModel {
  version: String;

  fromJson(data: Object): MBomModel {
    if (!data) return null;
    const model = new MBomModel();
    const { version } = data;
    model.version = version;
    return model;
  }

  option(): Object {
    return { key: this.version, label: this.version };
  }
}

export class EBomModel {
  version: String;

  fromJson(data: Object): EBomModel {
    if (!data) return null;
    const model = new EBomModel();
    const { version } = data;
    model.version = version;
    return model;
  }

  option(): Object {
    return { key: this.version, label: this.version };
  }
}

export class ProductBatchModel {
  type: String = PRODUCT_BATCH_TYPE_INPUT;
  value: String | Number;

  fromJson(data: Object): ProductBatchModel {
    if (!data) return null;
    const model = new ProductBatchModel();
    Object.keys(data).forEach(d => {
      if (model.hasOwnProperty(d)) {
        model[`${d}`] = data[`${d}`];
      }
    });
    return model;
  }
}

export class RelatedPersonModel {
  id: Number;
  name: String;

  static fromOption(data: Object): RelatedPersonModel {
    if (!data) return null;
    const model = new RelatedPersonModel();
    const { key, label } = data;
    model.id = key && Number(key);
    model.name = label;
    return model;
  }

  get option(): Object {
    return { key: this.id, label: this.name };
  }
}

export class ProcessModel {
  seq: Number;
  code: String;
  name: String;

  constructor(seq: Number = 1, code: String = '', name: String = '') {
    this.seq = seq;
    this.code = code;
    this.name = name;
  }

  static fromJson(data: Object): ProcessModel {
    if (!data) return null;
    const model = new ProcessModel();
    const { seq, code, name } = data;
    model.seq = seq;
    model.code = code;
    model.name = name;
    return model;
  }

  get processDisplay(): String {
    return `${this.code || replaceSign}/${this.name || replaceSign}`;
  }

  get option(): Object {
    return {
      key: { seq: this.seq, code: this.code, name: this.name },
      label: this.processDisplay,
    };
  }
}

/**
 * 仓储模型
 * @property {String} name 仓库/仓位 名称
 * @property {Number} id 仓库/仓位 ID
 * @property {String} code 仓库/仓位 编号
 *
 * @export
 * @class StorageModel
 */
export class StorageModel {
  name: String;
  code: String;
  id: Number;

  constructor(id: Number = 1, code: String = '', name: String = '') {
    this.name = name;
    this.code = code;
    this.id = id;
  }

  get option(): Object {
    return this.code ? { key: this.code, label: this.name } : undefined;
  }
}

export class DateTimeModel {
  timestamp: String = '';
  moment: Object;

  constructor(timestamp, moment) {
    this.timestamp = timestamp;
    this.moment = moment;
  }

  get dateDisplay(): any {
    return this.moment ? formatUnix(this.moment, 'YYYY/MM/DD') : undefined;
  }
}

export default 'dummy';
