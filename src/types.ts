// todo implement onDelete for all
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BasicTypeElem } from "./type-elem";
import "./type-elem";
import { DatasetTypeDef, GroupTypeDef, TypeDef } from "./nwb/spec";
import { symbols } from "./styles";

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

  default: GroupTypeDef = {
    neurodataTypeDef: "",
    neurodataTypeInc: ["None", null],
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

  get valid(): boolean {
    return false;
  }

  protected icon: string = "dataset";
  default: DatasetTypeDef = {
    neurodataTypeDef: "",
    dtype: ["PRIMITIVE", "f32"],
    neurodataTypeInc: ["None", null],
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

/// SUBTREES

@customElement("group-subtree")
export class GroupSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = true;

  @property({ type: Function })
  triggerAttribDecBuilderForm = () => {};
  @property({ type: Function })
  triggerDatasetDecBuilderForm = () => {};
  @property({ type: Function })
  triggerGroupDecBuilderForm = () => {};
  @property({ type: Function })
  triggerLinkDecBuilderForm = () => {};

  @property()
  attribs: AttribDecElem[] = [];
  @property()
  datasets: DatasetDecElem[] = [];
  @property()
  groups: GroupDecElem[] = [];
  @property()
  links: LinkDecElem[] = [];

  render() {
    return html`<subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        id="groups"
      >
        <span slot="icon" class="material-symbols-outlined">folder</span>
      </subtree-branchh>
      <subtree-branchh ?disabled=${this.disabled} slot="subtree" id="datasets">
        <span slot="icon" class="material-symbols-outlined">dataset</span>
      </subtree-branchh>
      <subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        id="attributes"
      >
        <span slot="icon" class="material-symbols-outlined">edit_note</span>
      </subtree-branchh>
      <subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        lastBranch="true"
        id="links"
      >
        <span slot="icon" class="material-symbols-outlined">link</span>
      </subtree-branchh>`;
  }

  static styles = [
    symbols,
    css`
      span.material-symbols-outlined {
        font-size: 30px;
      }
    `,
  ];
}

@customElement("dataset-subtree")
export class DatasetSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = true;

  @property()
  attribs: AttribDecElem[] = [];

  render() {
    return html`<subtree-branchh
      ?disabled=${this.disabled}
      slot="subtree"
      lastBranch="true"
      id="attributes"
    >
      <span slot="icon" class="material-symbols-outlined">edit_note</span>
    </subtree-branchh>`;
  }

  static styles = symbols;
}
