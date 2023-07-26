import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { symbols } from "./styles";
import {
  AttributeDec,
  DatasetDec,
  DatasetType,
  DatasetTypeDef,
  Defaultable,
  Dtype,
  GroupDec,
  GroupType,
  GroupTypeDef,
  LinkDec,
  PrimitiveDtype,
} from "./nwb/spec";
import { when } from "lit/directives/when.js";

interface HasGroupIncType {
  neurodataTypeInc: GroupType;
}

interface HasDatasetIncType {
  neurodataTypeInc: DatasetType;
}

interface HasTypeNameAndDescription {
  neurodataTypeDef: string;
  doc: string;
}

interface HasInstanceNameAndDescription {
  name: string;
  doc: string;
}

interface HasAxes {
  shape: [number, string][];
  dtype: Dtype;
}

interface HasDefaultName {
  name?: Defaultable<string>;
}

interface HasRequired {
  required: boolean;
}

export abstract class NdxFormPageElem<T> extends LitElement {
  abstract drawProgressBar(titles: string[], curr: number): void;
  // IMPORTANT! This function must be idempotent and commutative
  // meaning that any transform f and g
  // f(f(x)) = f(x) and f(g(x)) = g(f(x)) for all x
  abstract transform: (data: T) => T;
  abstract fill(data: T): this;
  abstract clear(): this;
  abstract setSlotToCurrFormAndFocus(show: boolean): void;
  abstract _selfValidate(): void;
  // these methods will be overwritten in the compose phase
  onCloseCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onNextCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onBackCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
}

function clearAndHideForm<F, A>([f, _]: [NdxFormPageElem<F>, A]) {
  f.clear();
  f.setSlotToCurrFormAndFocus(false);
}

type TriggerFormFn<T> = (
  onAbandon: () => void,
  onComplete: (res: T) => void
) => void;

/*  Algorithmic laws for composeForm
 *  Note: composeForm is curried, it is called with two sets of arguments
 *
 *  composeForm(v, fs)(onAbandon, onComplete) = compose (fs, 0, v, onAbandon, onComplete)
 *
 *  compose ([], _, v, back, complete) = complete(v, back)
 *  compose ([f, ...fs], (i - 1), v, back, complete) where back button is hit =
 *      back() // if back is hit
 *  compose ([f, ...fs], (i - 1), v, back, complete) where next button is hit =
 *      compose(fs, i, v, () => compose ([f, ...fs], (i - 1), f(v), back, complete),
 *                        complete)
 */
export function composeForm<T>(
  intialData: T,
  formsTitlePairs: [NdxFormPageElem<T>, string | null][]
): TriggerFormFn<T> {
  // unzip pair
  const [forms, progressTitles] = formsTitlePairs.reduce(
    ([fs, ts], [f, t]) => [
      [...fs, f],
      [...ts, t],
    ],
    [[], []] as [NdxFormPageElem<T>[], (string | null)[]]
  );

  function compose(
    forms: NdxFormPageElem<T>[],
    currProgress: number,
    value: T,
    back: () => void,
    complete: (_: T) => void
  ) {
    if (forms.length === 0) {
      complete(value);
      return;
    }
    const [currForm, ...restForms] = forms;
    currForm._selfValidate();
    currForm.setSlotToCurrFormAndFocus(true);
    currForm.fill(value);

    if (progressTitles[currProgress]) {
      currForm.drawProgressBar(
        progressTitles.flatMap((s) => (s ? [s] : [])),
        currProgress
      );
    }

    const nextProgress = currProgress + (progressTitles[currProgress] ? 1 : 0);

    currForm.onBackCallback = () => {
      currForm.setSlotToCurrFormAndFocus(false);
      back();
    };

    currForm.onNextCallback = () => {
      currForm.setSlotToCurrFormAndFocus(false);
      const newval = currForm.transform(value);
      compose(
        restForms,
        nextProgress,
        newval,
        () => compose(forms, currProgress, newval, back, complete),
        complete
      );
    };
  }

  return (
    onAbandonCallback: () => void,
    onCompleteCallback: (res: T) => void
  ) => {
    forms.map((f) => f.clear());
    forms.map((f) => f.setSlotToCurrFormAndFocus(false));
    forms.map((f) => (f.onCloseCallback = onAbandonCallback));
    compose(forms, 0, intialData, onAbandonCallback, onCompleteCallback);
  };
}

/*
 * Given initialData, goes through prebranchForms until it tests the condition:
 * if true, goes through trueForms
 * if false, goes through falseForms
 * then goes through joinForms
 */
export function composeBranchingForm<T, A, B>(
  intialData: T,
  prebranchForms: [NdxFormPageElem<T>, string | null][],
  condition: (v: T) => boolean,
  trueForms: [NdxFormPageElem<A>, string | null][],
  falseForms: [NdxFormPageElem<B>, string | null][],
  joinForms: [NdxFormPageElem<T>, string | null][],
  convertTrue: [(v: T) => A, (a: A) => T],
  convertFalse: [(v: T) => B, (b: B) => T]
) {
  return (abandon: () => void, complete: (res: T) => void) => {
    composeForm(intialData, prebranchForms)(abandon, (v) => {
      if (condition(v)) {
        falseForms.forEach(clearAndHideForm);
        composeForm(convertTrue[0](v), trueForms)(abandon, (a) => {
          composeForm(convertTrue[1](a), joinForms)(abandon, complete);
        });
      } else {
        trueForms.forEach(clearAndHideForm);
        composeForm(convertFalse[0](v), falseForms)(abandon, (b) => {
          composeForm(convertFalse[1](b), joinForms)(abandon, complete);
        });
      }
    });
  };
}

// Developer responsibilities:
// define isValid() method
// define body() method
// add this._selfValidate to all inputs
abstract class BasicFormPage<T> extends NdxFormPageElem<T> {
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

  setSlotToCurrFormAndFocus(show: boolean): void {
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

abstract class InctypeFormpageElem<T> extends BasicFormPage<T> {
  formTitle: string = "Choose a base type to extend";

  @query("input[name=inctype-name]")
  inctypeNameInput!: HTMLInputElement;

  isValid(): boolean {
    return this.inctypeNameInput.value !== "";
  }

  clear(): this {
    this.inctypeNameInput.value = "";
    return this;
  }

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

@customElement("tyname-form")
export class TypenameFormpageElem<
  T extends HasTypeNameAndDescription
> extends BasicFormPage<T> {
  get firstInput(): HTMLElement {
    return this.typenameInput;
  }

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
      dtype: ["PRIMITIVE", PrimitiveDtype.i8],
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

@customElement("default-name-form")
export class DefaultNameFormpageElem<
  T extends HasDefaultName
> extends BasicFormPage<T> {
  get firstInput(): HTMLElement {
    return this.defaultNameInput;
  }

  formTitle: string = "Define the name of the default instance";

  @query("input[name=default-name]")
  defaultNameInput!: HTMLInputElement;

  @query("input[name=fixed-name]")
  fixedNameInput!: HTMLInputElement;

  clear(): this {
    this.defaultNameInput.value = "";
    this.fixedNameInput.checked = false;
    return this;
  }

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

abstract class VizFormpageElem<T> extends NdxFormPageElem<T> {
  drawProgressBar(_: string[], __: number): void {}

  @state()
  viztext: string = "";

  fill(data: T): this {
    this.viztext = JSON.stringify(data, null, 2);
    return this;
  }

  clear(): this {
    this.viztext = "";
    return this;
  }

  @query("input[name=continue]")
  continueButton!: HTMLInputElement;

  setSlotToCurrFormAndFocus(show: boolean): void {
    this.slot = show ? "currForm" : "";
    this.continueButton.focus();
  }

  _selfValidate(): void {}

  body() {}

  render() {
    return html`
      <div>${this.viztext}</div>
      <input type="button" value="Back" @click=${this.onBackCallback} />
      <input type="button" value="Close" @click=${this.onCloseCallback} />
      <input
        type="button"
        name="continue"
        value="Continue"
        @click=${this.onNextCallback}
      />

      <div style="display:flex;">${this.body()}</div>
    `;
  }
}

@customElement("groupdef-viz")
export class GroupDefVizFormpageElem extends VizFormpageElem<GroupTypeDef> {
  groups: GroupDec[] = [];
  datasets: DatasetDec[] = [];
  attribs: AttributeDec[] = [];
  links: LinkDec[] = [];

  triggerAttributeForm: () => void;
  constructor() {
    super();
    this.triggerAttributeForm = () => {
      this.setSlotToCurrFormAndFocus(false);
      NdxForms.attributeBuilderForm(
        () => {
          this.setSlotToCurrFormAndFocus(true);
        },
        (value) => {
          this.attribs.push(value);
          this.setSlotToCurrFormAndFocus(true);
        }
      );
    };
  }

  transform = (data: GroupTypeDef) => {
    return data;
  };

  body() {
    return html`
      <input type="button" value="Add Group" />
      <input type="button" value="Add Dataset" />
      <input type="button" value="Add Attribute" />
      <input type="button" value="Add Link" />
    `;
  }
}

@customElement("datasetdef-viz")
export class DatasetDefVizFormpageElem extends VizFormpageElem<DatasetTypeDef> {
  attribs: AttributeDec[] = [];
  transform = (data: DatasetTypeDef) => {
    return data;
  };

  triggerAttributeForm: () => void;
  constructor() {
    super();
    this.triggerAttributeForm = () => {
      this.setSlotToCurrFormAndFocus(false);
      NdxForms.attributeBuilderForm(
        () => {
          this.setSlotToCurrFormAndFocus(true);
        },
        (value) => {
          this.attribs.push(value);
          this.setSlotToCurrFormAndFocus(true);
        }
      );
    };
  }

  body() {
    return html`<input
      type="button"
      value="Add Attribute"
      @click=${this.triggerAttributeForm}
    />`;
  }
}

function assertNever(_: never): never {
  throw new Error("Function not implemented.");
}

@customElement("form-parent")
export class NdxFormParent extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = false;

  constructor() {
    super();
    NdxForms.groupForms.forEach((f) => this.appendChild(f[0]));
    NdxForms.datasetForms.forEach((f) => this.appendChild(f[0]));
    NdxForms.attributeForms.forEach((f) => this.appendChild(f[0]));
    this.triggerGroupBuilder = () => {
      NdxForms.datasetForms.forEach((f) => f[0].clear());
      NdxForms.datasetForms.forEach((f) =>
        f[0].setSlotToCurrFormAndFocus(false)
      );
      this.formOpen = true;
      NdxForms.groupBuilderForm(
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
      NdxForms.groupForms.forEach((f) => f[0].clear());
      NdxForms.groupForms.forEach((f) => f[0].setSlotToCurrFormAndFocus(false));
      this.formOpen = true;
      NdxForms.datasetBuilderForm(
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

export class NdxForms {
  static defaultGroupTypedef: GroupTypeDef = {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  };

  static groupForms: [NdxFormPageElem<GroupTypeDef>, string | null][] = [
    [new GroupInctypeFormpageElem(), "Pick base type"],
    [new TypenameFormpageElem(), "Name and description"],
    [new DefaultNameFormpageElem(), "Optional fields"],
    [new GroupDefVizFormpageElem(), null],
  ];

  static groupBuilderForm = composeForm<GroupTypeDef>(
    NdxForms.defaultGroupTypedef,
    NdxForms.groupForms
  );

  static defaultDatasetTypedef: DatasetTypeDef = {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    attributes: [],
    shape: [],
    dtype: ["PRIMITIVE", PrimitiveDtype.i8],
  };

  static datasetForms: [NdxFormPageElem<DatasetTypeDef>, string | null][] = [
    [new DatasetInctypeFormpageElem(), "Pick base type"],
    [new TypenameFormpageElem(), "Name and description"],
    [new AxesFormpageElem(), "Define axes"],
    [new DefaultNameFormpageElem(), "Optional fields"],
    [new DatasetDefVizFormpageElem(), null],
  ];

  static datasetBuilderForm = composeForm<DatasetTypeDef>(
    NdxForms.defaultDatasetTypedef,
    NdxForms.datasetForms
  );

  static defaultAttribute: AttributeDec = {
    name: "",
    doc: "",
    dtype: ["PRIMITIVE", PrimitiveDtype.u8],
    shape: [],
    required: false,
  };

  static attributeForms: [NdxFormPageElem<AttributeDec>, string][] = [
    [new NameDecFormpageElem(), "Name and description"],
    [new AxesFormpageElem(), "Attribute shape"],
  ];

  static attributeBuilderForm = composeForm<AttributeDec>(
    NdxForms.defaultAttribute,
    NdxForms.attributeForms
  );

  static defaultLink: LinkDec = {
    doc: "",
    targetType: ["Core", "None"],
    quantityOrName: "",
  };

  static linkForms: [NdxFormPageElem<LinkDec>, string][] = [
    // [new DatasetInctypeFormpageElem(), ""],
  ];
}
