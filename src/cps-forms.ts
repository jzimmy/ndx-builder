import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { symbols } from "./styles";
import {
  AttributeDec,
  DatasetDec,
  Defaultable,
  GroupDec,
  GroupType,
  GroupTypeDef,
  LinkDec,
} from "./nwb/spec";

interface HasIncType {
  neurodataTypeInc: GroupType;
}

interface HasNameAndDescription {
  neurodataTypeDef: string;
  doc: string;
}

interface HasAxes {
  shape: [number, string][];
  dtype: string;
}

interface HasDefaultName {
  name?: Defaultable<string>;
}

interface HasAttributeSubComponents {
  attributes: AttributeDec[];
}

interface HasGroupSubComponents {
  groups: GroupDec[];
  datasets: DatasetDec[];
  attributes: AttributeDec[];
  links: LinkDec[];
}

abstract class NdxFormPageElem<T> extends LitElement {
  abstract ready: boolean;
  abstract progressTitle?: string;
  abstract isValid(): boolean;
  abstract transform: (data: T) => T;
  abstract fill(data: T): this;
  abstract setVisible(show: boolean): void;
  onCloseCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onNextCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onBackCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };

  drawProgressBar = (_progressSteps: string[], _curr: number) => {};
  onValidateCallback = (_ready: boolean) => {};
  _selfValidate() {
    this.onValidateCallback(this.isValid());
  }
}

type TriggerFormFn<T> = (
  onAbandon: () => void,
  onComplete: (res: T) => void
) => void;

// algorithmic laws (written with lisp syntax)

/* compose ([], _, v, back, next) = next(v, back)
 * compose ([f, ...fs], (i - 1), v, back, next) =
 *      show (f, v, i, back, (v', back') => compose (fs, i + 1, v', back', next)
 *
 * show (f, v, i, back, next) =
 *    f.fill(v, i)
 *    next(f(v), () => show (f, f(v), i, back, next)) // if next is hit
 * show (f, v, i, back, next) =
 *    f.fill(v, i)
 *    back() // if back is hit
 */

export function composeForm<T>(
  intialData: T,
  forms: NdxFormPageElem<T>[]
): TriggerFormFn<T> {
  const progressTitles = forms.flatMap((f) =>
    f.progressTitle !== undefined ? f.progressTitle : []
  );
  function compose(
    forms: NdxFormPageElem<T>[],
    currProgress: number,
    value: T,
    back: () => void,
    complete: (_: T, res: () => void) => void
  ) {
    if (forms.length === 0) {
      complete(value, back);
    } else {
      const [currForm, ...restForms] = forms;
      show(currForm, value, currProgress, back, (_val, _back) => {
        compose(restForms, currProgress + 1, _val, _back, complete);
      });
    }
  }

  function show(
    form: NdxFormPageElem<T>,
    value: T,
    currProgress: number,
    back: () => void,
    next: (_val: T, _back: () => void) => void
  ): void {
    form.fill(value);
    form._selfValidate();
    form.setVisible(true);

    if (form.progressTitle !== undefined) {
      form.drawProgressBar(progressTitles, currProgress);
    } else {
      form.drawProgressBar([], -1);
    }

    form.onBackCallback = () => {
      form.setVisible(false);
      back();
    };

    form.onNextCallback = () => {
      form.setVisible(false);
      const newval = { ...form.transform(value) };
      next(newval, () =>
        show(form, newval, currProgress, back, (_value: T, _back) => {
          console.log("hello: ", newval);
          next(newval, _back);
        })
      );
    };
  }

  return (
    onAbandonCallback: () => void,
    onCompleteCallback: (res: T) => void
  ) => {
    forms.map((f) => f.setVisible(false));
    forms.map((f) => (f.onCloseCallback = onAbandonCallback));
    compose(forms, 0, intialData, onAbandonCallback, onCompleteCallback);
  };
}

// Developer responsibilities:
// define isValid() method
// define body() method
// add this._selfValidate to all inputs
abstract class BasicFormPage<T> extends NdxFormPageElem<T> {
  abstract progressTitle?: string;
  abstract formTitle: string;
  ready: boolean = false;
  abstract isValid(): boolean;
  abstract body(): TemplateResult<1>;

  @state()
  progressSteps: string[] = ["Step 1", "Step 2", "Step 3"];

  @state()
  currProgress: number = -1;

  drawProgressBar = (progressSteps: string[], curr: number) => {
    this.progressSteps = progressSteps;
    this.currProgress = curr;
  };

  onValidateCallback = (ready: boolean) => {
    this.continueButton.disabled = !ready;
  };

  setVisible(show: boolean): void {
    this.slot = show ? "currForm" : "";
  }

  @query("input[type=button]")
  continueButton!: HTMLInputElement;

  render() {
    return html`
      <div class="progress-bar">
        <span
          class="material-symbols-outlined back_arrow"
          @click=${this.onBackCallback}
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
        <span
          class="material-symbols-outlined close_button"
          @click=${this.onCloseCallback}
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
              this.onNextCallback();
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

@customElement("inctype-form")
export class InctypeFormpageElem<
  T extends HasIncType
> extends BasicFormPage<T> {
  progressTitle?: string | undefined = "Pick base type";
  formTitle: string = "Choose a base type to extend";

  @query("input[name=inctype-name]")
  inctypeNameInput!: HTMLInputElement;

  isValid(): boolean {
    return this.inctypeNameInput.value !== "";
  }

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

  transform: (_: T) => T = (data: T) => {
    return { ...data, neurodataTypeInc: ["Core", this.inctypeNameInput.value] };
  };

  fill(data: T): this {
    const [kind, incType] = data.neurodataTypeInc as GroupType;
    let incName = "";
    switch (kind) {
      case "Core":
        incName = incType;
        break;
      case "Typedef":
        incName = incType.neurodataTypeDef;
        break;
      default:
        assertNever(kind);
    }
    this.inctypeNameInput.value = incName;
    return this;
  }

  static styles = [super.styles, css``];
}

@customElement("tyname-form")
export class TypenameFormpageElem<
  T extends HasNameAndDescription
> extends BasicFormPage<T> {
  progressTitle?: string | undefined = "Name and description";
  formTitle: string = "Define your new type";

  @query("input[name=typename]")
  typenameInput!: HTMLInputElement;

  @query("textarea[name=description]")
  descriptionInput!: HTMLTextAreaElement;

  isValid(): boolean {
    return (
      this.typenameInput.value !== "" && this.descriptionInput.value !== ""
    );
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
      neurodataTypeDef: this.typenameInput.value,
      doc: this.descriptionInput.value,
    };
  };

  fill(data: T): this {
    this.typenameInput.value = data.neurodataTypeDef;
    this.descriptionInput.value = data.doc;
    return this;
  }

  static styles = [super.styles, css``];
}

@customElement("axes-form")
export class AxesFormpageElem<T extends HasAxes> extends BasicFormPage<T> {
  progressTitle?: string | undefined = "Data shape";
  formTitle: string = "Define the axes of the data in this type";

  @query("input[name=axes-shape]")
  axesShapeInput!: HTMLInputElement;

  @query("input[name=axes-labels]")
  axesLabelsInput!: HTMLInputElement;

  @query("select[name=dtype]")
  dtypeInput!: HTMLSelectElement;

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

  transform = (data: T) => {
    let dims = this.axesShapeInput.value.split(",").map((s) => parseInt(s));
    let labels = this.axesLabelsInput.value.split(",").map((s) => s.trim());
    let dtype = this.dtypeInput.value;
    let shape = dims.map((dim, i) => [dim, labels[i]] as [number, string]);
    return {
      ...data,
      shape: shape,
      dtype: dtype,
    };
  };

  fill(data: T): this {
    let dims = data.shape.map(([dim, _]) => dim);
    let labels = data.shape.map(([_, label]) => label);
    let dtype = data.dtype;
    this.axesShapeInput.value = dims.join(", ");
    this.axesLabelsInput.value = labels.join(", ");
    this.dtypeInput.value = dtype;
    return this;
  }

  static styles = [super.styles, css``];
}

@customElement("default-name-form")
export class DefaultNameFormpageElem<
  T extends HasDefaultName
> extends BasicFormPage<T> {
  progressTitle?: string | undefined = "Optional fields";
  formTitle: string = "Define the name of the default instance";

  @query("input[name=default-name]")
  defaultNameInput!: HTMLInputElement;

  @query("input[name=fixed-name]")
  fixedNameInput!: HTMLInputElement;

  isValid(): boolean {
    return (
      (this.defaultNameInput.value == "" &&
        this.fixedNameInput.checked == false) ||
      this.defaultNameInput.value.match(/^[a-zA-Z0-9_]+$/) !== null
    );
  }

  body(): TemplateResult<1> {
    return html`
      <label for="default-name">Default Name</label>
      <input name="default-name" @input=${this._selfValidate} placeholder="" />
      <label for="fixed-name">Is this a valid name</label>
      <input
        name="fixed-name"
        @input=${this._selfValidate}
        type="checkbox"
        placeholder="['location', 'index', 'voltages']"
      />
    `;
  }

  transform = (data: T) => {
    if (this.defaultNameInput.value === "") {
      return data;
    }
    let name = [
      this.defaultNameInput.value,
      this.fixedNameInput.checked,
    ] as Defaultable<string>;
    return {
      ...data,
      name: name,
    };
  };

  fill(data: T): this {
    if (data.name !== undefined) {
      this.defaultNameInput.value = data.name[0];
      this.fixedNameInput.checked = data.name[1];
    } else {
      this.defaultNameInput.value = "";
      this.fixedNameInput.checked = false;
    }
    return this;
  }

  static styles = [super.styles, css``];
}
function assertNever(_: never): never {
  throw new Error("Function not implemented.");
}

@customElement("form-parent")
export class FormParentElem extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = false;

  constructor() {
    super();
    const defaultGroupTypedef: GroupTypeDef = {
      neurodataTypeDef: "",
      neurodataTypeInc: ["Core", "None"],
      doc: "",
      groups: [],
      datasets: [],
      attributes: [],
      links: [],
    };

    const forms: NdxFormPageElem<GroupTypeDef>[] = [
      new InctypeFormpageElem(),
      new TypenameFormpageElem(),
      new DefaultNameFormpageElem(),
    ];

    forms.map((f) => this.appendChild(f));

    const groupBuilderForm = composeForm<GroupTypeDef>(
      defaultGroupTypedef,
      forms
    );

    this.triggerGroupBuilder = () => {
      groupBuilderForm(
        () => {
          console.log("called abandon");
          this.formOpen = false;
        },
        (value) => {
          console.log(value);
          this.formOpen = false;
        }
      );
    };
  }

  triggerGroupBuilder: () => void;

  render() {
    return html`
      <input
        type="button"
        value="new_group"
        @click=${this.triggerGroupBuilder}
      />
      <input type="button" value="new_dataset" />
      <slot name="currForm"></slot>
    `;
  }

  static styles = [
    css`
      :host {
      }

      :host[formOpen] input {
        display: none;
      }
    `,
  ];
}
