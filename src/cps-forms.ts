// import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit";
// import { customElement, query, state } from "lit/decorators.js";
// import { classMap } from "lit/directives/class-map.js";
// import { map } from "lit/directives/map.js";
// import { symbols } from "./styles";
// import {
//   AttributeDec,
//   DatasetDec,
//   DatasetType,
//   DatasetTypeDef,
//   Defaultable,
//   Dtype,
//   GroupDec,
//   GroupType,
//   GroupTypeDef,
//   LinkDec,
// } from "./nwb/spec";
// import { CPSForm, FormTrigger, ProgressState } from "./HOFS";
// import { NDXBuilderDefaultShowAndFocus } from "./forms";
// import { FormStepBar } from "./basic-elems";
// import { Initializers } from "./nwb/spec-defaults";

// @customElement("axes-form")
// export class AxesFormpageElem<T extends HasAxes> extends BasicFormPage<T> {
//   get firstInput(): HTMLElement {
//     return this.axesShapeInput;
//   }

//   formTitle: string = "Define the axes of the data in this type";

//   @query("input[name=axes-shape]")
//   axesShapeInput!: HTMLInputElement;

//   @query("input[name=axes-labels]")
//   axesLabelsInput!: HTMLInputElement;

//   @query("select[name=dtype]")
//   dtypeInput!: HTMLSelectElement;

//   clear(): this {
//     this.axesShapeInput.value = "";
//     this.axesLabelsInput.value = "";
//     this.dtypeInput.value = "uint8";
//     return this;
//   }

//   isValid(): boolean {
//     return true;
//   }

//   body(): TemplateResult<1> {
//     return html`
//       <label for="axes-shape">Axes Shape</label>
//       <input
//         name="axes-shape"
//         @input=${this._selfValidate}
//         placeholder="[3, 1, N]"
//       />
//       <label for="axes-labels">New type name</label>
//       <input
//         name="axes-labels"
//         @input=${this._selfValidate}
//         placeholder="['location', 'index', 'voltages']"
//       />
//       <label for="dtype">Stores data type</label>
//       <select name="dtype" @input=${this._selfValidate}>
//         <option>uint8</option>
//         <option>float32</option>
//       </select>
//     `;
//   }

//   transform: (data: T) => typeof data = (data: T) => {
//     let dims = this.axesShapeInput.value.split(",").map((s) => parseInt(s));
//     let labels = this.axesLabelsInput.value.split(",").map((s) => s.trim());
//     let dtype = this.dtypeInput.value;
//     let shape = dims.map((dim, i) => [dim, labels[i]] as [number, string]);
//     return {
//       ...data,
//       shape: shape,
//       dtype: ["PRIMITIVE", "i8"],
//     };
//   };

//   fill(data: T): this {
//     let dims = data.shape.map(([dim, _]) => dim);
//     let labels = data.shape.map(([_, label]) => label);
//     let dtype = data.dtype;
//     if (dims.length) {
//       this.axesShapeInput.value = dims.join(", ");
//     }
//     if (labels.length) {
//       this.axesLabelsInput.value = labels.join(", ");
//     }
//     if (dtype !== undefined) {
//       this.dtypeInput.value = "uint8";
//     }
//     return this;
//   }

//   static styles = [super.styles, css``];
// }

// @customElement("default-name-form")
// export class DefaultNameFormpageElem<
//   T extends HasDefaultName
// > extends BasicFormPage<T> {
//   get firstInput(): HTMLElement {
//     return this.defaultNameInput;
//   }

//   formTitle: string = "Define the name of the default instance";

//   @query("input[name=default-name]")
//   defaultNameInput!: HTMLInputElement;

//   @query("input[name=fixed-name]")
//   fixedNameInput!: HTMLInputElement;

//   clear(): this {
//     this.defaultNameInput.value = "";
//     this.fixedNameInput.checked = false;
//     return this;
//   }

//   isValid(): boolean {
//     return (
//       (this.defaultNameInput.value == "" &&
//         this.fixedNameInput.checked == false) ||
//       this.defaultNameInput.value.match(/^[a-zA-Z0-9_]+$/) !== null
//     );
//   }

//   body(): TemplateResult<1> {
//     return html`
//       <label for="default-name">Default Name</label>
//       <input name="default-name" @input=${this._selfValidate} placeholder="" />
//       <label for="fixed-name">Is this a valid name</label>
//       <input
//         name="fixed-name"
//         @input=${this._selfValidate}
//         type="checkbox"
//         placeholder="['location', 'index', 'voltages']"
//       />
//     `;
//   }

//   transform = (data: T) => {
//     if (this.defaultNameInput.value === "") {
//       return data;
//     }
//     let name = [
//       this.defaultNameInput.value,
//       this.fixedNameInput.checked,
//     ] as Defaultable<string>;
//     return {
//       ...data,
//       name: name,
//     };
//   };

//   fill(data: T): this {
//     if (data.name !== undefined) {
//       this.defaultNameInput.value = data.name[0];
//       this.fixedNameInput.checked = data.name[1];
//     } else {
//       this.defaultNameInput.value = "";
//       this.fixedNameInput.checked = false;
//     }
//     return this;
//   }

//   static styles = [super.styles, css``];
// }
