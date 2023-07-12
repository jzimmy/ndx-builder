import { LitElement, html, css, TemplateResult, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AttributeDec, TypeDef } from "./nwb/spec";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import { map } from "lit/directives/map.js";

export abstract class TypeElement extends LitElement {
  @state()
  minimize = true;

  @state()
  protected subtreeEnabled = false;

  protected onDelete = () => {
    throw new Error(`On delete not implemented. For ${this.constructor.name}`);
  };
  protected abstract body(): TemplateResult<1>;
  protected abstract subtree(enabled: boolean): TemplateResult<1>;

  render() {
    return html`
      <div class="row">
        <span
          class="material-symbols-outlined"
          @click=${() => (this.minimize = !this.minimize)}
          >${this.minimize ? "expand_content" : "minimize"}</span
        >
        <span
          class="material-symbols-outlined"
          @click=${() => {
            this.remove();
            this.onDelete();
          }}
          >close</span
        >
      </div>
      ${this.body()} ${this.subtree(this.subtreeEnabled)}
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        padding: 0.5em;
      }

      :host * {
        transition: 0.2s;
      }

      .row {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > .row:first-child > span:first-child {
        margin-left: auto;
      }

      :host > .row:first-child {
        margin-bottom: 0.5em;
        margin-right: 0.5em;
      }

      :host > .row:first-child > span {
        cursor: pointer;
        user-select: none;
        margin: 0 0.3em;
      }

      :host > .row:first-child > span:hover {
        color: var(--clickable-hover);
        background: var(--background-light-hover);
        padding: 0.05em;
        border-radius: 0.2em;
      }
    `,
  ] as CSSResultGroup;
}

export abstract class TypedefElement extends TypeElement {
  abstract fill(_typedef: TypeDef): void;
  abstract get typedef(): TypeDef;
  protected abstract icon: string;

  protected abstract requiredFields(): TemplateResult<1>;
  protected abstract optionalFields(): TemplateResult<1>;
  protected body(): TemplateResult<1> {
    return html`
      <div class=${classMap({ body: true, minimize: this.minimize })}>
        <div class="body-section">
            <div class="row">
                <span class="material-symbols-outlined">${this.icon}</span>
                <ndx-input .label=${"New type name"} id="typename"><ndx-input>
            </div>
            <ndx-textarea></ndx-textarea>
            <div class="row">
                <div id="keyword">extends</div>
                <light-button>Pick a type</light-button>
            </div>
        </div>
        ${this.requiredFields()}
        ${this.optionalFields()}
      </div>
    `;
  }

  static styles = [
    super.styles,
    css`
      .body {
        display: flex;
        border: 1px solid var(--color-border);
        padding: 1em;
        border-radius: 0.8em;
        box-shadow: 0 0 20px 5px #eee;
      }

      .body-section {
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--color-border-alt);
        padding: 0.5em;
      }

      .body-section:first-child {
        border-left: none;
        padding: 0;
      }

      .body-section.minimize {
        display: none;
      }

      .body-section > .row > span {
        font-size: 40px;
        margin-left: 0.2em;
      }

      .body-section > .row > #typename {
        flex: 1 1 auto;
        font-size: 1.2em;
        width: 100%;
        font-weight: 600;
      }

      .body-section > .row > #keyword {
        font-size: 1.2em;
      }

      .body-section > ndx-textarea {
        flex: 1 1 auto;
        font-size: 1em;
        width: 100%;
      }

      .body-section > .row:last-child {
        margin-left: auto;
      }

      .body-section > .row:last-child > light-button {
        margin: 0.3em 0.5em;
      }

      .body-section:not(:first-child) > div:first-child {
        margin-left: 0.5em;
      }

      .checkbox {
        margin-left: 1em;
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .checkbox > input {
        margin-top: auto;
        margin-bottom: 0.4em;
        margin-left: 0.5em;
        border: 1px solid var(--color-border-alt);
      }

      .checkbox > input:checked {
        background: var(--clickable);
      }

      .checkbox > input:checked:hover {
        background: var(--clickable-hover);
      }

      label {
        color: var(--color-border);
      }

      label > hover-icon {
        margin-left: 0.3em;
      }
    `,
  ] as CSSResultGroup;
}

@customElement("group-typedef")
export class GroupTypedef extends TypedefElement {
  icon: string = "folder";
  @state()
  groups: string[] = [];
  @state()
  datasets: string[] = [];
  @state()
  attribs: string[] = [];
  @state()
  links: string[] = [];

  fill(_typedef: TypeDef): void {
    throw new Error("Method not implemented.");
  }

  get typedef(): TypeDef {
    throw new Error("Method not implemented.");
  }

  protected requiredFields() {
    return html``;
  }

  protected optionalFields() {
    return html`
    <div class=${classMap({
      "body-section": true,
      minimize: this.minimize,
    })}
        >
        <div>Optional properties:</div>
        <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <label class="checkbox" for="fixed-name">Fixed name
            <input name="fixed-name" type="checkbox"></input>
            <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
        </label>
    </div>
    `;
  }

  protected subtree(enabled: boolean) {
    const disabled = !enabled;
    return html`
      <subtree-branch ?disabled=${disabled} id="groups">
        <span slot="icon" class="material-symbols-outlined large">folder</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="datasets">
        <span slot="icon" class="material-symbols-outlined large">dataset</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="attributes">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="links" lastBranch="true">
        <span slot="icon" class="material-symbols-outlined large">link</span>
      </subtree-branch>
    `;
  }
}

@customElement("dataset-typedef")
export class DatasetTypedef extends TypedefElement {
  icon: string = "dataset";

  @state()
  attribs: AttributeDec[] = [];

  fill(_typedef: TypeDef): void {
    throw new Error("Method not implemented.");
  }

  get typedef(): TypeDef {
    throw new Error("Method not implemented.");
  }

  protected requiredFields() {
    return html`
      <div
        class=${classMap({
          "body-section": true,
          minimize: this.minimize,
        })}
      >
        <div>Advanced properties:</div>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes shape"
        ></ndx-input>
        <ndx-input
          info="The default name will be applied when you declare an instance of this type"
          label="Axes labels"
        ></ndx-input>
      </div>
    `;
  }

  protected optionalFields() {
    return html`
    <div class=${classMap({
      "body-section": true,
      minimize: this.minimize,
    })}
        >
        <div>Optional properties:</div>
        <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <label class="checkbox" for="fixed-name">Fixed name
            <input name="fixed-name" type="checkbox"></input>
            <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
        </label>
    </div>
    `;
  }

  protected subtree(enabled: boolean) {
    const disabled = !enabled;
    return html`
      <subtree-branch
        ?disabled=${false}
        .elems=${this.attribs}
        ?lastBranch=${false}
        id="attributes"
      >
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
        <attribute-dec slot="elems"></attribute-dec>
        <attribute-dec slot="elems"></attribute-dec>
      </subtree-branch>
      <subtree-branch
        ?disabled=${false}
        .elems=${this.attribs}
        lastBranch="true"
        id="attributes"
      >
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
        <attribute-dec slot="elems"></attribute-dec>
        <attribute-dec slot="elems"></attribute-dec>
      </subtree-branch>
    `;
  }
}

// @customElement("type-def")
// export class __GroupTypedef extends LitElement {
//   @state()
//   minimize = true;

//   fill(_typedef: TypeDef) {}

//   private body() {
//     return html`
//       <div class=${classMap({ body: true, minimize: this.minimize })}>
//         <div class="body-section">
//             <div class="row">
//                 <span class="material-symbols-outlined">folder</span>
//                 <ndx-input .label=${"New type name"} id="typename"><ndx-input>
//             </div>
//             <ndx-textarea></ndx-textarea>
//             <div class="row">
//                 <div>extends</div>
//                 <light-button>Pick a type</light-button>
//             </div>
//         </div>
//         ${this.requiredFields()}
//         ${this.optionalFields()}
//       </div>
//     `;
//   }

//   private requiredFields() {
//     return html``;
//   }

//   private optionalFields() {
//     return html`
//     <div class=${classMap({
//       "body-section": true,
//       minimize: this.minimize,
//     })}
//         >
//         <div>Optional properties:</div>
//         <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
//         <label class="checkbox" for="fixed-name">Fixed name
//             <input name="fixed-name" type="checkbox"></input>
//             <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
//         </label>
//     </div>
//     `;
//   }

//   private subtree(enabled: boolean) {
//     const disabled = !enabled;
//     return html`
//       <subtree-branch ?disabled=${disabled} id="groups">
//         <span slot="icon" class="material-symbols-outlined large">folder</span>
//       </subtree-branch>
//       <subtree-branch ?disabled=${disabled} id="datasets">
//         <span slot="icon" class="material-symbols-outlined large">dataset</span>
//       </subtree-branch>
//       <subtree-branch ?disabled=${disabled} id="attributes">
//         <span slot="icon" class="material-symbols-outlined large"
//           >edit_note</span
//         >
//       </subtree-branch>
//       <subtree-branch ?disabled=${disabled} id="links" lastBranch="true">
//         <span slot="icon" class="material-symbols-outlined large">link</span>
//       </subtree-branch>
//     `;
//   }

//   render() {
//     return html`
//       <div class="row">
//         <span
//           class="material-symbols-outlined"
//           @click=${() => (this.minimize = !this.minimize)}
//           >${this.minimize ? "expand_content" : "minimize"}</span
//         >
//         <span class="material-symbols-outlined">close</span>
//       </div>
//       ${this.body()} ${this.subtree(true)}
//     `;
//   }

//   static styles = [
//     symbols,
//     css`
//       :host {
//         padding: 0.5em;
//       }

//       :host * {
//         transition: 0.2s;
//       }

//       .row {
//         display: flex;
//         flex-direction: row;
//         align-items: center;
//       }

//       :host > .row:first-child > span:first-child {
//         margin-left: auto;
//       }

//       :host > .row:first-child {
//         margin-bottom: 0.5em;
//         margin-right: 0.5em;
//       }

//       :host > .row:first-child > span {
//         cursor: pointer;
//         user-select: none;
//         margin: 0 0.3em;
//       }

//       :host > .row:first-child > span:hover {
//         color: var(--clickable-hover);
//         background: var(--background-light-hover);
//         padding: 0.05em;
//         border-radius: 0.2em;
//       }

//       .body {
//         display: flex;
//         border: 1px solid var(--color-border);
//         padding: 1em;
//         border-radius: 0.8em;
//         box-shadow: 0 0 20px 5px #eee;
//       }

//       .body-section {
//         display: flex;
//         flex-direction: column;
//         border-left: 1px solid var(--color-border-alt);
//         padding: 0.5em;
//       }

//       .body-section:first-child {
//         border-left: none;
//         padding: 0;
//       }

//       .body-section.minimize {
//         display: none;
//       }

//       .body-section > .row > span {
//         font-size: 40px;
//         margin-left: 0.2em;
//       }

//       .body-section > .row > #typename {
//         flex: 1 1 auto;
//         font-size: 1.2em;
//         width: 100%;
//         font-weight: 600;
//       }

//       .body-section > ndx-textarea {
//         flex: 1 1 auto;
//         font-size: 1em;
//         width: 100%;
//       }

//       .body-section > .row:last-child {
//         margin-left: auto;
//       }

//       .body-section > .row:last-child > light-button {
//         margin: 0.3em 0.5em;
//       }

//       .body-section:not(:first-child) > div:first-child {
//         margin-left: 0.5em;
//       }

//       .checkbox {
//         margin-left: 1em;
//         display: flex;
//         flex-direction: row;
//         align-items: center;
//       }

//       .checkbox > input {
//         margin-top: auto;
//         margin-bottom: 0.4em;
//         margin-left: 0.5em;
//         border: 1px solid var(--color-border-alt);
//       }

//       .checkbox > input:checked {
//         background: var(--clickable);
//       }

//       .checkbox > input:checked:hover {
//         background: var(--clickable-hover);
//       }

//       label {
//         color: var(--color-border);
//       }

//       label > hover-icon {
//         margin-left: 0.3em;
//       }
//     `,
//   ];
// }

@customElement("subtree-branch")
export class SubtreeBranch extends LitElement {
  @property({ type: Boolean })
  lastBranch = false;

  @property()
  elems: HTMLElement[] = [];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Function })
  addElem = () => {};

  render() {
    return html`
      <div class="branchline">
        <div class="elbow">
          <span class="icon">
            <slot name="icon"></slot>
          </span>
        </div>
        ${this.lastBranch ? `` : html` <div class="vert"></div>`}
      </div>
      <slot name="elems"></slot>
      <div class="branchelement">
        <light-button ?disabled=${this.disabled} @click=${this.addElem}>
          <span class="material-symbols-outlined" style="font-size:1.3em"
            >add</span
          >
        </light-button>
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: row;
        --upper-break: 4em;
        padding-left: 4em;
      }

      :host([disabled]) {
        opacity: 0.4;
      }

      :host > div {
        display: flex;
        flex-direction: column;
      }

      :host > * {
        margin-right: 0.5em;
      }

      .branchline {
        display: flex;
        flex-direction: column;
      }

      .branchline > .elbow {
        min-height: var(--upper-break);
        width: 4em;
        border-bottom: 2px solid var(--color-border);
        border-left: 2px solid var(--color-border);
        display: flex;
      }

      .branchline > .vert {
        height: 100%;
        border-left: 2px solid var(--color-border);
      }

      .branchelement > .horizontal {
        padding-top: 1em;
        width: 2em;
        border-bottom: 2px solid var(--color-border);
      }

      .branchelement {
        margin-top: calc(var(--upper-break) - 1em);
      }

      /* add button */
      .branchelement:last-child {
        margin-top: calc(var(--upper-break) - 0.8em);
        margin-bottom: auto;
        cursor: pointer;
        opacity: 0.8;
      }

      .branchelement:last-child > light-button {
        padding: 0.1em 0.3em;
      }

      .typedec {
        height: 200px;
        background: lightblue;
      }

      .icon {
        margin-top: auto;
        margin-left: auto;
        margin-right: 0.5em;
        margin-bottom: 0.3em;
        cursor: default;
      }

      ::slotted([slot="elems"]) {
        padding-right: 2em;
      }
    `,
  ];
}
