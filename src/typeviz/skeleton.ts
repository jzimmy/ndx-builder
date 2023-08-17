import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "../styles";
import { when } from "lit-html/directives/when.js";

/*
 * MINIMUM possible wrapper for a type elem vizualization,
 * contains:
 *  - minimize button
 *  - close button
 *  - slot for body
 *  - slot for subtree.
 *
 * Useful for creating **radically** new type constructor UIs.
 * Note that this isn't something that has happened yet.
 */

@customElement("type-elem-skeleton")
export class TypeElemSkeleton extends LitElement {
  @property({ type: Boolean, reflect: true })
  hideDeleteBtn: boolean = false;

  @property({ type: Function })
  onDelete = (target?: EventTarget) => {
    throw new Error(`On delete not implemented. ${target}`);
  };

  @property({ type: Boolean, reflect: true })
  hideEditBtn: boolean = false;

  @property({ type: Function })
  onEdit = () => {
    throw new Error(`On edit not implemented.`);
  };

  @property({ type: Boolean, reflect: true })
  minimize: boolean = true;

  @property({ type: Function })
  onToggleMinimize: (b: boolean) => void = (_) => {};

  @state()
  protected subtreeEnabled = false;

  private _handleMinimize() {
    this.minimize = !this.minimize;
    this.onToggleMinimize(this.minimize);
  }

  render() {
    return html`
      <div id="main">
        <div class="row">
          <span class="material-symbols-outlined" @click=${this._handleMinimize}
            >${this.minimize ? "expand_content" : "minimize"}</span
          >
          ${when(
            !this.minimize && !this.hideEditBtn,
            () => html`
              <span class="material-symbols-outlined" @click=${this.onEdit}
                >edit</span
              >
            `
          )}
          ${when(
            !this.hideDeleteBtn,
            () => html`
              <span
                class="material-symbols-outlined"
                @click=${(e: Event) => this.onDelete(e.target!)}
                >delete</span
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
