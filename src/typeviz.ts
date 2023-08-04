// todo implement onDelete for all
import {
  css,
  CSSResultGroup,
  html,
  HTMLTemplateResult,
  LitElement,
  TemplateResult,
} from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BasicTypeElem } from "./type-elem";
import "./type-elem";
import {
  AttributeDec,
  DatasetTypeDef,
  GroupTypeDef,
  Shape,
  TypeDef,
} from "./nwb/spec";
import { symbols } from "./styles";
import {
  HasDatasetIncType,
  HasDefaultName,
  HasGroupIncType,
  HasInstanceNameAndDescription,
  HasTypeNameAndDescription,
} from "./parent";
import "./forms";
import { Initializers } from "./nwb/spec-defaults";
import { when } from "lit-html/directives/when.js";
import { InctypeBrowser } from "./playground";
import { map } from "lit-html/directives/map.js";

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
  data: AttributeDec = {
    name: "MyAttributeNmae",
    doc: "This is a description of my attribute it measures temperature",
    required: false,
    dtype: ["PRIMITIVE", "f32"],
    shape: [],
  };

  get valid(): boolean {
    return false;
  }

  protected icon: string = "edit_note";

  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${false}
        >${this.renderIcon()}
        <div slot="topinput" class="typename">${this.data.name}</div>
        <div slot="first-fields">${this.data.doc}</div>
        <div slot="properties" class="fieldlabel">Axes</div>
        <div slot="properties" class="fieldvalue">
          ${renderShape(this.data.shape)}
        </div>
        <div slot="properties" class="fieldlabel">Data Type</div>
        <div class="checkwrapper" slot="options">
          <input
            type="checkbox"
            ?checked=${this.data.required}
            style="pointer-events: none; focus: none;"
          />
          <div class="fieldlabel">Attribute required</div>
        </div>
        ${when(
          this.data.value,
          () => html`
            <div slot="options" class="fieldlabel">Default value</div>
            <div slot="options" class="fieldvalue">${this.data.value![0]}</div>
            <div class="checkwrapper" slot="options">
              <input
                type="checkbox"
                ?checked=${this.data.value![1]}
                style="pointer-events: none; focus: none;"
              />
              <div class="fieldlabel">Allow override</div>
            </div>
          `
        )}
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

abstract class TypeDefElem<
  T extends HasTypeNameAndDescription &
    HasDefaultName &
    (HasGroupIncType | HasDatasetIncType)
> extends BasicTypeElem {
  @property()
  abstract data: T;
  abstract type(): T;

  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <div slot="topinput" class="typename">${this.data.neurodataTypeDef}</div>
      <div slot="first-fields">${this.data.doc}</div>
    `;
  }

  protected bottomInput(): TemplateResult<1> {
    let incTypeName =
      this.data.neurodataTypeInc[0] != "None"
        ? this.data.neurodataTypeInc[1].neurodataTypeDef
        : "None";
    return html`<div id="keyword" slot="bottominput">extends</div>
      <div slot="bottominput" class="inctype">${incTypeName}</div>`;
  }

  protected defaultNameInput(): TemplateResult<1> {
    return html` <ndx-input> </ndx-input> `;
  }
}

@customElement("group-def-elem")
export class GroupTypeDefElem extends TypeDefElem<GroupTypeDef> {
  get valid(): boolean {
    throw new Error("Method not implemented.");
  }

  type(): GroupTypeDef {
    return this.data;
  }

  data: GroupTypeDef = {
    neurodataTypeDef: "Example",
    neurodataTypeInc: [
      "Typedef",
      { ...Initializers.groupTypeDef, neurodataTypeDef: "Parent" },
    ],
    doc: "Some example group typedef",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
    // name: ["MyInstance", true],
  };

  incTypeName = this.data.neurodataTypeInc[1]!.neurodataTypeDef;

  protected icon: string = "folder";
  render() {
    return html`
      <type-elem
        .noProperties=${true}
        .noOptions=${false}
        .hideCloseBtn=${true}
      >
        ${this.topInput()} ${this.bottomInput()}
        <div class="fieldlabel" slot="options">Default name</div>
        <div slot="options" class="fieldvalue">
          ${this.data.name ? this.data.name[0] : "None"}
        </div>
        ${when(
          this.data.name,
          () => html`
            <div class="checkwrapper" slot="options">
              <input
                type="checkbox"
                ?checked=${this.data.name ? this.data.name[1] : false}
                style="pointer-events: none; focus: none;"
              />
              <div class="fieldlabel">No override</div>
            </div>
          `
        )}
        <group-subtree .disabled=${false} slot="subtree"></group-subtree>
      </type-elem>
    `;
  }

  static styles = [super.styles as CSSResultGroup, css``] as CSSResultGroup;
}

function renderShape(shapes: Shape[]): TemplateResult<1> {
  if (shapes.length == 0) return html`<div>Not specified</div>`;
  const renderOneShape = (shape: Shape, i: number) =>
    shape.length > 0
      ? html`
          ${when(i > 0, () => "OR")}
          <div class="shape-container">
            ${shape.map(
              ([k, v]) =>
                html`<div>
                  <div>${k == "None" ? "#" : k}</div>
                  <div>${v}</div>
                </div> `
            )}
          </div>
        `
      : html``;
  return html` ${map(shapes, renderOneShape)} `;
}

@customElement("dataset-def-elem")
export class DatasetTypeDefElem extends TypeDefElem<DatasetTypeDef> {
  type(): DatasetTypeDef {
    return this.data;
  }

  get valid(): boolean {
    return false;
  }

  protected icon: string = "dataset";
  data: DatasetTypeDef = {
    neurodataTypeDef: "ExampleName",
    dtype: ["PRIMITIVE", "f32"],
    neurodataTypeInc: ["None", null],
    doc: "This is some description asdlkjfsd;lfa;lkj asd;fjda;lsfkj a;lsdfj a;dlskfj ;aldsfj fd;laksfj a;sdlfj ;adslfj asdl;j fds;lkjfd sal;lfapiudifhpqirq;kjgf e8yg;d dzk;fhfasohglakjgrflahjsfgois fsd fhglkafdg p",
    attributes: [],
    shape: [
      [
        [1, "x"],
        [2, "y"],
        ["None", "mycoordinate"],
      ],
      [
        [1, "x"],
        [2, "y"],
        [3, "z"],
        ["None", "mycoordinate"],
      ],
    ],
  };

  render() {
    return html`
      <type-elem
        .noProperties=${false}
        .noOptions=${false}
        .hideCloseBtn=${true}
      >
        ${this.topInput()} ${this.bottomInput()}
        <div class="fieldlabel" slot="options">Default name</div>
        <div slot="options" class="fieldvalue">
          ${this.data.name ? this.data.name[0] : "None"}
        </div>
        ${when(
          this.data.name,
          () => html`
            <div class="checkwrapper" slot="options">
              <input
                type="checkbox"
                ?checked=${this.data.name ? this.data.name[1] : false}
                style="pointer-events: none; focus: none;"
              />
              <div class="fieldlabel">No override</div>
            </div>
          `
        )}
        <div slot="properties" class="fieldlabel">
          Axes (# means any length)
        </div>
        <div slot="properties" class="fieldvalue">
          ${renderShape(this.data.shape)}
        </div>
        <div slot="properties" class="fieldlabel">Data Type</div>
        <dataset-subtree .disabled=${false} slot="subtree"></dataset-subtree>
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
