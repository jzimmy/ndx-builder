import { LitElement, html, css } from "lit";
import { customElement, state, query } from "lit/decorators.js";

@customElement("default-name")
export class DefaultNameElem extends LitElement {
  render() {
    return html`
        <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <label class="checkbox" for="fixed-name">
            <input name="fixed-name" type="checkbox"></input>Fixed name
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
  `;
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
