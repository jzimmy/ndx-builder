import { html, PropertyValueMap, css, CSSResultGroup } from "lit";
import { property, query } from "lit/decorators.js";
import { NdxInputElem } from "../inputs/abstract-input";
import { symbols } from "../styles";
import { TypeElemTemplate as TypeElem } from "./template";

export type Inherited<T> = {
  readonly inh: T;
  mine: T;
};

/* Adds some useful helper functions and styles to inherit.
 *
 * It is very important to note that it is an extension of NdxInputElem,
 * so interact with it ONLY through the fill(), clear(), and value() methods.
 */
export abstract class BasicTypeElem<T> extends NdxInputElem<T> {
  protected abstract data: T;
  protected abstract icon: string;
  protected subtreeDisabled = false;
  protected renderIcon() {
    return html`<span slot="icon" class="material-symbols-outlined large"
      >${this.icon}</span
    >`;
  }

  abstract value(): T;

  @property({ type: Function, reflect: true })
  onDelete: (target?: EventTarget) => void = () => {
    throw new Error(`On delete not implemented.`);
  };

  @property({ type: Function })
  onEdit: (target?: EventTarget) => void = () => {};

  @query("type-elem")
  typeElem!: TypeElem;

  // using firstUpdated because I don't want to overwrite the render function
  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (!this.typeElem) return;
    this.typeElem.onDelete = this.onDelete;
    this.typeElem.onEdit = this.onEdit;
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
        color: var(--clickable);
        font-weight: bold;
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
        border: 1px solid var(--color-border);
        font-weight: bold;
        border-radius: 0.3em;
        // background: var(--background-light-button);
      }

      .typename {
        font-weight: bold;
        padding: 0.1em 0.4em;
        margin-left: 0.5em;
        transform: scale(1.2);
      }

      .instancename {
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
