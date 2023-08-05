// todo implement onDelete for all
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BasicTypeElem } from "./type-elem";
import "./type-elem";
import {
  AnonymousDatasetDec,
  AnonymousGroupTypeDec,
  AttributeDec,
  DatasetDec,
  DatasetType,
  DatasetTypeDef,
  GroupDec,
  GroupType,
  GroupTypeDef,
  IncDatasetDec,
  IncGroupDec,
  LinkDec,
  Quantity,
  Shape,
} from "./nwb/spec";
import { symbols } from "./styles";
import {
  HasDatasetIncType,
  HasDefaultName,
  HasGroupIncType,
  HasTypeNameAndDescription,
} from "./parent";
import "./forms";
import { Initializers } from "./nwb/spec-defaults";
import { when } from "lit-html/directives/when.js";
import { map } from "lit-html/directives/map.js";
import { assertNever } from "./HOFS";

function quantityOrNameString(qOrS: Quantity | string): string {
  if (typeof qOrS == "string") return qOrS || "None";
  let [k, q] = qOrS;
  switch (k) {
    case "+":
      return "One or more";
    case "*":
      return "Any";
    case "?":
      return "Zero or one";
    case "Num":
      // we know it's a number
      return `${q as number}`;
    default:
      assertNever(k);
  }
}

function targetTypeNameString(targetType: GroupType | DatasetType) {
  if (targetType[0] == "None") return "None";
  let [kind, ty] = targetType;
  switch (kind) {
    case "Core":
    case "Typedef":
      return ty.neurodataTypeDef;
    default:
      assertNever(kind);
  }
}

@customElement("link-dec-elem")
export class LinkDecElem extends BasicTypeElem {
  @property()
  data: LinkDec = {
    doc: "Some example documentation",
    targetType: [
      "Typedef",
      { ...Initializers.groupTypeDef, neurodataTypeDef: "MyTarget" },
    ],
    quantityOrName: ["*", null],
  };

  get valid(): boolean {
    return false;
  }

  protected icon: string = "link";
  render() {
    // careful runtime type check
    const hasQuantity = typeof this.data.quantityOrName != typeof "";
    console.log(hasQuantity);
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}
        >${this.renderIcon()}
        <div id="keyword" slot="topinput">to</div>
        <div slot="topinput" class="inctype">
          ${targetTypeNameString(this.data.targetType)}
        </div>
        <div slot="first-fields">${this.data.doc}</div>
        <div slot="properties" class="fieldlabel">
          ${hasQuantity ? "Quantity" : "Name"}
        </div>
        <div slot="properties" class="fieldvalue">
          ${quantityOrNameString(this.data.quantityOrName)}
        </div>
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
    data: ["SCALAR", ["EmptyString", true]],
  };

  get valid(): boolean {
    return false;
  }

  protected icon: string = "edit_note";

  render() {
    const data = this.data.data;
    let scalar = "";
    let shape: Shape[] = [];
    let scalarRequired = false;
    if (data[0] == "SCALAR") {
      scalar = data[1][0];
      scalarRequired = data[1][1];
    } else {
      shape = data[1];
    }

    return html`
      <type-elem .noProperties=${false} .noOptions=${false}
        >${this.renderIcon()}
        <div slot="topinput" class="typename">${this.data.name}</div>
        <div slot="first-fields">${this.data.doc}</div>
        ${data[0] == "SCALAR"
          ? html`
              <div slot="properties" class="fieldlabel">Value</div>
              <div slot="properties" class="fieldvalue">${scalar}</div>
              <div class="checkwrapper" slot="properties">
                <input
                  type="checkbox"
                  ?checked=${scalarRequired}
                  style="pointer-events: none; focus: none;"
                />
                <div class="fieldlabel">Value required</div>
              </div>
            `
          : html`
              <div slot="properties" class="fieldlabel">Axes</div>
              <div slot="properties" class="fieldvalue">
                ${renderShape(shape)}
              </div>
              <div slot="properties" class="fieldlabel">Data Type</div>
            `}
        <div class="checkwrapper" slot="options">
          <input
            type="checkbox"
            ?checked=${this.data.required}
            style="pointer-events: none; focus: none;"
          />
          <div class="fieldlabel">Attribute required</div>
        </div>
      </type-elem>
    `;
  }
}

export abstract class GroupDecElem extends BasicTypeElem {
  protected icon: string = "folder";
  abstract incTypeName: () => string;
  abstract instanceName: () => string;

  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <div slot="topinput" class="instancename">${this.instanceName()}</div>
      <div id="keyword" slot="bottominput">of</div>
      <div slot="bottominput" class="inctype">${this.incTypeName()}</div>
    `;
  }
}

export abstract class DatasetDecElem extends BasicTypeElem {
  abstract incTypeName: () => string;
  protected icon: string = "dataset";
  protected topInput(): TemplateResult<1> {
    return html`
      ${this.renderIcon()}
      <div id="keyword" slot="topinput">of</div>
      <light-button slot="topinput">${this.incTypeName()}</light-button>
    `;
  }
}

@customElement("group-anondec-elem")
export class AnonGroupDecElem extends GroupDecElem {
  @property()
  data: AnonymousGroupTypeDec = {
    doc: "This is a description of my group it measures temperature",
    name: "AnonGroup",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  };

  incTypeName = () => "None";
  instanceName = () => this.data.name;

  get valid(): boolean {
    return false;
  }

  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        ${this.topInput()}

        <div slot="first-fields">${this.data.doc}</div>
        <name-or-quantity slot="properties"></name-or-quantity>
        <group-subtree slot="subtree"></group-subtree>
      </type-elem>
    `;
  }
}

@customElement("group-incdec-elem")
export class IncGroupDecElem extends GroupDecElem {
  @property()
  data: IncGroupDec = {
    doc: "",
    neurodataTypeInc: ["Typedef", Initializers.groupTypeDef],
    quantityOrName: "",
  };

  get valid(): boolean {
    return false;
  }

  incTypeName: () => string = () =>
    this.data.neurodataTypeInc[1]!.neurodataTypeDef;

  render() {
    return html`
      <type-elem .noProperties=${true} .noOptions=${true}>
        ${this.topInput()}
        <div slot="first-fields">${this.data.doc}</div>
      </type-elem>
    `;
  }
}

@customElement("dataset-anondec-elem")
export class AnonDatasetDecElem extends DatasetDecElem {
  incTypeName = () => "None";

  get valid(): boolean {
    return false;
  }

  @property()
  data: AnonymousDatasetDec = {
    doc: "example doc string for example anon datatype",
    name: "AnonDsetDec",
    shape: [],
    dtype: ["PRIMITIVE", "f32"],
    attributes: [],
  };

  render() {
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        ${this.topInput()}
        <div slot="first-fields">${this.data.name}</div>
        <div slot="first-fields">${this.data.doc}</div>
        <ndx-textarea slot="first-fields"></ndx-textarea>
        <nd-array slot="properties"></nd-array>
        <dataset-subtree slot="subtree"></dataset-subtree>
      </type-elem>
    `;
  }
}

@customElement("dataset-incdec-elem")
export class IncDatasetDecElem extends DatasetDecElem {
  incTypeName = () => this.data.neurodataTypeInc[1]!.neurodataTypeDef;

  get valid(): boolean {
    return false;
  }

  data: IncDatasetDec = {
    doc: "",
    neurodataTypeInc: ["Typedef", Initializers.datasetTypeDef],
    quantityOrName: "",
  };

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
    attributes: [
      {
        name: "MyAttributeNmae",
        doc: "This is a description of my attribute it measures temperature",
        required: false,
        dtype: ["PRIMITIVE", "f32"],
        data: ["SCALAR", ["EmptyString", true]],
      },
    ],
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
        <group-subtree
          .disabled=${false}
          slot="subtree"
          .attribs=${this.data.attributes}
        ></group-subtree>
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
                  <div>${k == "None" ? "Any" : k}</div>
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
    attributes: [
      {
        name: "MyAttributeNmae",
        doc: "This is a description of my attribute it measures temperature",
        required: false,
        dtype: ["PRIMITIVE", "f32"],
        data: ["SCALAR", ["EmptyString", true]],
      },
    ],
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
        <div slot="properties" class="fieldlabel">Axes</div>
        <div slot="properties" class="fieldvalue">
          ${renderShape(this.data.shape)}
        </div>
        <div slot="properties" class="fieldlabel">Data Type</div>
        <dataset-subtree
          .disabled=${false}
          slot="subtree"
          .attribs=${this.data.attributes}
        ></dataset-subtree>
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
  attribs: AttributeDec[] = [];
  @property()
  datasets: DatasetDec[] = [];
  @property()
  groups: GroupDec[] = [];
  @property()
  links: LinkDec[] = [];

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
        ${map(
          this.attribs,
          (attrib) =>
            html` <attrib-dec-elem
                .data=${attrib}
                slot="elems"
              ></attrib-dec-elem>
              <div slot="elems"></div>`
        )}
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
  attribs: AttributeDec[] = [];

  render() {
    return html`<subtree-branchh
      ?disabled=${this.disabled}
      slot="subtree"
      lastBranch="true"
      id="attributes"
    >
      <span slot="icon" class="material-symbols-outlined">edit_note</span>
      ${map(
        this.attribs,
        (attrib) =>
          html` <attrib-dec-elem .data=${attrib} slot="elems"></attrib-dec-elem>
            <div slot="elems"></div>`
      )}
    </subtree-branchh>`;
  }

  static styles = [symbols, css``];
}
