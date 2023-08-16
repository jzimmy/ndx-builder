// todo implement onDelete for all
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { BasicTypeElem, TypeElem } from "./type-elem";
import "./type-elem";
import {
  AnonymousDatasetDec,
  AnonymousGroupDec,
  AttributeDec,
  DatasetDec,
  DatasetTypeDef,
  GroupDec,
  GroupTypeDef,
  IncDatasetDec,
  IncGroupDec,
  LinkDec,
  NWBType,
  Quantity,
  Shape,
} from "./nwb/spec";
import {
  HasDatasetIncType,
  HasDefaultName,
  HasGroupIncType,
  HasTypeNameAndDescription,
} from "./parent";
import "./forminputs";
import "./subtree";
import { Initializers } from "./nwb/spec-defaults";
import { when } from "lit-html/directives/when.js";
import { map } from "lit-html/directives/map.js";
import { assertNever, Trigger } from "./hofs";
import { DatasetSubtree, GroupSubtree } from "./subtree";

export function quantityOrNameString(qOrS: Quantity | string): string {
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

function targetTypeNameString(targetType: NWBType) {
  if (targetType[1][0] == "None") return "None";
  let [kind, ty] = targetType[1];
  switch (kind) {
    case "Core":
    case "Typedef":
      return ty.neurodataTypeDef;
    default:
      assertNever(kind);
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

@customElement("link-dec-elem")
export class LinkDecElem extends BasicTypeElem<LinkDec> {
  firstFocusable?: HTMLElement | undefined;
  fill(val: LinkDec): void {
    this.data = val;
  }

  value(): LinkDec {
    return this.data;
  }

  clear(): void {
    this.data = Initializers.linkDec;
  }

  @state()
  protected data: LinkDec = {
    doc: "Some example documentation",
    targetType: [
      "GROUP",
      [
        "Typedef",
        { ...Initializers.groupTypeDef, neurodataTypeDef: "MyTarget" },
      ],
    ],
    quantityOrName: ["*", null],
  };

  protected icon: string = "link";
  render() {
    // careful runtime type check
    const hasQuantity = typeof this.data.quantityOrName != typeof "";
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
export class AttribDecElem extends BasicTypeElem<AttributeDec> {
  firstFocusable?: HTMLElement | undefined;
  fill(val: AttributeDec): void {
    this.data = val;
  }
  value(): AttributeDec {
    return this.data;
  }

  clear(): void {
    this.data = Initializers.attributeDec;
  }

  @state()
  protected data: AttributeDec = {
    name: "MyAttributeName",
    doc: "This is a description of my attribute it measures temperature",
    required: false,
    dtype: ["PRIMITIVE", "f32"],
    // data: ["SCALAR", ["EmptyString", true]],
    value: [
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

  protected icon: string = "edit_note";

  render() {
    const attribute = this.data;
    const value = attribute.value;

    let scalar = "";
    let shape: Shape[] = [];
    let scalarRequired = false;
    if (value[0] == "SCALAR") {
      scalar = value[1][0];
      scalarRequired = value[1][1];
    } else {
      shape = value[1];
    }

    return html`
      <type-elem .noProperties=${false} .noOptions=${false}>
        <type-header slot="topinput" .icon=${this.icon} .name=${attribute.name}>
        </type-header>
        <div slot="first-fields">${attribute.doc}</div>
        ${value[0] == "SCALAR"
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
              <shape-viz
                slot="properties"
                .label=${"Axes"}
                .shape=${shape}
              ></shape-viz>
              <div slot="properties" class="fieldlabel">Data Type</div>
            `}
        <labeled-boolean-field
          slot="options"
          .checked=${attribute.required}
          .label=${"Attribute required"}
        ></labeled-boolean-field>
      </type-elem>
    `;
  }
}

@customElement("group-anondec-elem")
export class AnonGroupDecElem extends BasicTypeElem<AnonymousGroupDec> {
  firstFocusable?: HTMLElement | undefined;

  @query("group-subtree")
  groupSubtree!: GroupSubtree;

  fill(val: AnonymousGroupDec): void {
    this.data = val;
    Promise.resolve(this.updateComplete).then(() =>
      this.groupSubtree.fill(val)
    );
  }

  value(): AnonymousGroupDec {
    return { ...this.data, ...this.groupSubtree.value() };
  }

  clear(): void {}

  protected icon = "folder";

  @state()
  protected data: AnonymousGroupDec = {
    doc: "This is a description of my group it measures temperature",
    name: "AnonGroup",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  };

  incTypeName = () => "None";
  instanceName = () => this.data.name;

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerDatasetDecBuilderForm: Trigger<DatasetDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerGroupDecBuilderForm: Trigger<GroupDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerLinkDecBuilderForm: Trigger<LinkDec> = (_v, _a, _c) => {};

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
          .minimized=${this.subtreeMinimize}
          .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
          .triggerLinkDecBuilderForm=${this.triggerLinkDecBuilderForm}
          .triggerGroupDecBuilderForm=${this.triggerGroupDecBuilderForm}
          .triggerDatasetDecBuilderForm=${this.triggerDatasetDecBuilderForm}
        ></group-subtree>
      </type-elem>
    `;
  }
}

@customElement("group-incdec-elem")
export class IncGroupDecElem extends BasicTypeElem<IncGroupDec> {
  firstFocusable?: HTMLElement | undefined;
  fill(val: IncGroupDec): void {
    this.data = val;
  }

  value(): IncGroupDec {
    return this.data;
  }

  clear(): void {
    this.data = Initializers.incGroupDec;
  }

  protected icon = "folder";
  @state()
  protected data: IncGroupDec = {
    doc: "This is an example incdec elem",
    neurodataTypeInc: ["Typedef", Initializers.groupTypeDef],
    quantityOrName: "",
  };

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
export class AnonDatasetDecElem extends BasicTypeElem<AnonymousDatasetDec> {
  @query("dataset-subtree")
  datasetSubtree!: DatasetSubtree;

  firstFocusable?: HTMLElement | undefined;
  fill(val: AnonymousDatasetDec): void {
    this.data = val;
    Promise.resolve(this.updateComplete).then(() =>
      this.datasetSubtree.fill(val)
    );
  }

  value(): AnonymousDatasetDec {
    return { ...this.data, ...this.datasetSubtree.value() };
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }

  protected icon: string = "dataset";
  incTypeName = () => "None";

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};

  @state()
  protected data: AnonymousDatasetDec = {
    doc: "example doc string for example anon datatype",
    name: "AnonDsetDec",
    shape: [],
    dtype: ["PRIMITIVE", "f32"],
    attributes: [],
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
          .setAttributeDecs=${(attributes: AttributeDec[]) =>
            (this.data = { ...this.data, attributes })}
          .minimized=${this.subtreeMinimize}
          slot="subtree"
        ></dataset-subtree>
      </type-elem>
    `;
  }
}

@customElement("dataset-incdec-elem")
export class IncDatasetDecElem extends BasicTypeElem<IncDatasetDec> {
  firstFocusable?: HTMLElement | undefined;
  fill(val: IncDatasetDec): void {
    this.data = val;
  }

  value(): IncDatasetDec {
    return this.data;
  }

  clear(): void {
    this.data = Initializers.incDatasetDec;
  }

  protected icon: string = "dataset";
  incTypeName = () => this.data.neurodataTypeInc[1]?.neurodataTypeDef || "None";

  @state()
  protected data: IncDatasetDec = {
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
> extends BasicTypeElem<T> {
  @state()
  protected abstract data: T;

  abstract type(): T;

  @property()
  hideEditBtn = true;

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
  @query("group-subtree")
  groupSubtree!: GroupSubtree;

  firstFocusable?: HTMLElement | undefined;
  fill(val: GroupTypeDef): void {
    this.data = val;
    Promise.resolve(this.updateComplete).then(() =>
      this.groupSubtree.fill(val)
    );
  }

  value(): GroupTypeDef {
    return { ...this.data, ...this.groupSubtree.value() };
  }

  clear(): void {
    this.data = Initializers.groupTypeDef;
  }

  type(): GroupTypeDef {
    return this.data;
  }

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerDatasetDecBuilderForm: Trigger<DatasetDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerGroupDecBuilderForm: Trigger<GroupDec> = (_v, _a, _c) => {};
  @property({ type: Function })
  triggerLinkDecBuilderForm: Trigger<LinkDec> = (_v, _a, _c) => {};

  @state()
  protected data: GroupTypeDef = {
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
        value: ["SCALAR", ["EmptyString", true]],
      },
    ],
    links: [],
    name: ["MyInstance", true],
  };

  incTypeName = this.data.neurodataTypeInc[1]!.neurodataTypeDef;

  protected icon: string = "folder";
  render() {
    return html`
      <type-elem
        .noProperties=${true}
        .noOptions=${false}
        .hideCloseBtn=${true}
        .hideEditBtn=${this.hideEditBtn}
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
          .groups=${this.data.groups}
          .datasets=${this.data.datasets}
          .attribs=${this.data.attributes}
          .links=${this.data.links}
          .setGroupDecs=${(groups: GroupDec[]) =>
            (this.data = { ...this.data, groups })}
          .setDatasetDecs=${(datasets: DatasetDec[]) =>
            (this.data = { ...this.data, datasets })}
          .setAttributeDecs=${(attributes: AttributeDec[]) =>
            (this.data = { ...this.data, attributes })}
          .setLinkDecs=${(links: LinkDec[]) =>
            (this.data = { ...this.data, links })}
          .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
          .triggerLinkDecBuilderForm=${this.triggerLinkDecBuilderForm}
          .triggerGroupDecBuilderForm=${this.triggerGroupDecBuilderForm}
          .triggerDatasetDecBuilderForm=${this.triggerDatasetDecBuilderForm}
        ></group-subtree>
      </type-elem>
    `;
  }

  static styles = [super.styles as CSSResultGroup, css``] as CSSResultGroup;
}

@customElement("dataset-def-elem")
export class DatasetTypeDefElem extends TypeDefElem<DatasetTypeDef> {
  @query("dataset-subtree")
  datasetSubtree!: DatasetSubtree;

  firstFocusable?: HTMLElement | undefined;

  fill(val: DatasetTypeDef): void {
    this.data = val;
    Promise.resolve(this.updateComplete).then(() =>
      this.datasetSubtree.fill(val)
    );
  }

  value(): DatasetTypeDef {
    return { ...this.data, ...this.datasetSubtree.value() };
  }

  clear(): void {
    this.data = Initializers.datasetTypeDef;
  }

  type(): DatasetTypeDef {
    return this.data;
  }

  @property({ type: Function })
  triggerAttribDecBuilderForm: Trigger<AttributeDec> = (_v, _a, _c) => {};

  protected icon: string = "dataset";

  @state()
  protected data: DatasetTypeDef = {
    neurodataTypeDef: "ExampleName",
    dtype: ["PRIMITIVE", "f32"],
    neurodataTypeInc: ["None", null],
    doc: "This is some description asdlkjfsd;lfa;lkj asd;fjda;lsfkj a;lsdfj a;dlskfj ;aldsfj fd;laksfj a;sdlfj ;adslfj asdl;j fds;lkjfd sal;lfapiudifhpqirq;kjgf e8yg;d dzk;fhfasohglakjgrflahjsfgois fsd fhglkafdg p",
    attributes: [
      {
        name: "MyAttributeName",
        doc: "This is a description of my attribute it measures temperature",
        required: false,
        dtype: ["PRIMITIVE", "f32"],
        value: ["SCALAR", ["EmptyString", true]],
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
        .hideEditBtn=${this.hideEditBtn}
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
          .setAttributeDecs=${(attributes: AttributeDec[]) =>
            (this.data = { ...this.data, attributes })}
          .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
        ></dataset-subtree>
      </type-elem>
    `;
  }
}
