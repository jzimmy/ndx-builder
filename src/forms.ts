import { customElement, query, state } from "lit/decorators.js";
import { CPSForm, assertNever } from "./HOFS";
import { TemplateResult, html, css, CSSResultGroup } from "lit";
import {
  HasGroupIncType,
  HasDatasetIncType,
  HasInstanceNameAndDescription,
  HasTypeNameAndDescription,
  HasDefaultName,
  HasAxes,
} from "./form-elem";
import { GroupType } from "./nwb/spec";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { symbols } from "./styles";

// Developer responsibilities:
// define isValid() method
// define body() method
// add this._selfValidate to all inputs
export abstract class BasicFormPage<T> extends CPSForm<T> {
  abstract formTitle: string;
  ready: boolean = false;
  abstract isValid(): boolean;
  abstract body(): TemplateResult<1>;
  abstract get firstInput(): HTMLElement;

  @state()
  progressSteps: string[] = [];

  @state()
  currProgress: number = -1;

  drawProgressBar = (progressSteps: string[], curr: number) => {
    this.progressSteps = progressSteps;
    this.currProgress = curr;
  };

  onValidateCallback = (ready: boolean) => {
    this.continueButton.disabled = !ready;
  };

  showAndFocus(show: boolean): void {
    this.slot = show ? "currForm" : "";
    this.firstInput.focus();
  }

  @query("input[type=button]")
  continueButton!: HTMLInputElement;

  _selfValidate() {
    this.onValidateCallback(this.isValid());
  }

  render() {
    return html`
      <div class="progress-bar">
        <span class="material-symbols-outlined back_arrow" @click=${this.back}
          >arrow_back</span
        >
        ${map(
          this.progressSteps,
          (step, i) =>
            html`<h3
              class=${classMap({
                active: i == this.currProgress,
                completed: i < this.currProgress,
              })}
            >
              ${step}
            </h3>`
        )}
        <span class="material-symbols-outlined close_button" @click=${this.quit}
          >close</span
        >
      </div>
      <div>
        <h2>${this.formTitle}</h2>
      </div>
      <div class="body">${this.body()}</div>
      <div>
        <input
          type="button"
          .disabled=${!this.ready}
          value="Continue"
          @click=${() => {
            if (!this.isValid()) {
              this.onValidateCallback(false);
            } else {
              this.next();
            }
          }}
        />
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      * {
        border: 1px solid red;
      }

      :host {
        margin: auto;
      }

      :host > div:not(.body) {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > div:last-child > input[type="button"] {
        margin-left: auto;
      }

      .progress-bar {
        width: 100%;
      }

      .progress-bar > span:first-child {
        margin-right: auto;
      }

      .progress-bar > span:last-child {
        margin-left: auto;
      }

      .progress-bar > h3 {
        padding: 0 0.5em;
        text-decoration: underline;
      }

      .progress-bar > h3:not(.completed):not(.active) {
        opacity: 0.5;
        text-decoration: none;
      }

      .progress-bar > h3.active {
        color: var(--clickable);
      }

      .body {
        display: flex;
        flex-direction: column;
      }
    `,
  ] as CSSResultGroup;
}

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
