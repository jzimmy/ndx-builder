import { TemplateResult, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  HasTypeNameAndDescription,
  HasDefaultName,
  BasicFormPage,
  HasInstanceNameAndDescription,
  HasAxes,
} from "./form-elem";

@customElement("tydef-form")
export class TypenameFormpageElem<
  T extends HasTypeNameAndDescription & HasDefaultName
> extends BasicFormPage<T> {
  get firstInput(): HTMLElement {
    return this.typenameInput;
  }

  formTitle: string = "Define your new type";

  @query("input[name=typename]")
  typenameInput!: HTMLInputElement;

  @query("textarea[name=description]")
  descriptionInput!: HTMLTextAreaElement;

  @query("input[name=defaultname]")
  defaultnameInput!: HTMLInputElement;

  @query("input[name=fixed]")
  fixedInput!: HTMLInputElement;

  isValid(): boolean {
    return (
      this.typenameInput.value !== "" && this.descriptionInput.value !== ""
    );
  }

  clear(): this {
    this.typenameInput.value = "";
    this.descriptionInput.value = "";
    return this;
  }

  body(): TemplateResult<1> {
    return html`
      <label for="typename">New type name</label>
      <input name="typename" @input=${this._selfValidate} placeholder="" />
      <label for="description">Description</label>
      <textarea name="description" @input=${this._selfValidate}></textarea>
      <h3>Optional</h3>
      <label for="defaultname">Default instance name</label>
      <input name="defaultname" @input=${this._selfValidate} placeholder="" />
      <label for="fixed">Allow instance name override</label>
      <input type="checkbox" name="fixed" />
    `;
  }

  transform: (_: T) => T = (data: T) => {
    return {
      ...data,
      neurodataTypeDef: this.typenameInput.value,
      doc: this.descriptionInput.value,
    };
  };

  fill(data: T): this {
    if (data.neurodataTypeDef) {
      this.typenameInput.value = data.neurodataTypeDef;
    }
    if (data.doc) {
      this.descriptionInput.value = data.doc;
    }
    if (data.name) {
      let [name, fixed] = data.name;
      this.defaultnameInput.value = name;
      this.fixedInput.checked = fixed;
    }
    return this;
  }

  static styles = [super.styles, css``];
}

@customElement("decname-form")
export class NameDecFormpageElem<
  T extends HasInstanceNameAndDescription
> extends BasicFormPage<T> {
  get firstInput(): HTMLElement {
    return this.nameInput;
  }

  formTitle: string = "Define your new type";

  @query("input[name=typename]")
  nameInput!: HTMLInputElement;

  @query("textarea[name=description]")
  descriptionInput!: HTMLTextAreaElement;

  isValid(): boolean {
    return this.nameInput.value !== "" && this.descriptionInput.value !== "";
  }

  clear(): this {
    this.nameInput.value = "";
    this.descriptionInput.value = "";
    return this;
  }

  body(): TemplateResult<1> {
    return html`
      <label for="typename">New type name</label>
      <input name="typename" @input=${this._selfValidate} placeholder="" />
      <label for="description">Description</label>
      <textarea name="description" @input=${this._selfValidate}></textarea>
    `;
  }

  transform: (_: T) => T = (data: T) => {
    return {
      ...data,
      neurodataTypeDef: this.nameInput.value,
      doc: this.descriptionInput.value,
    };
  };

  fill(data: T): this {
    if (data.name) {
      this.nameInput.value = data.name;
    }
    if (data.doc) {
      this.descriptionInput.value = data.doc;
    }
    return this;
  }

  static styles = [super.styles, css``];
}

@customElement("axes-form")
export class AxesFormpageElem<T extends HasAxes> extends BasicFormPage<T> {
  get firstInput(): HTMLElement {
    return this.axesShapeInput;
  }

  formTitle: string = "Define the axes of the data in this type";

  @query("input[name=axes-shape]")
  axesShapeInput!: HTMLInputElement;

  @query("input[name=axes-labels]")
  axesLabelsInput!: HTMLInputElement;

  @query("select[name=dtype]")
  dtypeInput!: HTMLSelectElement;

  clear(): this {
    this.axesShapeInput.value = "";
    this.axesLabelsInput.value = "";
    this.dtypeInput.value = "uint8";
    return this;
  }

  isValid(): boolean {
    return true;
  }

  body(): TemplateResult<1> {
    return html`
      <label for="axes-shape">Axes Shape</label>
      <input
        name="axes-shape"
        @input=${this._selfValidate}
        placeholder="[3, 1, N]"
      />
      <label for="axes-labels">New type name</label>
      <input
        name="axes-labels"
        @input=${this._selfValidate}
        placeholder="['location', 'index', 'voltages']"
      />
      <label for="dtype">Stores data type</label>
      <select name="dtype" @input=${this._selfValidate}>
        <option>uint8</option>
        <option>float32</option>
      </select>
    `;
  }

  transform: (data: T) => typeof data = (data: T) => {
    let dims = this.axesShapeInput.value.split(",").map((s) => parseInt(s));
    let labels = this.axesLabelsInput.value.split(",").map((s) => s.trim());
    let dtype = this.dtypeInput.value;
    let shape = dims.map((dim, i) => [dim, labels[i]] as [number, string]);
    return {
      ...data,
      shape: shape,
      dtype: ["PRIMITIVE", "i8"],
    };
  };

  fill(data: T): this {
    let dims = data.shape.map(([dim, _]) => dim);
    let labels = data.shape.map(([_, label]) => label);
    let dtype = data.dtype;
    if (dims.length) {
      this.axesShapeInput.value = dims.join(", ");
    }
    if (labels.length) {
      this.axesLabelsInput.value = labels.join(", ");
    }
    if (dtype !== undefined) {
      this.dtypeInput.value = "uint8";
    }
    return this;
  }

  static styles = [super.styles, css``];
}
