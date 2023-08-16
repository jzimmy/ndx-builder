import { TemplateResult, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
import {
  HasTypeNameAndDescription,
  HasDefaultName,
  HasQuantityOrName,
} from "../parent";
import { BasicTypeBuilderFormPage } from "./abstract-form";
import { ProgressState } from "../logic/cpsform.ts";
import "../typeviz/subtree";
import { CheckboxInput } from "../inputs/radio-input";
import { DocInput } from "../inputs/value-input";
import { NameInput } from "../inputs/value-input";
import { QuantityOrNameInput } from "../inputs/quantity-or-name";

@customElement("tydef-name-form")
export class TypenameForm<
  T extends HasTypeNameAndDescription & HasDefaultName
> extends BasicTypeBuilderFormPage<T> {
  get firstInput(): HTMLElement {
    return this.typenameInput;
  }

  formTitle: string = "Define your new type";

  @query("name-input#typename")
  typenameInput!: NameInput;

  @query("doc-input")
  descriptionInput!: DocInput;

  @query("name-input#default-name")
  defaultNameInput!: NameInput;

  @query("checkbox-input")
  allowOverrideInput!: CheckboxInput;

  isValid(): boolean {
    return (
      this.typenameInput.isValid() &&
      this.descriptionInput.isValid() &&
      this.defaultNameInput.isValid()
    );
  }

  clear(): this {
    this.typenameInput.clear();
    this.descriptionInput.clear();
    this.defaultNameInput.clear();
    this.allowOverrideInput.clear();
    return this;
  }

  body(): TemplateResult<1> {
    return html`
      <name-input
        id="typename"
        .label=${"Type name"}
        .onInteraction=${() => this._selfValidate()}
      ></name-input>
      <doc-input
        .label=${"Description"}
        .onInteraction=${() => this._selfValidate()}
      ></doc-input>
      <h3>Optional</h3>
      <name-input
        id="default-name"
        .required=${false}
        .label=${"Default instance name"}
        .onInteraction=${() => this._selfValidate()}
      ></name-input>
      <checkbox-input
        .label=${"Allow instance name override"}
        .onInteraction=${() => this._selfValidate()}
      ></checkbox-input>
    `;
  }

  transform: (_: T) => T = (data: T) => {
    return {
      ...data,
      neurodataTypeDef: this.typenameInput.value(),
      doc: this.descriptionInput.value(),
    };
  };

  fill(data: T, progress: ProgressState): this {
    this.drawProgressBar(progress);
    if (data.neurodataTypeDef) {
      this.typenameInput.fill(data.neurodataTypeDef);
    }
    if (data.doc) {
      this.descriptionInput.fill(data.doc);
    }
    if (data.name) {
      let [name, fixed] = data.name;
      this.defaultNameInput.fill(name);
      this.allowOverrideInput.fill(!fixed);
    }
    return this;
  }

  static styles = [super.styles, css``];
}

export interface HasInstanceNameAndDescription {
  name: string;
  doc: string;
}

export interface HasDescription {
  doc: string;
}

@customElement("anon-dec-info")
export class AnonDecNameForm<
  T extends HasInstanceNameAndDescription
> extends BasicTypeBuilderFormPage<T> {
  @query("name-input")
  nameInput!: NameInput;
  @query("doc-input")
  docInput!: DocInput;

  formTitle: string = "Anonymous-typed Group Declaration";
  isValid(): boolean {
    return this.nameInput.isValid() && this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <name-input
        .onInteraction=${() => this._selfValidate()}
        id="name"
        label="Instance name"
      ></name-input>
      <doc-input
        .onInteraction=${() => this._selfValidate()}
        id="doc"
        label="Description"
      ></doc-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.nameInput.firstFocusableElem;
  }

  fill(val: T, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.nameInput.fill(val.name);
    this.docInput.fill(val.doc);
  }

  transform(val: T): T {
    const name = this.nameInput.value();
    const doc = this.docInput.value();
    if (!name || !doc) {
      return val;
    }
    return { ...val, name, doc };
  }

  clear(): void {
    this.nameInput.clear();
    this.docInput.clear();
  }
}

@customElement("inc-dec-info")
export class IncDecNameForm<
  T extends HasDescription & HasQuantityOrName
> extends BasicTypeBuilderFormPage<T> {
  formTitle: string = "Group instance declaration";
  @query("doc-input")
  docInput!: DocInput;

  @query("quantity-or-name-input")
  quantityOrNameInput!: QuantityOrNameInput;

  isValid(): boolean {
    return this.docInput.isValid() && this.quantityOrNameInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <doc-input
        id="doc"
        label="Description"
        .onInteraction=${() => this._selfValidate()}
      ></doc-input>
      <quantity-or-name-input .onInteraction=${() => this._selfValidate()}>
      </quantity-or-name-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.docInput.firstFocusableElem;
  }

  fill(val: T, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (val.doc != "") this.docInput.fill(val.doc);
    if (val.quantityOrName != "")
      this.quantityOrNameInput.fill(val.quantityOrName);
  }

  transform(val: T): T {
    const doc = this.docInput.value();
    const quantityOrName = this.quantityOrNameInput.value();
    if (!doc || !quantityOrName) {
      return val;
    }
    return { ...val, doc, quantityOrName };
  }

  clear(): void {
    this.docInput.clear();
    this.quantityOrNameInput.clear();
  }
}
