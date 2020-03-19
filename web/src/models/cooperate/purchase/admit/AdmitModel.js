import AdmitCardModel from './AdmitCardModel';

export default class AdmitModel {
  /** 卡片视图数据 `any[]` */
  cardList;
  /** 表格视图数据 `any[]` */
  columnsData;
  /** 采购订单信息 */
  procureOrder;
  /** `Number` 选中清单项目数 */
  selectedCount;
  /** cardList `length` */
  totalCount;

  static of() {
    const model = new AdmitModel();
    return model;
  }

  static from(json) {
    const model = this.of();
    model.cardList = this.getCardList(json);
    model.selectedCount = model.cardList.length;
    model.totalCount = model.cardList.length;
    model.columnsData = this.getColumnsData(json);
    model.procureOrder = json.procureOrder;
    return model;
  }

  static getCardList(json) {
    const {
      materials,
      procureOrder,
    } = json || {};
    if (!Array.isArray(materials)) return [];
    const cardList = [];
    materials.forEach(material => {
      if (procureOrder) {
        material.supplier = procureOrder.supplier;
      }
      const cardModel = AdmitCardModel.from(material);
      if (cardModel) {
        cardList.push(cardModel);
      }
    });
    return cardList;
  }

  static getColumnsData(json) {
    const {
      materials,
      procureOrder,
    } = json || {};
    if (!Array.isArray(materials)) return [];
    materials.forEach(material => {
      material.supplier = procureOrder.supplier;
    });
    return materials;
  }

  addCodeAndAmountItem(index) {
    if (!Array.isArray(this.cardList)) return [];
    const newCardList = [];
    this.cardList.forEach((cardModel, i) => {
      if (index === i && cardModel) {
        cardModel.addMaterialItem();
      }
      newCardList.push(cardModel);
    });
    this.cardList = newCardList;
  }

  removeCodeAndAmountItem(rowIndex, columnIndex) {
    if (!Array.isArray(this.cardList)) return [];
    const newCardList = [];
    this.cardList.forEach((cardModel, i) => {
      if (rowIndex === i && cardModel) {
        cardModel.removeMaterialItem(columnIndex);
      }
      newCardList.push(cardModel);
    });
    this.cardList = newCardList;
  }

  updateCardList(card, index) {
    if (!Array.isArray(this.cardList) || !card) return;
    let count = 0;
    this.cardList.forEach((item, i) => {
      if (index === i) {
        item = card;
      }
      const { checked } = item || {};
      if (checked) {
        count++;
      }
    });
    this.selectedCount = count;
  }
}