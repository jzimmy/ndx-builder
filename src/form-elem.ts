import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, state, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { CPSForm, FormChain } from "./HOFS";
import {
  GroupType,
  DatasetType,
  Dtype,
  Defaultable,
  GroupTypeDef,
  DatasetTypeDef,
  GroupDec,
} from "./nwb/spec";
import {
  AxesFormpageElem,
  DatasetInctypeFormpageElem,
  GroupInctypeFormpageElem,
  TypenameFormpageElem,
} from "./forms";

export interface HasGroupIncType {
  neurodataTypeInc: GroupType;
}

export interface HasDatasetIncType {
  neurodataTypeInc: DatasetType;
}

export interface HasTypeNameAndDescription {
  neurodataTypeDef: string;
  doc: string;
}

export interface HasInstanceNameAndDescription {
  name: string;
  doc: string;
}

export interface HasAxes {
  shape: [number, string][];
  dtype: Dtype;
}

export interface HasDefaultName {
  name?: Defaultable<string>;
}

export interface HasRequired {
  required: boolean;
}

export type TriggerFormFn<T> = (
  onAbandon: () => void,
  onComplete: (res: T) => void
) => void;

export const Initializers = {
  groupTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  } as GroupTypeDef,
  datasetTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    attributes: [],
    shape: [],
    dtype: ["PRIMITIVE", "f32"],
  } as DatasetTypeDef,
};

// form manager
@customElement("form-parent")
export class NdxFormParent extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = false;

  constructor() {
    super();

    let groupBuilderForm = new FormChain<GroupTypeDef>(
      new GroupInctypeFormpageElem()
    )
      .then(new TypenameFormpageElem())
      .withParent(this);

    let datasetBuilderForm = new FormChain<DatasetTypeDef>(
      new DatasetInctypeFormpageElem()
    )
      .then(new TypenameFormpageElem())
      .then(new AxesFormpageElem())
      .withParent(this);

    this.triggerGroupBuilder = () => {
      this.formOpen = true;
      groupBuilderForm(
        Initializers.groupTypeDef,
        () => {
          this.formOpen = false;
          console.log("quit groupbuilder");
        },
        (res) => {
          this.formOpen = false;
          console.log("Built group", res);
        }
      );
    };

    this.triggerDatasetBuilder = () => {
      this.formOpen = true;
      datasetBuilderForm(
        Initializers.datasetTypeDef,
        () => {
          this.formOpen = false;
          console.log("quit datasetbuilder");
        },
        (res) => {
          this.formOpen = false;
          console.log("Built dataset", res);
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

// export const Pages = {
//   groupTypeDef: [
//     new GroupInctypeFormpageElem(),
//     new TypenameFormpageElem(),
//   ] as CPSForm<GroupTypeDef>[],
//   datasetTypeDef: [
//     new GroupInctypeFormpageElem(),
//     new TypenameFormpageElem(),
//     new AxesFormpageElem(),
//   ] as CPSForm<DatasetTypeDef>[],
// };
