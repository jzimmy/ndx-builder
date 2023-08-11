import { TemplateResult, html, css } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  HasTypeNameAndDescription,
  HasDefaultName,
  HasInstanceNameAndDescription,
  HasAxes,
} from "./parent";
import { BasicFormPage, NDXBuilderDefaultShowAndFocus } from "./basic-form";
import { CPSForm, Trigger, ProgressState } from "./hofs";
import { FormStepBar } from "./basic-elems";
import { AttributeDec, DatasetTypeDef } from "./nwb/spec";
import { Initializers } from "./nwb/spec-defaults";
import { map } from "lit/directives/map.js";
import "./subtree";

@customElement("tydef-form")
export class TypenameForm<
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

@customElement("axes-form")
export class AxesForm<T extends HasAxes> extends BasicFormPage<T> {
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
      shape: [shape],
      dtype: ["PRIMITIVE", "i8"],
    };
  };

  fill(data: T, progress: ProgressState): this {
    this.drawProgressBar(progress);
    console.log("here", this, data);
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

abstract class VizForm<T> extends CPSForm<T> {
  abstract firstInput: HTMLInputElement;

  @state()
  viztext: string = "";

  fill(data: T, progress?: ProgressState) {
    this.stepBar.setProgressState(progress);
    this.viztext = JSON.stringify(data, null, 2);
    return this;
  }

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible, this.firstInput);
  }

  clear(): this {
    this.viztext = "";
    return this;
  }

  @query("step-bar")
  stepBar!: FormStepBar;

  @query("input[name=continue]")
  continueButton!: HTMLInputElement;

  abstract body(): TemplateResult<1>;

  render() {
    return html`
      <step-bar></step-bar>
      <div>${this.viztext}</div>
      <input type="button" value="Back" @click=${this.back} />
      <input type="button" value="Close" @click=${this.quit} />
      <input
        type="button"
        name="continue"
        value="Continue"
        @click=${this.next}
      />
      <div style="display:flex;">${this.body()}</div>
    `;
  }
}

// @customElement("groupdef-viz")
// export class GroupDefVizForm extends VizForm<GroupTypeDef> {
//   @query("input[name=add-group]")
//   firstInput!: HTMLInputElement;

//   @property()
//   groups: GroupDec[] = [];
//   @property()
//   datasets: DatasetDec[] = [];
//   @property()
//   attribs: AttributeDec[] = [];
//   @property()
//   links: LinkDec[] = [];

//   triggerAttributeForm: () => void;
//   constructor(attributeBuilderForm: Trigger<AttributeDec>) {
//     super();
//     this.triggerAttributeForm = () => {
//       this.showAndFocus(false);
//       attributeBuilderForm(
//         Initializers.attributeDec,
//         () => {
//           this.showAndFocus(true);
//         },
//         (value) => {
//           this.showAndFocus(true);
//           this.attribs = [...this.attribs, value];
//         }
//       );
//     };
//   }

//   transform = (data: GroupTypeDef) => {
//     return data;
//   };

//   body() {
//     return html`
//       <input type="button" name="add-group" value="Add Group" />
//       <input type="button" name="add-dataset" value="Add Dataset" />
//       <input
//         type="button"
//         name="add-attrib"
//         value="Add Attribute"
//         @click=${this.triggerAttributeForm}
//       />
//       <input type="button" name="add-link" value="Add Link" />
//       ${map([this.groups], (x) => html`${JSON.stringify(x)}`)}
//       ${map([this.datasets], (x) => html`${JSON.stringify(x)}`)}
//       ${map([this.attribs], (x) => html`${JSON.stringify(x)}`)}
//       ${map([this.links], (x) => html`${JSON.stringify(x)}`)}
//     `;
//   }
// }

@customElement("datasetdef-viz")
export class DatasetDefVizForm extends VizForm<DatasetTypeDef> {
  @query("input[name=add-attrib]")
  firstInput!: HTMLInputElement;

  @property()
  attribs: AttributeDec[] = [];

  transform = (data: DatasetTypeDef) => {
    return { ...data, attributes: this.attribs };
  };

  triggerAttributeForm: () => void;

  constructor(attributeBuilderForm: Trigger<AttributeDec>) {
    super();
    this.triggerAttributeForm = () => {
      this.showAndFocus(false);
      attributeBuilderForm(
        Initializers.attributeDec,
        () => {
          this.showAndFocus(true);
        },
        (value) => {
          this.showAndFocus(true);
          this.attribs = [...this.attribs, value];
        }
      );
    };
  }

  body() {
    return html`<input
        type="button"
        name="add-attrib"
        value="Add Attribute"
        @click=${this.triggerAttributeForm}
      />
      ${map([this.attribs], (x) => html`${JSON.stringify(x)}`)} `;
  }
}
