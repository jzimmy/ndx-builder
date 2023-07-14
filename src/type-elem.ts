import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import {
  AttribDecElem,
  DatasetDecElem,
  GroupDecElem,
  LinkDecElem,
} from "./experiments";

/* Wrapper element for a type elem, contains the minimize,
 * close button and slots for the body and subtree.
 * Useful for creating **radically** new type constructor UIs.
 */
@customElement("type-elem-skeleton")
export class TypeElemSkeleton extends LitElement {
  @property({ type: Boolean, reflect: true })
  minimize: boolean = true;

  @state()
  protected subtreeEnabled = false;

  @property({ type: Function })
  onDelete = (target?: EventTarget) => {
    throw new Error(`On delete not implemented. ${target}`);
  };

  render() {
    return html`
      <div id="main">
        <div class="row">
          <span
            class="material-symbols-outlined"
            @click=${() => (this.minimize = !this.minimize)}
            >${this.minimize ? "expand_content" : "minimize"}</span
          >
          <span
            class="material-symbols-outlined"
            @click=${(e: Event) => {
              this.remove();
              this.onDelete(e.target!);
            }}
            >close</span
          >
        </div>
        <slot name="body"></slot>
      </div>
      <slot
        name="subtree"
        class=${classMap({ disabled: !this.subtreeEnabled })}
      ></slot>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        position: relative;
      }
      :host * {
        transition: 0.2s;
      }

      .row {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .row > span:first-child {
        margin-left: auto;
      }

      .row {
        margin-bottom: 0.5em;
        margin-right: 0.5em;
      }

      .row > span {
        cursor: pointer;
        user-select: none;
        margin: 0 0.3em;
      }

      .row > span:hover {
        color: var(--clickable-hover);
        background: var(--background-light-button);
        padding: 0.05em;
        border-radius: 0.2em;
      }

      ::slotted([slot="body"]) {
        padding: 0.5em;
      }
    `,
  ] as CSSResultGroup;
}

/* Wrapper element for a type elem, contains the body and subtree contents.
 * Uses a template of slots to type constructor UIs very easy to build and modify.
 */
@customElement("type-elem")
export class TypeElem extends LitElement {
  // TODO: find an automatic solution to hide when no slotted children (ideally css)!!!
  @property({ type: Boolean, reflect: true })
  noProperties: boolean = true;
  @property({ type: Boolean, reflect: true })
  noOptions: boolean = true;

  @property({ type: Function })
  onDelete(target?: EventTarget): void {
    throw new Error(`On delete not implemented. ${target}`);
  }

  @property({ type: Boolean, reflect: true })
  openForm: boolean = false;

  render() {
    if (this.openForm) return html`<slot name="form"></slot>`;
    return html`
      <type-elem-skeleton .onDelete=${this.onDelete}>
        <div id="body" slot="body">
          <div>
            <div class="row">
              <slot class="icon" name="icon"></slot>
              <slot name="topinput"></slot>
            </div>
            <slot name="first-fields"></slot>
            <div class="row">
              <slot name="bottominput"></slot>
            </div>
          </div>
          <div class="advanced">
            <div>Properties:</div>
            <slot name="properties"></slot>
          </div>
          <div class="options">
            <div>Optional fields:</div>
            <slot name="options"></slot>
          </div>
        </div>
        <slot name="subtree" slot="subtree"></slot>
      </type-elem-skeleton>
    `;
  }

  static styles = css`
    #body {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: 0.5em;
      padding: 1em;
      box-shadow: 0 0 20px 5px #eee;
    }

    .row {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-left: 0.5em;
    }

    .row:last-child {
      margin: 0 0.5em;
    }

    ::slotted([slot="keyword"]) {
      font-size: 1.3em;
      margin: 0 0.5em;
    }

    ::slotted([slot="topinput"]) {
      font-size: 1.1em;
    }

    :not(type-elem-skeleton[minimize]) .advanced {
      margin-left: 0.5em;
    }

    ::slotted([slot="advanced-fields"]) {
      margin-left: 0.5em;
      padding-left: 0.5em;
      border-left: 1px solid var(--color-border-alt);
    }

    .advanced,
    .options {
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--color-border-alt);
      padding-left: 0.5em;
    }

    :not(:host([noOptions])) .advanced {
      padding-right: 0.5em;
    }

    .advanced > div:first-child,
    .options > div:first-child {
      padding: 0.3em 0.5em;
    }

    type-elem-skeleton[minimize] .advanced,
    type-elem-skeleton[minimize] .options,
    :host([noProperties]) .advanced,
    :host([noOptions]) .options {
      display: none;
    }

    :host([openForm]) ::slotted(*) {
      display: none;
    }

    :host([openForm]) ::slotted([slot="form"]) {
      display: flex;
      justify-content: center;
    }
  `;
}

/* Adds some useful helper functions and styles to inherit.
 * This class has little semantic purpose beyond reducing boilerplate.
 */
export abstract class BasicTypeElem extends LitElement {
  abstract get valid(): boolean;

  protected abstract icon: string;
  protected subtreeDisabled = true;
  protected onDelete(target?: EventTarget): void {
    throw new Error(`On delete not implemented. ${target}`);
  }

  protected onSave(): void {
    throw new Error(`On save not implemented.`);
  }

  protected renderIcon() {
    return html`<span slot="icon" class="material-symbols-outlined large"
      >${this.icon}</span
    >`;
  }

  @query("type-elem")
  typeElem!: TypeElem;

  protected toggleForm() {
    this.typeElem.openForm = !this.typeElem.openForm;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (!this.typeElem) return;
    this.typeElem.onDelete = this.onDelete;
  }

  static styles = [
    symbols,
    css`
      light-button[slot="topinput"] {
        margin-right: 0.5em;
      }

      light-button[slot="topinput"] + * {
        margin-top: 0.5em;
      }

      #keyword {
        font-size: 1.3em;
        margin: 0 0.5em;
      }

      .selected {
        font-weight: bold;
        color: var(--clickable-hover);
      }

      [slot="bottominput"] {
        margin-top: 0.2em;
      }

      #keyword[slot="bottominput"] {
        margin-left: auto;
      }

      [slot="bottominput"]:last-child {
        margin-right: 0.5em;
      }

      ndx-input[slot="topinput"] {
        font-weight: bold;
      }
    `,
  ];
}

/* subtrees */

@customElement("subtree-branchh")
export class SubtreeBranchh extends LitElement {
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

      :host([disabled]) .branchline > div {
        border-color: var(--color-border-alt);
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

      /* TODO: figure this out???? */
      .typedec {
        height: 200px;
        background: red;
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

@customElement("group-subtree")
export class GroupSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = true;

  @property()
  attribs: AttribDecElem[] = [];
  @property()
  datasets: DatasetDecElem[] = [];
  @property()
  groups: GroupDecElem[] = [];
  @property()
  links: LinkDecElem[] = [];

  render() {
    return html`<subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        id="groups"
      >
        <span slot="icon" class="material-symbols-outlined">folder</span>
      </subtree-branchh>
      <subtree-branchh ?disabled=${this.disabled} slot="subtree" id="datasets">
        <span slot="icon" class="material-symbols-outlined">dataset</span>
      </subtree-branchh>
      <subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        id="attributes"
      >
        <span slot="icon" class="material-symbols-outlined">edit_note</span>
      </subtree-branchh>
      <subtree-branchh
        ?disabled=${this.disabled}
        slot="subtree"
        lastBranch="true"
        id="links"
      >
        <span slot="icon" class="material-symbols-outlined">link</span>
      </subtree-branchh>`;
  }

  static styles = [
    symbols,
    css`
      span.material-symbols-outlined {
        font-size: 30px;
      }
    `,
  ];
}

@customElement("dataset-subtree")
export class DatasetSubtree extends LitElement {
  @property({ type: Boolean })
  disabled = true;

  @property()
  attribs: AttribDecElem[] = [];

  render() {
    return html`<subtree-branchh
      ?disabled=${this.disabled}
      slot="subtree"
      lastBranch="true"
      id="attributes"
    >
      <span slot="icon" class="material-symbols-outlined">edit_note</span>
    </subtree-branchh>`;
  }

  static styles = symbols;
}
