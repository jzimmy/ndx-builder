import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { TypeElemSkeleton } from "./skeleton";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { CompoundDtype, Dtype, NWBType, Shape } from "../nwb/spec";
import { symbols } from "../styles";
import "./skeleton";
import { choose } from "lit/directives/choose.js";

/* Wrapper element for a type elem, contains the body and subtree contents.
 * Uses a template of slots to type constructor UIs very easy to build and modify.
 */

@customElement("type-elem")
export class TypeElemTemplate extends LitElement {
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
  hideDeleteBtn: boolean = false;

  @property({ type: Function })
  onToggleMinimize = (_: boolean) => {};

  @property({ type: Boolean, reflect: true })
  hideEditBtn: boolean = false;

  @property({ type: Function })
  onEdit: () => void = () => {
    throw new Error(`On edit not implemented.`);
  };

  @query("type-elem-skeleton")
  typeElemSkeleton!: TypeElemSkeleton;

  get minimized(): boolean {
    return this.typeElemSkeleton.minimize;
  }

  render() {
    return html`
      <type-elem-skeleton
        .hideDeleteBtn=${this.hideDeleteBtn}
        .hideEditBtn=${this.hideEditBtn}
        .onDelete=${this.onDelete}
        .onEdit=${this.onEdit}
        .onToggleMinimize=${this.onToggleMinimize}
      >
        <div id="body" slot="body">
          <div class="main-section">
            <div class="topinput-wrapper">
              <slot name="topinput"></slot>
            </div>
            <div class="row">
              <slot name="bottominput"></slot>
            </div>
            <span class="first-fields">
              <slot name="first-fields"></slot>
            </span>
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

      type-elem-skeleton:not([minimize]) .topinput-wrapper {
        border-bottom: 1px solid var(--color-border-alt);
        padding-bottom: 0.5em;
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

@customElement("type-header")
export class TypeHeader extends LitElement {
  @property({ type: String })
  icon: string = "";

  @property({ type: String })
  name: string = "";

  @property({ type: String })
  keyword: string = "";

  @property({ type: String })
  base: string = "";

  @property({ type: Boolean, reflect: true })
  typedef: boolean = false;

  render() {
    return html`
      <div>
        <span class="material-symbols-outlined">${this.icon}</span>
        ${this.name
          ? html`<div class="name">${this.name}</div>`
          : html`
              <span class="keyword">${this.keyword}</span>
              <div class="inctype">${this.base}</div>
            `}
      </div>
      ${when(
        this.name !== "" && (this.keyword || this.base),
        () => html`
          <div class="bottomrow">
            <span class="keyword">${this.keyword}</span>
            <div class="inctype">${this.base}</div>
          </div>
        `
      )}
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: block;
        // border: 1px solid red;
      }

      span.material-symbols-outlined {
        font-size: 2em;
      }

      :host > div {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
      }

      :host([typedef]) .name {
        font-weight: bold;
        padding: 0.1em 0.4em;
      }

      .name {
        font-size: 1.3em;
        padding: 0.1em 0.4em;
      }

      .keyword {
        font-size: 1.2em;
        margin: 0 0.5em;
        color: var(--clickable);
        font-weight: bold;
      }

      .inctype {
        padding: 0.3em 0.5em;
        border: 1px solid var(--color-border);
        font-weight: bold;
        border-radius: 0.3em;
      }

      .bottomrow > .keyword {
        margin-left: auto;
      }
    `,
  ];
}

@customElement("labeled-field-value")
export class LabeledFieldValue extends LitElement {
  @property({ type: String })
  label: string = "";
  @property()
  value: string = "";
  render() {
    return html`
      <div class="label">${this.label}:</div>
      <div class="value">${this.value}<slot></slot></div>
    `;
  }

  static styles = css`
    .label {
      color: var(--color-border-alt);
      font-weight: 700;
      padding-left: 0.4em;
    }
    .value {
      max-width: 45ch;
      padding: 0.1em 0.4em;
      border-bottom: 1px solid var(--color-border-alt);
      opacity: 0.8;
    }
  ` as CSSResultGroup;
}

@customElement("labeled-boolean-field")
export class LabeledBoolField extends LitElement {
  @property({ type: Boolean })
  checked = false;

  @property({ type: String })
  label = "";
  render() {
    return html`
      <input type="checkbox" .checked=${this.checked} />
      <div class="label">${this.label}</div>
    `;
  }

  static styles = [
    LabeledFieldValue.styles,
    css`
      :host {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
      }

      input {
        pointer-events: none;
        focus: none;
      }
    `,
  ];
}

@customElement("shape-viz")
export class ShapeVisualizer extends LitElement {
  renderShape(shapes: Shape[]): TemplateResult<1> {
    if (shapes.length == 0) return html`<div>Not specified</div>`;
    const renderOneShape = (shape: Shape, i: number) =>
      shape.length > 0
        ? html`
            ${when(i > 0, () => "OR")}
            <div class="shape-container">
              ${shape.map(
                ([k, v]) => html`<div>
                  <div>${k == "None" ? "Any" : k}</div>
                  <div>${v}</div>
                </div> `
              )}
            </div>
          `
        : html``;
    return html` ${map(shapes, renderOneShape)} `;
  }
  @property()
  label = "Axes";

  @property()
  shape: Shape[] = [];

  @property()
  render() {
    return html`
      <labeled-field-value .label=${this.label}>
        ${this.renderShape(this.shape)}
      </labeled-field-value>
    `;
  }

  static styles = [
    css`
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
  ];
}

@customElement("dtype-viz")
export class DtypeVisualizer extends LitElement {
  @property()
  dtype: Dtype = ["PRIMITIVE", "Any"];

  render() {
    return html`${choose(this.dtype[0], [
      ["PRIMITIVE", () => html`<div>${this.dtype[1]}</div>`],
      [
        "REFSPEC",
        () => {
          let [_, [refKind, refType]] = this.dtype as ["REFSPEC", NWBType];
          return html` <span class="material-symbols-outlined">
              ${refKind == "GROUP" ? "folder" : "dataset"}
            </span>
            <div>${refType[1]?.neurodataTypeDef}</div>`;
        },
      ],
      [
        "COMPOUND",
        () => html` <div class="compound-wrapper">
          ${map(
            this.dtype[1] as CompoundDtype[],
            ({ dtype }) =>
              html`
                <div>
                  ${when(
                    dtype[0] == "PRIMITIVE",
                    () => html`<div>${dtype[1]}</div>`,
                    () =>
                      html`<div>
                        ${(dtype[1] as NWBType)[1][1]?.neurodataTypeDef}
                      </div>`
                  )}
                </div>
              `
          )}
        </div>`,
      ],
    ])}`;
  }
}
