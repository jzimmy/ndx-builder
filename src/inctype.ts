import { TemplateResult, html, css } from "lit";
import { query, customElement } from "lit/decorators.js";
import { ProgressState, assertNever } from "./HOFS";
import {
  HasGroupIncType,
  HasDatasetIncType,
  //   HasTypeNameAndDescription,
  //   HasDefaultName,
  //   HasInstanceNameAndDescription,
  //   HasAxes,
} from "./parent";
import { GroupType, TypeDef } from "./nwb/spec";
import { BasicFormPage } from "./basicform";
import { Initializers } from "./nwb/spec-defaults";

abstract class InctypeFormpageElem<T> extends BasicFormPage<T> {
  formTitle: string = "Choose a base type to extend";

  isValid(): boolean {
    return this.inctypeNameInput.value !== "";
  }

  clear(): this {
    this.inctypeNameInput.value = "";
    return this;
  }

  @query("input[name=inctype-name]")
  inctypeNameInput!: HTMLInputElement;

  @query("input[name=inctype-name]")
  firstInput!: HTMLElement;

  body(): TemplateResult<1> {
    return html`
      <label for="inctype-name">IncType name</label>
      <input
        name="inctype-name"
        @input=${this._selfValidate}
        placeholder="ExampleIncType"
        value=${""}
      />
    `;
  }

  static styles = [super.styles, css``];
}

@customElement("group-inctype-form")
export class GroupInctypeFormpageElem<
  T extends HasGroupIncType
> extends InctypeFormpageElem<T> {
  transform = (data: T) => {
    return {
      ...data,
      neurodataTypeInc: ["None", null] as GroupType,
    };
  };

  fill(data: T): this {
    const [kind, incType] = data.neurodataTypeInc;
    switch (kind) {
      case "Core":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
        break;
      case "Typedef":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
        break;
      case "None":
        break;
      default:
        assertNever(kind);
    }
    return this;
  }
}

@customElement("dataset-inctype-form")
export class DatasetInctypeFormpageElem<
  T extends HasDatasetIncType
> extends InctypeFormpageElem<T> {
  transform = (data: T) => {
    return { ...data, neurodataTypeInc: ["Core", this.inctypeNameInput.value] };
  };
  fill(data: T): this {
    const [kind, incType] = data.neurodataTypeInc;
    switch (kind) {
      case "Core":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
        break;
      case "Typedef":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
        break;
      case "None":
        break;
      default:
        assertNever(kind);
    }
    return this;
  }
}

@customElement("generic-inctype-form")
export class GenericInctypeFormpageElem extends InctypeFormpageElem<TypeDef> {
  fill(val: TypeDef, progress?: ProgressState): void {
    this.drawProgressBar(progress);
    this.inctypeNameInput.value = val[1].neurodataTypeDef;
  }

  transform(val: TypeDef): TypeDef {
    switch (this.kindSelect.value) {
      case "group":
        return [
          "GROUP",
          {
            ...Initializers.groupTypeDef,
            neurodataTypeDef: this.inctypeNameInput.value,
          },
        ];
      case "dataset":
        return [
          "DATASET",
          {
            ...Initializers.datasetTypeDef,
            neurodataTypeDef: this.inctypeNameInput.value,
          },
        ];
    }
    return val;
  }

  @query("select[name=inctype-kind]")
  kindSelect!: HTMLSelectElement;

  body() {
    return html`
      <label for="inctype-kind">IncType kind</label>
      <select name="inctype-kind">
        <option value="group">Group</option>
        <option value="dataset">Dataset</option>
      </select>
      ${super.body()}
    `;
  }
}
