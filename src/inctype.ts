import { TemplateResult, html, css } from "lit";
import { query, customElement } from "lit/decorators.js";
import { assertNever } from "./HOFS";
import {
  BasicFormPage,
  HasGroupIncType,
  HasDatasetIncType,
  //   HasTypeNameAndDescription,
  //   HasDefaultName,
  //   HasInstanceNameAndDescription,
  //   HasAxes,
} from "./form-elem";
import { GroupType } from "./nwb/spec";

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
      neurodataTypeInc: ["Core", this.inctypeNameInput.value] as GroupType,
    };
  };

  fill(data: T): this {
    const [kind, incType] = data.neurodataTypeInc;
    switch (kind) {
      case "Core":
        this.inctypeNameInput.value = incType;
        break;
      case "Typedef":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
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
        this.inctypeNameInput.value = incType;
        break;
      case "Typedef":
        this.inctypeNameInput.value = incType.neurodataTypeDef;
        break;
      default:
        assertNever(kind);
    }
    return this;
  }
}
