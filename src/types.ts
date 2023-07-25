// todo implement onDelete for all
import { html, PropertyValueMap, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BasicTypeElem } from "./type-elem";
import "./type-elem";
import "./forms";
import { DefaultNameFormpageElem, GroupInctypeBrowser } from "./forms";
import {
  CoreDatasetType,
  DatasetTypeDef,
  GroupTypeDef,
  PrimitiveDtype,
  TypeDef,
} from "./nwb/spec";
import { ComposedFormElem, composeForm, NdxFormManager } from "./form-elem";

@customElement("link-dec-elem")
export class LinkDecElem extends BasicTypeElem {
  get valid(): boolean {
    return false;
  }
  protected icon: string = "link";
  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}
        >${this.renderIcon()}
        <div id="keyword" slot="topinput">to</div>
        <light-button slot="topinput">Pick a target</light-button>
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <name-or-quantity slot="properties"></name-or-quantity>
      </type-elem>
    `;
  }
}

@customElement("attrib-dec-elem")
export class AttribDecElem extends BasicTypeElem {
  get valid(): boolean {
    return false;
  }
  protected icon: string = "edit_note";
  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}
        >${this.renderIcon()}
        <ndx-input slot="topinput" label="Attribute name"></ndx-input>
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <nd-array slot="properties"></nd-array>
      </type-elem>
    `;
  }
}

export abstract class GroupDecElem extends BasicTypeElem {
  @property()
  abstract incType: { name: string };
  protected icon: string = "folder";
  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <div id="keyword" slot="topinput">of</div>
      <light-button
        slot="topinput"
        class=${classMap({ selected: this.incType.name != "Pick a type" })}
        >${this.incType.name}</light-button
      >
    `;
  }
}

export abstract class DatasetDecElem extends BasicTypeElem {
  @property()
  abstract incType: { name: string };
  protected icon: string = "dataset";
  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <div id="keyword" slot="topinput">of</div>
      <light-button
        slot="topinput"
        class=${classMap({ selected: this.incType.name != "Pick a type" })}
        >${this.incType.name}</light-button
      >
    `;
  }
}

@customElement("group-anondec-elem")
export class AnonGroupDecElem extends GroupDecElem {
  get valid(): boolean {
    return false;
  }
  incType: { name: string } = { name: "None" };
  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        ${this.topInput()}
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <name-or-quantity slot="properties"></name-or-quantity>
        <group-subtree slot="subtree"></group-subtree>
      </type-elem>
    `;
  }
}

@customElement("group-incdec-elem")
export class IncGroupDecElem extends GroupDecElem {
  get valid(): boolean {
    return false;
  }
  incType: { name: string } = { name: "Pick a type" };
  render() {
    return html`
      <type-elem .noProperties=${true} .noOptions=${true}>
        ${this.topInput()}
        <ndx-textarea slot="first-fields"></ndx-textarea>
      </type-elem>
    `;
  }
}

@customElement("dataset-anondec-elem")
export class AnonDatasetDecElem extends DatasetDecElem {
  get valid(): boolean {
    return false;
  }
  incType: { name: string } = { name: "None" };
  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        ${this.topInput()}
        <ndx-input slot="first-fields" label="Instance name"></ndx-input>
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <nd-array slot="properties"></nd-array>
        <dataset-subtree slot="subtree"></dataset-subtree>
      </type-elem>
    `;
  }
}

@customElement("dataset-incdec-elem")
export class IncDatasetDecElem extends DatasetDecElem {
  get valid(): boolean {
    return false;
  }
  incType: { name: string } = { name: "Pick a type" };
  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        ${this.topInput()}
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <name-or-quantity slot="properties"></name-or-quantity>
      </type-elem>
    `;
  }
}

abstract class TypeDefElem<T> extends BasicTypeElem {
  @property()
  incType: { name: string } = { name: "Pick a type" };

  @query("#form-manager")
  formManager!: NdxFormManager;

  abstract formpages: ComposedFormElem<T>[];
  abstract default: T;
  abstract fill(v: T): void;
  abstract typedef(): TypeDef | null;

  protected forms(): TemplateResult<1> {
    return html`<ndx-form-manager
      id="form-manager"
      slot="form"
    ></ndx-form-manager>`;
  }

  protected triggerForm: () => void = () => {
    throw new Error("Trigger form not set");
  };

  protected _buildForm() {
    const realtrigger = composeForm(
      this.formManager,
      this.default,
      this.formpages
    );
    this.triggerForm = () => {
      this.typeElem.formOpen = true;
      realtrigger(
        () => {
          this.typeElem.formOpen = false;
        },
        (v) => {
          console.log(v);
          this.typeElem.formOpen = false;
        }
      );
    };
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.firstUpdated(_changedProperties);
    this._buildForm();
    this.requestUpdate();
    // TODO REMOVE TEMPORARY
    // this.triggerForm();
  }

  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <ndx-input slot="topinput" label="New type name"></ndx-input>
      <ndx-textarea slot="first-fields"></ndx-textarea>
    `;
  }

  protected bottomInput(): TemplateResult<1> {
    return html`<div id="keyword" slot="bottominput">extends</div>
      <light-button
        @click=${this.triggerForm}
        slot="bottominput"
        class=${classMap({ selected: this.incType.name != "Pick a type" })}
        >${this.incType.name}</light-button
      >`;
  }
}

@customElement("group-def-elem")
export class GroupTypeDefElem extends TypeDefElem<GroupTypeDef> {
  get valid(): boolean {
    throw new Error("Method not implemented.");
  }

  fill(_v: GroupTypeDef): void {
    throw new Error("Method not implemented.");
  }

  typedef(): TypeDef | null {
    const type = this.type();
    if (type == null) return null;
    return ["GROUP", type];
  }

  type(): GroupTypeDef | null {
    return null;
  }

  formpages: ComposedFormElem<GroupTypeDef>[] = [
    new GroupInctypeBrowser(),
    new DefaultNameFormpageElem(),
  ];

  default: GroupTypeDef = {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  };

  incType = { name: "SpikeTimeSeries" };

  protected icon: string = "folder";
  render() {
    return html`
      <type-elem .noProperties=${true} .noOptions=${false}>
        ${this.topInput()}
        <default-name slot="options"></default-name>
        ${this.bottomInput()}
        <group-subtree .disabled=${false} slot="subtree"></group-subtree>
        ${this.forms()}
        <light-button slot="save">Save</light-button>
      </type-elem>
    `;
  }
}

@customElement("dataset-def-elem")
export class DatasetTypeDefElem extends TypeDefElem<DatasetTypeDef> {
  fill(_v: DatasetTypeDef): void {
    throw new Error("Method not implemented.");
  }

  typedef(): TypeDef | null {
    const type = this.type();
    if (type == null) return null;
    return ["DATASET", type];
  }

  type(): DatasetTypeDef | null {
    return null;
  }

  formpages: ComposedFormElem<DatasetTypeDef>[] = [];

  get valid(): boolean {
    return false;
  }

  protected icon: string = "dataset";
  default: DatasetTypeDef = {
    neurodataTypeDef: "",
    dtype: ["PRIMITIVE", PrimitiveDtype.f32],
    neurodataTypeInc: ["Core", CoreDatasetType.None],
    doc: "",
    attributes: [],
    shape: [],
  };

  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${false}>
        ${this.topInput()}
        <nd-array slot="properties"></nd-array>
        <default-name slot="options"></default-name>
        ${this.bottomInput()}
        <dataset-subtree slot="subtree"></dataset-subtree>
        ${this.forms()}
        <light-button slot="save">Save</light-button>
      </type-elem>
    `;
  }
}
