import { TemplateResult, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  HasTypeNameAndDescription,
  HasDefaultName,
  HasInstanceNameAndDescription,
} from "./parent";
import { BasicTypeBuilderFormPage } from "./basic-form";
import { ProgressState } from "./hofs";
import "./subtree";

@customElement("tydef-form")
export class TypenameForm<
  T extends HasTypeNameAndDescription & HasDefaultName
> extends BasicTypeBuilderFormPage<T> {
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

  fill(data: T, progress: ProgressState): this {
    this.drawProgressBar(progress);
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
export class NameDecForm<
  T extends HasInstanceNameAndDescription
> extends BasicTypeBuilderFormPage<T> {
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

  fill(data: T, progress: ProgressState): this {
    this.drawProgressBar(progress);
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
