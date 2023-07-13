import {
  LitElement,
  html,
  css,
  CSSResultGroup,
  TemplateResult,
  PropertyValueMap,
} from "lit";
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";

@customElement("type-elem-skeleton")
export class TypeElem extends LitElement {
  @property({ type: Boolean, reflect: true })
  minimize: boolean = true;

  @state()
  protected subtreeEnabled = false;

  @property({ type: Function })
  onDelete = (target: EventTarget | null) => {
    throw new Error(`On delete not implemented. ${target}`);
  };

  @queryAssignedElements({ slot: "body" })
  body!: HTMLElement[];

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
              this.onDelete(e.target);
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
        background: var(--background-light-hover);
        padding: 0.05em;
        border-radius: 0.2em;
      }
    `,
  ] as CSSResultGroup;
}

@customElement("type-elem")
export class TypedefElem extends LitElement {
  render() {
    return html`
      <type-elem-skeleton>
        <div id="body" slot="body">
          <div>
            <div class="row">
              <slot class="icon" name="icon"></slot>
              <slot name="keyword"></slot>
              <slot name="topinput"></slot>
            </div>
            <slot name="first-fields"></slot>
          </div>
          <slot name="advanced-fields"></slot>
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
      padding: 0.5em;
      box-shadow: 0 0 20px 5px #eee;
    }

    .row {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.5em;
    }

    ::slotted([slot="keyword"]) {
      font-size: 1.3em;
      margin: 0 0.5em;
    }

    ::slotted([slot="topinput"]) {
      font-size: 1.1em;
    }

    ::slotted([slot="first-fields"]) {
      margin: 0 0.5em;
    }

    ::slotted([slot="advanced-fields"]) {
      margin-left: 0.5em;
      padding-left: 0.5em;
      border-left: 1px solid var(--color-border-alt);
    }

    type-elem-skeleton[minimize] ::slotted([slot="advanced-fields"]) {
      display: none;
    }
  `;
}

export abstract class BasicTypeElem extends LitElement {
  protected renderSubtree(): TemplateResult<1> {
    return html``;
  }
  protected abstract renderAdvancedFields(): TemplateResult<1> | null;
  protected renderOptionalFields(): TemplateResult<1> | null {
    return null;
  }

  private _renderFields(fields: TemplateResult<1> | null) {
    return fields
      ? html`
          <div slot="advanced-fields">
            <div>Properties:</div>
            ${fields}
          </div>
        `
      : html``;
  }

  protected abstract renderTopInput(): TemplateResult<1>;

  keyword: "of" | "to" | "extends" | null = null;

  render() {
    return html`<type-elem slot="body">
        <span slot="icon" class="material-symbols-outlined large">link</span>
        ${this.renderTopInput()}
        <div slot="first-fields">
          <ndx-textarea></ndx-textarea>
        </div>
        ${this._renderFields(this.renderAdvancedFields())}
        ${this._renderFields(this.renderOptionalFields())}
      </type-elem>
      <span slot="subtree">${this.renderSubtree()}</span>`;
  }
}

@customElement("link-dec-elem")
export class LinkDecElem extends LitElement {
  @state()
  namedNotQuantity = false;

  render() {
    return html`
      <type-elem>
        <span slot="icon" class="material-symbols-outlined large">link</span>
        <span slot="keyword">to</span>
        <light-button slot="topinput">Pick a target</light-button>
        <div slot="first-fields">
          <ndx-textarea></ndx-textarea>
        </div>
        <div slot="advanced-fields">
          <div>Properties:</div>
          <label
            ><input
              @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
              .checked=${this.namedNotQuantity}
              type="checkbox"
            />Named instance</label
          >
          ${this.namedNotQuantity
            ? html` <ndx-input label="Instance name"></ndx-input> `
            : html`<ndx-input label="Quantity"></ndx-input>`}
        </div>
      </type-elem>
    `;
  }

  static styles = [
    symbols,
    css`
      div[slot="advanced-fields"] > div:first-child {
        padding: 0.5em;
        padding-bottom: 0;
      }
    `,
  ];
}

@customElement("attrib-dec-elem")
export class AttribDecElem extends LitElement {
  @state()
  namedNotQuantity = false;

  render() {
    return html`
      <type-elem>
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
        <ndx-input slot="topinput" label="Attribute name"></ndx-input>
        <div slot="first-fields">
          <ndx-textarea></ndx-textarea>
        </div>
        <div slot="advanced-fields">
          <div>Properties:</div>
          <label
            ><input
              @input=${() => (this.namedNotQuantity = !this.namedNotQuantity)}
              .checked=${this.namedNotQuantity}
              type="checkbox"
            />Named instance</label
          >
          ${this.namedNotQuantity
            ? html` <ndx-input label="Instance name"></ndx-input> `
            : html`<ndx-input label="Quantity"></ndx-input>`}
        </div>
      </type-elem>
    `;
  }

  static styles = [
    symbols,
    css`
      div[slot="advanced-fields"] > div:first-child {
        padding: 0.5em;
        padding-bottom: 0;
      }

      label,
      label > input[type="checkbox"] {
        margin: 0 0.5em;
      }
    `,
  ];
}
