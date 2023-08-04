import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import {
  customElement,
  state,
  query,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { symbols } from "./styles";
import { NdxInput } from "./playground";
import { Defaultable, GroupTypeDef } from "./nwb/spec";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { choose } from "lit/directives/choose.js";
import { CPSForm } from "./HOFS";

interface NamedNdxElem {
  name?: Defaultable<string>;
}

interface ShapedNdxElem {
  dataType: string;
  axes: [number, string][];
}

// appears inside the visualization
@customElement("default-name")
export class DefaultNameElem extends LitElement {
  @property()
  defaultName: string = "";

  @property({ type: Boolean })
  fixedName: boolean = false;

  get value() {
    if (!this.nameInput.getValue()) {
      return null;
    }
    return [this.nameInput.getValue(), true];
  }

  @query("ndx-input")
  nameInput!: NdxInput;

  render() {
    return html`
        <ndx-input .value=${this.defaultName} info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <label class="checkbox" for="fixed-name">
            <input name="fixed-name" type="checkbox" .checked=${this.fixedName}></input>Fixed name
            <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
        </label>
    `;
  }

  static styles = css`
    label {
      display: flex;
      align-items: center;
    }

    label > hover-icon {
      margin: 0 0.3em;
    }

    label,
    label > input[type="checkbox"] {
      margin: 0 0.5em;
    }
  ` as CSSResultGroup;
}

@customElement("nd-array")
export class NdArrayElem extends LitElement {
  render() {
    return html`
      <ndx-input label="Data type"></ndx-input>
      <ndx-input label="Axes shape"></ndx-input>
      <ndx-input label="Axes dimension"></ndx-input>
    `;
  }
}

@customElement("name-or-quantity")
export class NameOrQuantityElem extends LitElement {
  @state()
  namedNotQuantity = false;

  @query("#name")
  nameInput!: HTMLInputElement;

  @query("#quantity")
  quantityInput!: HTMLInputElement;

  get value() {
    return this.namedNotQuantity
      ? this.nameInput.value
      : this.quantityInput.value;
  }

  render() {
    return html`
      <label
        ><input
          @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
          .checked=${this.namedNotQuantity}
          type="checkbox"
        />Named instance</label
      >
      ${this.namedNotQuantity
        ? html` <ndx-input id="name" label="Instance name"></ndx-input> `
        : html`<ndx-input id="quantity" label="Quantity"></ndx-input>`}
    `;
  }

  static styles = css`
    label,
    label > input[type="checkbox"] {
      margin: 0 0.5em;
    }
  `;
}

export abstract class BasicFormElem<T> extends LitElement {
  @property()
  currentForm = 0;

  @queryAssignedElements()
  forms!: HTMLElement[];

  abstract addFields: (value: T) => T;

  render() {
    return html`
      <h1>${this.forms[this.currentForm].title}</h1>
      <slot name="fields"></slot>
    `;
  }
}

// // appears as a page in a multiform
// @customElement("default-name-formpage")
// export class DefaultNameFormpageElem<
//   T extends NamedNdxElem
// > extends ComposedFormElem<T> {
//   title = "Add a default name to instances of this type";
//   isValid: () => boolean = () => {
//     return this.nameInput.value != null;
//   };

//   showWithValues: (value: T) => Element = (_value) => {
//     return this;
//   };

//   transform: (oldT: T) => T = (oldT: T) => {
//     if (this.nameInput.value == "") {
//       return { ...oldT, name: undefined };
//     }
//     return {
//       ...oldT,
//       name: [
//         this.nameInput.value,
//         this.fixedNameCheckbox.checked,
//       ] as Defaultable<string>,
//     };
//   };

//   @query("ndx-input")
//   nameInput!: NdxInput;

//   @query("input[type='checkbox']")
//   fixedNameCheckbox!: HTMLInputElement;

//   render() {
//     return html`
//         <h1>Instance names</h1>
//         <h3>Optional</h3>
//         <div>The default name will ...</div>
//         <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
//         <div>When another types uses this type do this</div>
//         <label class="checkbox" for="fixed-name">
//             <input name="fixed-name" type="checkbox"></input>Fixed name
//             <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
//         </label>
//     `;
//   }

//   static styles = [
//     DefaultNameElem.styles,
//     css`
//       :host {
//         display: flex;
//         flex-direction: column;
//         color: var(--color-text);
//       }

//       h1 {
//         text-align: center;
//       }
//     `,
//   ];
// }

// @customElement("nd-array-formpage")
// export class NDArrayFormpageElem<
//   T extends ShapedNdxElem
// > extends ComposedFormElem<T> {
//   @property()
//   title = "Define the shape of the axes";

//   isValid: () => boolean = () => {
//     return this.axes != null && this.dtype != null;
//   };

//   showWithValues: (value: T) => Element = (value) => {
//     this.axes = value.axes;
//     this.dtype = value.dataType;
//     return this;
//   };

//   transform: (oldT: T) => T = (oldT: T) => {
//     return {
//       ...oldT,
//       dataType: this.dtypeInput.value,
//       axes: this.axes,
//     };
//   };

//   @state()
//   dtype: string = "float32";

//   @state()
//   axes: [number, string][] = [];

//   @query("#dtype")
//   dtypeInput!: NdxInput;

//   @query("#shape")
//   shapeInput!: NdxInput;

//   @query("#labels")
//   labelsInput!: NdxInput;

//   render() {
//     return html`
//       <div>Enter the type of data being stored</div>
//       <ndx-input id="dtype" label="Data type"></ndx-input>
//       <div>Enter the sizes of the axes</div>
//       <ndx-input id="shape" label="Axes shape"></ndx-input>
//       <div>Enter the axes labels</div>
//       <ndx-input id="labels" label="Axes dimension"></ndx-input>
//     `;
//   }
// }

// // TODO REMOVE ME
// // Demo group type

// @customElement("group-inctype-browser")
// export class GroupInctypeBrowser extends CPSForm<GroupTypeDef> {
//   title: string = "Pick a base type to extend";
//   isValid: () => boolean = () => {
//     return this.category == "None" || this.selectedType != -1;
//   };

//   showWithValues = (_: GroupTypeDef) => this;
//   transform = (oldT: GroupTypeDef) => {
//     return {
//       ...oldT,
//       neurodataTypeInc: ["Core", "None"],
//     } as GroupTypeDef;
//   };

//   @property({ reflect: true })
//   private _category: "Core" | "Typedef" | "None" = "Core";
//   get category() {
//     return this._category;
//   }
//   set category(val: "Core" | "Typedef" | "None") {
//     this._category = val;
//     if (val != "None") this.selectedType = -1;
//   }

//   @state()
//   selectedModule: number = 0;

//   @state()
//   private _selectedType: number = -1;
//   get selectedType() {
//     return this._selectedType;
//   }
//   set selectedType(val: number) {
//     this._selectedType = val;
//     this.validate();
//   }

//   // 8 dummy entries
//   @property()
//   myTypes: string[] = [
//     "mytype1",
//     "mytype2",
//     "mytype3",
//     "mytype5",
//     "mytype7",
//     "mytype8",
//   ];
//   //   myTypes: ["GROUP" | "DATASET", string][] = [];

//   // pynwb core module names
//   modules = [
//     "core",
//     "device",
//     "ecephys",
//     "file",
//     "misc",
//     "ophys",
//     "processing",
//     "time_series",
//     "behavior",
//     "ecephys",
//   ];

//   private coreMenu() {
//     return html`
//       <div class="coremenu-grid">
//         <div class="modulemenu">
//           <h3>Modules</h3>
//           ${map(
//             this.modules,
//             (module, i) =>
//               html`<div
//                 class=${classMap({ selected: i == this.selectedModule })}
//                 @click=${() => {
//                   this.selectedModule = i;
//                   this.selectedType = -1;
//                 }}
//               >
//                 ${module}
//               </div>`
//           )}
//         </div>
//         <div class="typelist">
//           ${map(
//             this.modules.slice(0, this.modules[this.selectedModule].length),
//             (module, i) =>
//               html`<div
//                 class=${classMap({ selected: i == this.selectedType })}
//                 @click=${() => (this.selectedType = i)}
//               >
//                 ${module}
//               </div>`
//           )}
//         </div>
//       </div>
//     `;
//   }

//   private mineMenu() {
//     return html`
//       <div class="coremenu-grid">
//         <div class="typelist">
//           ${map(
//             this.myTypes,
//             (type, i) =>
//               html`<div
//                 class=${classMap({ selected: i == this.selectedType })}
//                 @click=${() => (this.selectedType = i)}
//               >
//                 ${type}
//               </div>`
//           )}
//         </div>
//       </div>
//     `;
//   }

//   private noneMenu() {
//     return html`
//       <div class="typelist">
//         <div class="dummy selected">None</div>
//       </div>
//     `;
//   }

//   protected firstUpdated(
//     _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
//   ): void {
//     super.firstUpdated(_changedProperties);
//   }

//   private changeCategory(category: "Core" | "Typedef" | "None") {
//     this.category = category;
//     if (category != "None") this.selectedType = -1;
//   }

//   render() {
//     return html`
//       <div>
//         <h3 class=${classMap({ selected: this.category == "Core" })}
//             @click=${() => this.changeCategory("Core")}
//         >
//           Core Types
//         </h3>
//         ${
//           this.myTypes.length > 0
//             ? html`
//                 <h3
//                   class=${classMap({ selected: this.category == "Typedef" })}
//                   @click=${() => this.changeCategory("Typedef")}
//                 >
//                   My Types
//                 </h3>
//               `
//             : html``
//         }
//         <h3 class=${classMap({ selected: this.category == "None" })}
//             @click=${() => this.changeCategory("None")}
//         >
//           No Base
//         </h3>
//         <hr></hr>
//       </div>
//       ${choose(this.category, [
//         ["Core", () => this.coreMenu()],
//         ["Typedef", () => this.mineMenu()],
//         ["None", () => this.noneMenu()],
//       ])}
//     `;
//   }

//   static styles = [
//     symbols,
//     css`
//       :host {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         box-sizing: border-box;
//         min-width: 500px;
//         position: relative;
//       }

//       :host * {
//         transition: 0.2s;
//       }

//       :host > span {
//         position: absolute;
//         top: 0;
//         right: 50%;
//         transform: translate(1150%, 75%);
//         cursor: pointer;
//         border: 2px solid red;
//       }

//       h2 {
//         margin: 0.5em;
//       }

//       :host > div {
//         display: flex;
//         flex-direction: row;
//         justify-content: center;
//         padding: auto;
//         position: relative;
//         width: 100%;
//         transition: 0.3s;
//       }

//       :host > div > h3 {
//         margin: 0.5em 1em;
//         min-width: 80px;
//         padding: 0.3em 0.5em;
//         text-align: center;
//         cursor: pointer;
//       }

//       :host > div > h3:hover {
//         color: var(--clickable);
//       }

//       hr {
//         position: absolute;
//         top: 70%;
//         width: 80%;
//         transition: 0.3s;
//       }

//       .selected {
//         text-decoration: underline;
//       }

//       :host > div > h3:not(:hover).selected {
//         color: var(--clickable);
//       }

//       .coremenu-grid {
//         padding: 1em;
//         width: 100%;
//         box-sizing: border-box;
//         display: flex;
//         justify-content: center;
//       }

//       .modulemenu {
//         margin-right: 0.5em;
//         position: relative;
//         padding-right: 1em;
//         border-right: 1px solid var(--color-border-alt);
//       }

//       .modulemenu > h3 {
//         text-align: center;
//         position: sticky;
//         top: 0;
//         margin: 0;
//         padding: 0;
//         background: var(--color-background-alt);
//         border-bottom: 1px solid var(--color-border-alt);
//       }

//       .modulemenu > div {
//         padding: 0.6em 0.5em;
//         padding-bottom: 0.1em;
//         border-bottom: 1px solid var(--color-border-alt);
//         margin: 0 0.3em;
//         cursor: pointer;
//       }

//       .modulemenu > div:hover {
//         color: var(--clickable);
//         border-bottom: 1px solid var(--clickable);
//       }

//       .modulemenu > div.selected {
//         color: var(--clickable-hover);
//         border-bottom: 2px solid var(--clickable-hover);
//         text-decoration: none;
//       }

//       .modulemenu + .typelist {
//         margin-right: auto;
//       }

//       .typelist {
//         box-sizing: border-box;
//         display: grid;
//         grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
//         margin-bottom: auto;
//         width: 400px;
//         padding: 2em;
//       }

//       .typelist > div {
//         padding: 0.3em 0.5em;
//         border-radius: 0.2em;
//         height: 1.5em;
//         cursor: pointer;
//         margin: 0.4em;
//         border: 1px solid var(--color-border-alt);
//       }

//       .typelist > div:hover {
//         color: var(--clickable);
//         border: 1px solid var(--clickable);
//       }

//       .typelist > div.selected {
//         border: 2px solid var(--clickable);
//         color: var(--clickable);
//       }

//       :host > div:last-child {
//         display: flex;
//         padding: 0 2em;
//         width: 100%;
//         box-sizing: border-box;
//       }

//       :host > div:last-child > dark-button {
//         margin-left: auto;
//       }

//       .dummy {
//         width: 80px;
//         margin: 1em;
//       }
//     `,
//   ];
// }
