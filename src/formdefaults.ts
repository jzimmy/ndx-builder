import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import {
  NdxFormPageElem,
  GroupInctypeFormpageElem,
  TypenameFormpageElem,
  DefaultNameFormpageElem,
  GroupDefVizFormpageElem,
  composeForm,
  DatasetInctypeFormpageElem,
  AxesFormpageElem,
  DatasetDefVizFormpageElem,
  NameDecFormpageElem,
} from "./cps-forms";
import {
  GroupTypeDef,
  DatasetTypeDef,
  AttributeDec,
  LinkDec,
} from "./nwb/spec";
import "./cps-forms";

const Defaults = {
  attribute: {
    name: "",
    doc: "",
    dtype: ["PRIMITIVE", "u8"],
    shape: [],
    required: false,
  } as AttributeDec,

  datasetTypedef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    attributes: [],
    shape: [],
    dtype: ["PRIMITIVE", "i8"],
  } as DatasetTypeDef,

  groupTypedef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  } as GroupTypeDef,

  link: {
    doc: "",
    targetType: ["Core", "None"],
    quantityOrName: "",
  } as LinkDec,
};

const attributeForms = [
  [new NameDecFormpageElem(), "Name and description"],
  [new AxesFormpageElem(), "Attribute shape"],
] as [NdxFormPageElem<AttributeDec>, string][];

const attributeBuilderForm = composeForm<AttributeDec>(
  Defaults.attribute,
  attributeForms
);

const groupForms = [
  [new GroupInctypeFormpageElem(), "Pick base type"],
  [new TypenameFormpageElem(), "Name and description"],
  [new DefaultNameFormpageElem(), "Optional fields"],
  [new GroupDefVizFormpageElem(attributeBuilderForm), null],
] as [NdxFormPageElem<GroupTypeDef>, string | null][];

const groupBuilderForm = composeForm<GroupTypeDef>(
  Defaults.groupTypedef,
  groupForms
);

const datasetForms: [NdxFormPageElem<DatasetTypeDef>, string | null][] = [
  [new DatasetInctypeFormpageElem(), "Pick base type"],
  [new TypenameFormpageElem(), "Name and description"],
  [new AxesFormpageElem(), "Define axes"],
  [new DefaultNameFormpageElem(), "Optional fields"],
  [new DatasetDefVizFormpageElem(attributeBuilderForm), null],
];

const datasetBuilderForm = composeForm<DatasetTypeDef>(
  Defaults.datasetTypedef,
  datasetForms
);

const linkForms: [NdxFormPageElem<LinkDec>, string][] = [
  //   [new DatasetInctypeFormpageElem(), ""],
];

const linkBuilderForm = composeForm<LinkDec>(Defaults.link, linkForms);

const Pages = {
  group: groupForms,
  dataset: datasetForms,
  attribute: attributeForms,
  link: linkForms,
};

const Builders = {
  group: groupBuilderForm,
  dataset: datasetBuilderForm,
  attribute: attributeBuilderForm,
  link: linkBuilderForm,
};

const Forms = {
  defaults: Defaults,
  pages: Pages,
  builders: Builders,
};

@customElement("form-parent")
export class NdxFormParent extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = false;

  constructor() {
    super();
    Forms.pages.group.forEach((f) => this.appendChild(f[0]));
    Forms.pages.dataset.forEach((f) => this.appendChild(f[0]));
    Forms.pages.attribute.forEach((f) => this.appendChild(f[0]));
    this.triggerGroupBuilder = () => {
      Forms.pages.dataset.forEach((f) => f[0].clear());
      Forms.pages.dataset.forEach((f) => f[0].setSlotToCurrFormAndFocus(false));
      this.formOpen = true;
      Forms.builders.group(
        () => {
          this.formOpen = false;
        },
        (value) => {
          console.log(value);
          this.formOpen = false;
        }
      );
    };
    this.triggerDatasetBuilder = () => {
      Forms.pages.group.forEach((f) => f[0].clear());
      Forms.pages.group.forEach((f) => f[0].setSlotToCurrFormAndFocus(false));
      this.formOpen = true;
      Forms.builders.dataset(
        () => {
          this.formOpen = false;
        },
        (value) => {
          console.log(value);
          this.formOpen = false;
        }
      );
    };
  }

  private triggerGroupBuilder: () => void;
  private triggerDatasetBuilder: () => void;

  render() {
    return html`
      ${when(
        !this.formOpen,
        () => html`
          <input
            type="button"
            value="new_group"
            @click=${this.triggerGroupBuilder}
          />
          <input
            type="button"
            value="new_dataset"
            @click=${this.triggerDatasetBuilder}
          />
        `
      )}
      <form>
        ${when(this.formOpen, () => html` <slot name="currForm"></slot> `)}
      </form>
    `;
  }

  static styles = [
    css`
      :host {
      }
    `,
  ];
}
