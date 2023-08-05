import { LitElement, html, css, CSSResultGroup, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import {
  AttribDecElem,
  DatasetDecElem,
  GroupDecElem,
  LinkDecElem,
} from "./typeviz";
import { when } from "lit-html/directives/when.js";

/* Wrapper element for a type elem, contains the minimize,
 * close button and slots for the body and subtree.
 * Useful for creating **radically** new type constructor UIs.
 */
@customElement("type-elem-skeleton")
export class TypeElemSkeleton extends LitElement {
  @property({ type: Boolean, reflect: true })
  hideCloseBtn: boolean = false;

  @property({ type: Boolean, reflect: true })
  minimize: boolean = true;

  @property({ type: Function })
  onMinimize: () => void = () => {};

  @state()
  protected subtreeEnabled = false;

  @property({ type: Function })
  onDelete = (target?: EventTarget) => {
    throw new Error(`On delete not implemented. ${target}`);
  };

  private _handleMinimize() {
    this.minimize = !this.minimize;
    if (this.minimize) {
      this.onMinimize();
    }
  }

  render() {
    return html`
      <div id="main">
        <div class="row">
          <span class="material-symbols-outlined" @click=${this._handleMinimize}
            >${this.minimize ? "expand_content" : "minimize"}</span
          >
          ${when(
            !this.hideCloseBtn,
            () => html`
              <span
                class="material-symbols-outlined"
                @click=${(e: Event) => {
                  this.remove();
                  this.onDelete(e.target!);
                }}
                >close</span
              >
            `
          )}
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
  hideCloseBtn: boolean = false;

  @property({ type: Function })
  onMinimize: () => void = () => {};

  render() {
    return html`
      <type-elem-skeleton
        .onDelete=${this.onDelete}
        .hideCloseBtn=${this.hideCloseBtn}
        .onMinimize=${this.onMinimize}
      >
        <div id="body" slot="body">
          <div class="main-section">
            <div class="row">
              <slot class="icon" name="icon"></slot>
              <slot name="topinput"></slot>
            </div>
            <span class="first-fields">
              <slot name="first-fields"></slot>
            </span>
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

  static styles = [
    css`
      #body {
        display: flex;
        border: 1px solid var(--color-border);
        border-radius: 0.5em;
        padding: 1em 0em;
        box-shadow: 0 0 20px 5px #eee;
      }

      #body > div {
        padding: 0 1em;
        display: flex;
        flex-direction: column;
        align-items: left;
        min-width: 10em;
      }

      #body > div:not(:first-child) {
        border-left: 1px solid var(--color-border-alt);
      }

      .row {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      type-elem-skeleton:not([minimize]) .row:first-child {
        margin-bottom: 0.5em;
        padding-bottom: 0.3em;
        border-bottom: 1px solid var(--color-border-alt);
      }

      #body > .main-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: left;
      }

      ::slotted([slot="keyword"]) {
        font-size: 1.3em;
        margin: 0 0.5em;
      }

      ::slotted([slot="topinput"]) {
        font-size: 1.1em;
      }

      :not(:host([noOptions])) .advanced {
        padding-right: 0.5em;
      }

      .advanced > div:first-child,
      .options > div:first-child {
        font-weight: bold;
        margin: 0.5em 0;
      }

      .advanced {
        width: 100%;
      }

      .first-fields {
        padding: 0.2em 0;
        margin-bottom: 0.3em;
        max-width: 30ch;
      }

      type-elem-skeleton[minimize] .first-fields,
      type-elem-skeleton[minimize] #body > .advanced,
      type-elem-skeleton[minimize] #body > .options,
      :host([noProperties]) #body > .advanced,
      :host([noOptions]) #body > .options {
        display: none;
      }

      :host([openForm]) ::slotted(*) {
        display: none;
      }

      :host([openForm]) ::slotted([slot="form"]) {
        display: flex;
        justify-content: center;
      }
    `,
  ] as CSSResultGroup;
}

/* Adds some useful helper functions and styles to inherit.
 * This class has little semantic purpose beyond reducing boilerplate.
 */
export abstract class BasicTypeElem extends LitElement {
  protected abstract icon: string;
  protected subtreeDisabled = false;
  protected renderIcon() {
    return html`<span slot="icon" class="material-symbols-outlined large"
      >${this.icon}</span
    >`;
  }

  @property({ type: Function, reflect: true })
  onDelete: (target?: EventTarget) => void = () => {};

  @query("type-elem")
  typeElem!: TypeElem;

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

      .inctype {
        padding: 0.3em 0.5em;
        border: 1px solid var(--clickable);
        font-weight: bold;
        border-radius: 0.3em;
        // background: var(--background-light-button);
        box-shadow: 0 0 20px 5px #eee;
      }

      .typename {
        font-weight: bold;
        padding: 0.1em 0.4em;
        margin-left: 0.5em;
        transform: scale(1.2);
      }

      .fieldlabel {
        color: var(--color-border-alt);
        font-weight: 700;
        padding-left: 0.4em;
      }

      :not(.checkwrapper) > .fieldlabel::after {
        content: ":";
      }

      .fieldvalue {
        max-width: 45ch;
        padding: 0.1em 0.4em;
        border-bottom: 1px solid var(--color-border-alt);
        opacity: 0.8;
        // border-radius: 0.3em;
      }

      .checkwrapper {
        display: flex;
      }

      .checkwrapper input {
        margin-right: 0.5em;
      }

      .shape-container {
        display: flex;
        flex-wrap: nowrap;
      }

      .shape-container > * {
        min-width: 1ch;
        padding: 0.1em 0.3em;
        border-right: 1px solid var(--color-border-alt);
      }

      .shape-container > *:last-child {
        border: 0;
      }

      .shape-container > * > div:first-child {
        font-weight: bold;
      }
    `,
  ] as CSSResultGroup;
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
        ${when(!this.lastBranch, () => html`<div class="vert"></div>`)}
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
        --upper-break: 5em;
        padding-left: 4em;
      }

      :host([disabled]) {
        opacity: 0.4;
      }

      :host .branchline > div {
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

      :host([disabled]) .branchelement:last-child > light-button {
        background: var(--background-color-alt);
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
        margin-top: 1em;
        padding-right: 0.5em;
      }

      ::slotted(div[slot="elems"]) {
        background: var(--color-border-alt);
        margin-top: var(--upper-break);
        height: 2px;
        width: 2ch;
      }
    `,
  ];
}
