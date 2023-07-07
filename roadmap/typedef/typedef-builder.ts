import { LitElement, TemplateResult, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import {
  DatasetTypeDef,
  Dtype,
  GroupTypeDef,
  PrimitiveDtype,
  Quantity,
  TypeDef,
} from "../../nwb/spec";

class TypesBar extends LitElement {
  constructor(types: Array<TypedefElem>) {
    super();
    this.types = types;
  }

  @property()
  private types: Array<TypedefElem>;

  @state()
  active = -1;

  render() {
    return html``;
  }

  static styles = css``;
}

abstract class TypedefElem extends LitElement {
  @property()
  abstract typedef: DatasetTypeDef | GroupTypeDef;
  abstract readonly icon: TemplateResult<1>;
  abstract readonly kind: string;
  thumbnail = () => {
    return html`<div class="thumbnail">
      <span>${this.icon}</span>
      ${this.typedef.neurodataTypeDef}
    </div>`;
  };
  abstract body: () => TemplateResult<1>;
  abstract subtree: () => TemplateResult<1>;
  render() {
    return html`
      <div id="buttonbar">
        <span class="material-symbols-outlined">minimize</span>
        <span class="material-symbols-outlined">close</span>
      </div>
      ${this.body()} ${this.subtree()}
    `;
  }
}

export class GroupTypedefElem extends TypedefElem {
  body = () => html``;
  subtree = () => html``;

  @property()
  typedef: GroupTypeDef;

  kind = "Group";
  icon = html`<span class="material-symbols-outlined">folder</span>`;

  constructor(typedef: GroupTypeDef) {
    super();
    this.typedef = typedef;
  }

  render() {
    return html``;
  }
}

export class DatasetTypedefElem extends TypedefElem {
  body = () => html``;
  subtree = () => html``;

  @property()
  typedef: DatasetTypeDef;
  kind = "Dataset";
  icon = html`<span class="material-symbols-outlined">dataset</span>`;

  constructor(typedef: DatasetTypeDef) {
    super();
    this.typedef = typedef;
  }

  render() {
    return html``;
  }
}

abstract class TypedefBuilder extends LitElement {
  abstract export: () => TypeDef;
  @state()
  progress: number = 0;

  forms: TypeForm[] = [];

  private next() {
    this.progress++;
  }

  private back() {
    this.progress--;
  }

  close = () => {};

  render() {
    return html``;
  }
}

class GroupTypedefBuilder extends TypedefBuilder {
  export = () => {
    throw new Error("Not implemented");
  };

  incTypeForm = new IncTypeForm();
  typeNameForm = new TypedefForm();
  nameDescQuantityForm = new NameDescQuantityForm();
}

class DatasetTypedefBuilder extends TypedefBuilder {
  export = () => {
    throw new Error("Not implemented");
  };
}

abstract class TypeForm extends LitElement {
  abstract isComplete: () => boolean;
}

export class IncTypeForm extends TypeForm {
  isComplete = () => {
    return this.incType == "";
  };

  @property()
  domain: string = "";
  @property()
  incType: string = "";

  render() {}
}

export class DatasetShapeForm extends TypeForm {
  isComplete = () => {
    return this.axes.length > 0;
  };
  @property()
  axes: [number, string][] = [];
  @property()
  dtype: Dtype = ["PRIMITIVE", PrimitiveDtype.f32];
}

export class NameDescQuantityForm extends TypeForm {
  isComplete = () => {
    return this.name != "" && this.desc != "";
  };
  @property()
  name: string = "";
  @property()
  nameIsDefault: boolean = false;
  @property()
  desc: string = "";
  @property()
  quantity: Quantity = ["*", null];
}

export class TypedefForm extends TypeForm {
  isComplete = () => {
    return this.typename != "" && this.desc != "";
  };
  @property()
  typename: string = "";
  @property()
  desc: string = "";
  @property()
  quantity: Quantity = ["*", null];
}
