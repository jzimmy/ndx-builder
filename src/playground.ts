import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { symbols } from "./styles";

@customElement("playground-elems")
export class PlaygroundElems extends LitElement {
  @query("ndx-input")
  ndxInput!: NdxInput;

  @query("ndx-textarea")
  ndxTextarea!: NdxTextarea;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    document.addEventListener("keydown", (e) => {
      e.key === "Enter" ? console.log(this.ndxInput.value) : null;
    });
    document.addEventListener("keydown", (e) => {
      e.key === "Enter" ? console.log(this.ndxTextarea.value) : null;
    });
  }

  render() {
    return html`
      <ndx-input
        .info=${"This is the name of the type"}
        .validate=${(input: string) =>
          input.match(/[-]/g)
            ? ["ERROR", "Name cannot contain a special character"]
            : ["OK", input]}
        .label=${"New Type Name"}
        name="typename"
      ></ndx-input>
      <ndx-textarea></ndx-textarea>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    :host > * {
      margin: 1em;
    }

    ndx-input {
      font-size: 1em;
      width: 0px;
    }
  `;
}

@customElement("ndx-input")
export class NdxInput extends LitElement {
  @property({ type: String })
  label: string = "";

  @property({ type: String })
  name: string = "";

  @property({ type: String })
  info: string = "";

  @property({ type: Function })
  validate: (value: string) => ["OK", string] | ["ERROR", string] = () => [
    "OK",
    "",
  ];

  @state()
  errmsg: string = "";

  @query("input")
  input!: HTMLInputElement;

  get value() {
    const value = this.input.value;
    const [status, s] = this.validate(value);
    if (status === "ERROR") {
      this.errmsg = s;
      return null;
    }
    return s;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.addEventListener("click", () => this.input.focus());
  }

  render() {
    return html`
      <input
        @input=${() => (this.errmsg = "")}
        name=${this.name}
        type="text"
        class=${this.info ? "withinfo" : ""}
        placeholder=" "
      />
      <div class="placeholder">${this.label}</div>
      ${this.info
        ? html`<hover-info id="info">${this.info}</hover-info> `
        : html``}
      <div
        id="errmsg"
        aria-label=${this.errmsg}
        class=${this.errmsg ? "show" : ""}
      >
        ${this.errmsg}
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        padding: 0.5em;
        height: 2.2em;
        min-width: 10em;
        position: relative;
        display: flex;
        flex-direction: column;
        border: 2px solid red;
        --top-margin: 0.9em;
        --in-margin: 1em;
      }

      input {
        font-size: inherit;
        box-sizing: border-box;
        padding: 0.5em;
        border-radius: 0.5em;
        border: 1px solid var(--color-border-alt);
        background: inherit;
        z-index: 1;
        width: 100%;
        height: 100%;
      }

      input.withinfo {
        padding-right: 1.8em;
      }

      .placeholder {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: var(--in-margin);
        border-radius: 0.5em;
        color: var(--color-border-alt);
        background: inherit;
        z-index: 1;
        transition: 0.2s;
      }

      input:focus + .placeholder,
      input:not(:placeholder-shown) + .placeholder {
        background: var(--color-background-alt);
        font-size: 0.7em;
        padding: 0 0.2em;
        z-index: 1;
        transform: translateY(-150%);
        left: calc(1em + var(--in-margin));
      }

      input:focus {
        border: 1.5px solid var(--clickable);
        outline: none;
      }

      input:focus + .placeholder {
        color: var(--clickable);
      }

      #info {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: var(--in-margin);
        color: var(--color-border-alt);
      }

      #errmsg {
        visibility: hidden;
        position: absolute;
        left: 1em;
        top: 50%;
        transform: translateY(35%);
        border-radius: 0.5em;
        padding: 0 0.5em;
        display: block;
        background: #f44;
        color: #fff;
        opacity: 0.9;
        max-width: 75%;
      }

      #errmsg::before {
        --size: 0.5em;
        content: "";
        position: absolute;
        top: -10%;
        left: calc(10% - var(--size));
        width: 0;
        border-top: var(--size) solid #f44;
        border-left: var(--size) solid transparent;
        border-right: var(--size) solid transparent;
        transform: scaleY(-1);
      }

      #errmsg.show {
        visibility: visible;
   //   }
  `,
  ];
}

@customElement("ndx-textarea")
export class NdxTextarea extends LitElement {
  @query("textarea")
  textarea!: HTMLTextAreaElement;

  @state()
  required: boolean = true;

  @state()
  errmsg: string = "";

  @property()
  placeholder: string = "";

  render() {
    return html`
      <textarea
        @input=${() => (this.errmsg = "")}
        class=${this.errmsg ? "show" : ""}
        placeholder=" "
      ></textarea>
      <div id="placeholder">Description</div>
      <div id="errmsg" class=${this.errmsg ? "show" : ""}>${this.errmsg}</div>
    `;
  }

  get value(): string | null {
    if (!this.textarea.value.match(/[a-zA-Z0-9]/g)) {
      this.errmsg = "Required";
      return null;
    }
    return this.textarea.value;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.addEventListener("click", () => this.textarea.focus());
  }

  static styles = css`
    :host {
      display: flex;
      position: relative;
      font-size: 0.8em;
      padding: 0.6em;
    }

    textarea {
      font-size: inherit;
      font-family: inherit;
      padding: 0.6em;
      resize: vertical;
      min-height: 3em;
      background: var(--color-background-alt);
      border-radius: 0.3em;
      box-sizing: border-box;
      outline: 1px solid var(--color-border-alt);
      border: none;
    }

    #placeholder {
      position: absolute;
      font-size: 1.4em;
      top: 0.6em;
      left: 0.8em;
      transition: 0.2s;
      color: var(--color-border-alt);
      padding: 0 0.2em;
    }

    textarea:focus + #placeholder {
      color: var(--clickable);
    }

    textarea:focus + #placeholder,
    textarea:not(:placeholder-shown) + #placeholder {
      background: var(--color-background-alt);
      z-index: 1;
      transform: translate(0.8em, -0.8em);
      left: calc(1em + var(--in-margin));
      font-size: 1em;
    }

    textarea:focus,
    textarea.show:focus {
      outline: 1.5px solid var(--clickable);
    }

    textarea.show {
      outline: 2px solid #f44;
    }

    textarea:not(:placeholder-shown):not(:focus).show + #placeholder {
      color: #f44;
    }

    #errmsg {
      margin-left: 0.5em;
      visibility: hidden;
      color: #f44;
    }

    #errmsg.show {
      visibility: visible;
      position: absolute;
      top: 100%;
      transform: translateY(-30%);
    }

    #errmsg.show + textarea {
      border: 1px solid #f44;
    }
  `;
}

@customElement("hover-info")
export class HoverInfo extends LitElement {
  @property({ type: String })
  tip: string = "";

  render() {
    return html`
      <div class="tooltip"><slot></slot></div>
      <span class="material-symbols-outlined">info</span>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        font-size: inherit;
        position: relative;
        --tooltip-background: var(--clickable);
        cursor: pointer;
        z-index: 2;
        display: flex;
      }

      :host > * {
        transition: 0.3s;
      }

      :host > span {
        font-weight: 300;
        font-size: 1.2em;
        color: inherit;
      }

      :host(:hover) .tooltip {
        opacity: 0.95;
        visibility: visible;
      }

      :host(:hover) span {
        color: var(--clickable);
      }

      .tooltip {
        left: 50%;
        top: 50%;
        transform: translate(-50%, -150%);
        position: absolute;
        color: #fff;
        opacity: 0;
        visibility: hidden;
        cursor: default;
        font-size: 15px;
        padding: 0.5em;
        background: var(--tooltip-background);
        border-radius: 0.5em;
        min-width: 200px;
        max-width: 500px;
        z-index: 2;
      }

      .tooltip::before {
        --size: 0.5em;
        content: "";
        position: absolute;
        top: 98%;
        left: calc(50% - var(--size));
        width: 0;
        border-top: var(--size) solid var(--tooltip-background);
        border-left: var(--size) solid transparent;
        border-right: var(--size) solid transparent;
      }
    `,
  ];
}
