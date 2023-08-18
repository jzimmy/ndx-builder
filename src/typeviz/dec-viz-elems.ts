import { targetTypeNameString, quantityOrNameString } from "./viz-utils";
import { html } from "lit";
import { customElement, state, query, property } from "lit/decorators.js";
import { Trigger } from "../logic/hofs";
import {
  LinkDec,
  AttributeDec,
  Shape,
  AnonymousGroupDec,
  DatasetDec,
  GroupDec,
  IncGroupDec,
  AnonymousDatasetDec,
  IncDatasetDec,
} from "../nwb/spec";
import { Initializers } from "../nwb/spec-defaults";
import { BasicTypeElem } from "./abstract-viz-elem";
import { GroupSubtree, DatasetSubtree } from "./subtree";
import { TypeElemTemplate } from "./template";

@customElement("link-dec-elem")
export class LinkDecElem extends BasicTypeElem<LinkDec> {
  firstFocusableElem?: HTMLElement | undefined;
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
  firstFocusableElem?: HTMLElement | undefined;
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
  firstFocusableElem?: HTMLElement | undefined;

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
  typeElem!: TypeElemTemplate;

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
  firstFocusableElem?: HTMLElement | undefined;
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

  firstFocusableElem?: HTMLElement | undefined;
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
          .minimized=${this.subtreeMinimize}
          .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
          slot="subtree"
        ></dataset-subtree>
      </type-elem>
    `;
  }
}

@customElement("dataset-incdec-elem")
export class IncDatasetDecElem extends BasicTypeElem<IncDatasetDec> {
  firstFocusableElem?: HTMLElement | undefined;
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
        ></labeled-field-value>
      </type-elem>
    `;
  }
}
