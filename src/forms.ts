import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import {
  customElement,
  state,
  query,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { symbols } from "./styles";

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
  ` as CSSResultGroup;
}

@customElement("default-name-form")
export class DefaultNameFormElem extends DefaultNameElem {
  render() {
    return html`
        <h3>Optional</h3>
        <div>The default name will ...</div>
        <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <div>When another types uses this type do this</div>
        <label class="checkbox" for="fixed-name">
            <input name="fixed-name" type="checkbox"></input>Fixed name
            <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
        </label>
    `;
  }

  static styles = [
    super.styles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        color: var(--color-text);
      }
    `,
  ];
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

abstract class ContinuationParent extends LitElement {
  abstract draw(elem: LitElement): void;
}

abstract class ContinuationElem<T> extends LitElement {
  abstract nextButtonAction(): void;
  abstract backButtonAction(): void;
  abstract updateValue: (oldT: T) => T;
}

function composeForm<T>(
  parent: ContinuationParent,
  initial: T,
  fail: () => void,
  succ: (val: T) => void,
  forms: ContinuationElem<T>[]
): () => void {
  f.backButtonAction = fail;
  for (const f of forms.reverse()) {
    const newsucc = (value: T) => {
      parent.draw(f);
      f.backButtonAction = () => succ(value);
      const newT = f.updateValue(value);
      succ(newT);
    };
    const succ = newsucc;
    f.nextButtonAction = () => succ(initial);
  }

  return () => succ(initial);
}
