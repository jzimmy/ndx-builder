// todo implement onDelete for all
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { BasicTypeElem, TypeElem } from "./type-elem";
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
      <type-elem .noProperties=${false} .noOptions=${true}>
        <type-header
          slot="topinput"
          .icon=${"link"}
          .keyword=${"to"}
          .base=${targetTypeNameString(this.data.targetType)}
        >
        </type-header>
        <div slot="first-fields">${this.data.doc}</div>
        <labeled-field-value
          slot="properties"
          .label=${hasQuantity ? "Quantity" : "Name"}
          .value=${quantityOrNameString(this.data.quantityOrName)}
        >
        </labeled-field-value>
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
    // data: ["SCALAR", ["EmptyString", true]],
    data: [
      "SHAPE",
      [
        [
          [1, "x"],
          [2, "y"],
          ["None", "mycoordinate"],
        ],
      ],
    ],
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

    console.log(this.data.data, shape);

    return html`
      <type-elem .noProperties=${false} .noOptions=${false}>
        <type-header slot="topinput" .icon=${this.icon} .name=${this.data.name}>
        </type-header>
        <div slot="first-fields">${this.data.doc}</div>
        ${data[0] == "SCALAR"
          ? html`
              <labeled-field-value
                slot="properties"
                .label=${"Value"}
                .value=${scalar}
              ></labeled-field-value>
              <labeled-boolean-field
                slot="properties"
                .checked=${scalarRequired}
                .label=${"Value required"}
              ></labeled-boolean-field>
            `
          : html`
              <!-- <div slot="properties" class="fieldlabel">Axes</div>
              <div slot="properties" class="fieldvalue">
                ${renderShape(shape)}
              </div> -->
              <shape-viz
                slot="properties"
                .label=${"Axes"}
                .shape=${shape}
              ></shape-viz>
              <div slot="properties" class="fieldlabel">Data Type</div>
            `}
        <!-- <div class="checkwrapper" slot="options">
          <input
            type="checkbox"
            ?checked=${this.data.required}
            style="pointer-events: none; focus: none;"
          />
          <div class="fieldlabel">Attribute required</div>
        </div> -->
        <labeled-boolean-field
          slot="options"
          .checked=${this.data.required}
          .label=${"Attribute required"}
        ></labeled-boolean-field>
      </type-elem>
    `;
  }
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
// export abstract class GroupDecElem extends BasicTypeElem {
//   protected icon: string = "folder";
//   abstract incTypeName: () => string;
//   abstract instanceName: () => string;

//   protected topInput(): TemplateResult<1> {
//     return html`
//       ${this.renderIcon()}
//       <div slot="topinput" class="instancename">${this.instanceName()}</div>
//       <div id="keyword" slot="bottominput">of</div>
//       <div slot="bottominput" class="inctype">${this.incTypeName()}</div>
//     `;
//   }
// }

// export abstract class DatasetDecElem extends BasicTypeElem {
//   abstract incTypeName: () => string;
//   protected icon: string = "dataset";
//   protected topInput(): TemplateResult<1> {
//     return html`
//       ${this.renderIcon()}
//       <div id="keyword" slot="topinput">of</div>
//       <light-button slot="topinput">${this.incTypeName()}</light-button>
//     `;
//   }
// }

@customElement("group-anondec-elem")
export class AnonGroupDecElem extends BasicTypeElem {
  protected icon = "folder";

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

  @property()
  subtreeMinimize = true;

  @query("type-elem")
  typeElem!: TypeElem;

  render() {
    return html`
      <type-elem
        .noProperties=${true}
        .noOptions=${true}
        .onToggleMinimize=${(m: boolean) => (this.subtreeMinimize = m)}
      >
        <type-header
          slot="topinput"
          .name=${this.data.name}
          .keyword=${"of"}
          .icon=${"folder"}
          .base=${"None"}
        ></type-header>
        <div slot="first-fields">${this.data.doc}</div>
        <group-subtree
          slot="subtree"
          .disabled=${false}
          .attribs=${this.data.attributes}
          .groups=${this.data.groups}
          .datasets=${this.data.datasets}
          .links=${this.data.links}
          .minimized=${this.subtreeMinimize}
        ></group-subtree>
      </type-elem>
    `;
  }
}

@customElement("group-incdec-elem")
export class IncGroupDecElem extends BasicTypeElem {
  protected icon = "folder";
  @property()
  data: IncGroupDec = {
    doc: "This is an example incdec elem",
    neurodataTypeInc: ["Typedef", Initializers.groupTypeDef],
    quantityOrName: "",
  };

  get valid(): boolean {
    return false;
  }

  incTypeName: () => string = () =>
    this.data.neurodataTypeInc[1]?.neurodataTypeDef || "None";

  render() {
    const hasNameNotQuantity = typeof this.data.quantityOrName == typeof "";
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        <type-header
          slot="topinput"
          .icon=${this.icon}
          .keyword=${"of"}
          .base=${this.incTypeName()}
        ></type-header>
        <div slot="first-fields">${this.data.doc}</div>
        <labeled-field-value
          slot="properties"
          .label=${hasNameNotQuantity ? "Name" : "Quantity"}
          .value=${quantityOrNameString(this.data.quantityOrName)}
        ></labeled-field-value>
      </type-elem>
    `;
  }
}

@customElement("dataset-anondec-elem")
export class AnonDatasetDecElem extends BasicTypeElem {
  protected icon: string = "dataset";
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
    attributes: [
      // {
      //   name: "MyAttributeNmae",
      //   doc: "This is a description of my attribute it measures temperature",
      //   required: false,
      //   dtype: ["PRIMITIVE", "f32"],
      //   data: ["SCALAR", ["EmptyString", true]],
      // },
    ],
  };

  @property()
  subtreeMinimize: boolean = true;

  render() {
    return html`
      <type-elem
        .noProperties=${false}
        .noOptions=${true}
        .onToggleMinimize=${(m: boolean) => (this.subtreeMinimize = m)}
      >
        <type-header
          slot="topinput"
          .keyword=${"of"}
          .icon=${this.icon}
          .name=${this.data.name}
          .base=${"None"}
        ></type-header>
        <div slot="first-fields">${this.data.doc}</div>
        <shape-viz
          slot="properties"
          .label=${"Axes"}
          .shape=${this.data.shape}
        ></shape-viz>
        <labeled-field-value
          slot="properties"
          .label=${"Data Type"}
          .value=${this.data.dtype[1]}
        ></labeled-field-value>
        <dataset-subtree
          .attribs=${this.data.attributes}
          .minimized=${this.subtreeMinimize}
          slot="subtree"
        ></dataset-subtree>
      </type-elem>
    `;
  }
}

@customElement("dataset-incdec-elem")
export class IncDatasetDecElem extends BasicTypeElem {
  protected icon: string = "dataset";
  incTypeName = () => this.data.neurodataTypeInc[1]?.neurodataTypeDef || "None";

  get valid(): boolean {
    return false;
  }

  data: IncDatasetDec = {
    doc: "",
    neurodataTypeInc: ["Typedef", Initializers.datasetTypeDef],
    quantityOrName: "",
  };

  render() {
    const hasQuantity = typeof this.data.quantityOrName != typeof "";
    return html`
      <type-elem .noProperties=${false} .noOptions=${true}>
        <type-header
          slot="topinput"
          .icon=${this.icon}
          .keyword=${"of"}
          .base=${this.incTypeName()}
        ></type-header>
        <div slot="first-fields">${this.data.doc}</div>
        <labeled-field-value
          slot="properties"
          .label=${hasQuantity ? "Quantity" : "Name"}
          .value=${quantityOrNameString(this.data.quantityOrName)}
        >
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

  protected header(): TemplateResult<1> {
    let incTypeName =
      this.data.neurodataTypeInc[0] != "None"
        ? this.data.neurodataTypeInc[1].neurodataTypeDef
        : "None";
    return html`
      <type-header
        slot="topinput"
        .icon=${this.icon}
        .name=${this.data.neurodataTypeDef}
        .keyword=${"extends"}
        .typedef=${true}
        .base=${incTypeName}
      ></type-header>
      <div slot="first-fields">${this.data.doc}</div>
    `;
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
        ${this.header()}
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
          .groups=${this.data.groups}
          .datasets=${this.data.datasets}
          .links=${this.data.links}
        ></group-subtree>
      </type-elem>
    `;
  }

  static styles = [super.styles as CSSResultGroup, css``] as CSSResultGroup;
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
        ${this.header()}
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

  @property()
  minimized = false;

  render() {
    const allBranchesFilled =
      (this.attribs.length > 0 &&
        this.groups.length > 0 &&
        this.datasets.length > 0 &&
        this.links.length > 0) ||
      !this.minimized;
    return html`
      ${when(
        this.groups.length > 0 || !this.minimized,
        () => html`
          <subtree-branchh
            ?disabled=${this.disabled}
            slot="subtree"
            id="groups"
          >
            <span slot="icon" class="material-symbols-outlined">folder</span>
          </subtree-branchh>
        `
      )}
      ${when(
        this.datasets.length > 0 || !this.minimized,
        () => html`
          <subtree-branchh
            ?disabled=${this.disabled}
            slot="subtree"
            id="datasets"
          >
            <span slot="icon" class="material-symbols-outlined">dataset</span>
          </subtree-branchh>
        `
      )}
      ${when(
        this.datasets.length > 0 || !this.minimized,
        () => html`
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
        `
      )}
      ${when(
        this.links.length > 0 || !this.minimized,
        () => html`
          <subtree-branchh
            ?disabled=${this.disabled}
            slot="subtree"
            lastBranch=${allBranchesFilled}
            id="links"
          >
            <span slot="icon" class="material-symbols-outlined">link</span>
          </subtree-branchh>
        `
      )}
      ${when(
        !allBranchesFilled,
        () => html`<hidden-subtree slot="subtree"></hidden-subtree>`
      )}
    `;
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
  disabled = false;

  @property()
  attribs: AttributeDec[] = [];

  @property({ type: Boolean })
  minimized = false;

  render() {
    console.log(this.minimized);
    console.log(this.attribs.length);
    const allBranchesFilled = this.attribs.length > 0 || !this.minimized;
    return html` ${when(
      allBranchesFilled,
      () => html`
        <subtree-branchh
          ?disabled=${this.disabled}
          slot="subtree"
          id="attributes"
          .lastBranch=${allBranchesFilled}
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
      `,
      () => html` <hidden-subtree slot="subtree"></hidden-subtree> `
    )}`;
  }

  static styles = [symbols, css``];
}
