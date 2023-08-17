import { renderShape } from "./viz-utils";
import { TemplateResult, html, CSSResultGroup, css } from "lit";
import { state, property, customElement, query } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import {
  HasTypeNameAndDescription,
  HasDefaultName,
  HasGroupIncType,
  HasDatasetIncType,
} from "..";
import { Trigger } from "../logic/hofs";
import {
  GroupTypeDef,
  AttributeDec,
  DatasetDec,
  GroupDec,
  LinkDec,
  DatasetTypeDef,
} from "../nwb/spec";
import { Initializers } from "../nwb/spec-defaults";
import { BasicTypeElem } from "./abstract-viz-elem";
import { GroupSubtree, DatasetSubtree } from "./subtree";

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

  firstFocusableElem?: HTMLElement | undefined;
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
        .hideDeleteBtn=${true}
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

  firstFocusableElem?: HTMLElement | undefined;

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
        .hideDeleteBtn=${true}
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
