import { customElement, query } from "lit/decorators.js";
import { BasicTypeBuilderFormPage } from "./basic-form";
import { AnonymousGroupTypeDec, IncGroupDec } from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { ProgressState } from "./hofs";
import { DocInput, NameInput } from "./forminputs";

@customElement("anon-group-dec-info")
export class AnonGroupDecInfo extends BasicTypeBuilderFormPage<AnonymousGroupTypeDec> {
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
        .input=${() => this._selfValidate()}
        id="name"
        label="Instance name"
      ></name-input>
      <doc-input
        .input=${() => this._selfValidate()}
        id="doc"
        label="Description"
      ></doc-input>
    `;
  }

  get firstInput(): HTMLElement | undefined {
    return this.nameInput.firstFocusable;
  }

  fill(val: AnonymousGroupTypeDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.nameInput.fill(val.name);
    this.docInput.fill(val.doc);
  }

  transform(val: AnonymousGroupTypeDec): AnonymousGroupTypeDec {
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

@customElement("inc-group-dec-info")
export class IncGroupDecInfo extends BasicTypeBuilderFormPage<IncGroupDec> {
  formTitle: string = "Group instance declaration";
  @query("doc-input")
  docInput!: DocInput;

  isValid(): boolean {
    return this.docInput.isValid();
  }

  body(): TemplateResult<1> {
    return html`
      <doc-input
        id="doc"
        label="Description"
        .input=${() => this._selfValidate()}
      ></doc-input>
    `;
  }
  get firstInput(): HTMLElement | undefined {
    return this.docInput.firstFocusable;
  }
  fill(val: IncGroupDec, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.docInput.fill(val.doc);
  }
  transform(val: IncGroupDec): IncGroupDec {
    const doc = this.docInput.value();
    if (!doc) {
      return val;
    }
    return { ...val, doc };
  }
  clear(): void {
    this.docInput.clear();
  }
}
