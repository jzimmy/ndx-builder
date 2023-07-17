import { LitElement, html, css, CSSResultGroup } from "lit";
import {
  customElement,
  state,
  query,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { symbols } from "./styles";

// form manager
abstract class ComposedFormManager {
  abstract title: string;
  abstract nextButtonCallback(): void;
  abstract backButtonCallback(): void;
  abstract closeButtonCallback(): void;
  abstract draw(elem: Element): void;
}

abstract class ComposedFormElem<T> {
  abstract title: string;
  abstract onready(): boolean;
  abstract show: (value: T) => Element;
  // Ensure this function is idempotent and commutative with sequential form elems
  abstract transform: (oldT: T) => T;
}

// This test is not exhaustive, but it illustrates the idea behind form transforms.
// It should pass for any input!
export function testFormIdempotenceAndCommutativity<T>(
  input: T,
  transforms: ((_: T) => T)[]
) {
  const composedFormResult = transforms.reduce((acc, f) => f(acc), input);
  const reverseComposedDoubleTransformFormResult = [...transforms]
    .reverse()
    .reduce((acc, f) => f(f(acc)), input);
  return composedFormResult == reverseComposedDoubleTransformFormResult;
}

/**
 * Given a form manager, form elements and initial value
 * it will create a function to start the form
 * the returned function parameters are the callbacks for when the form is abandoned or completed
 */
export function composeForm<T>(
  parent: ComposedFormManager,
  initial: T,
  forms: ComposedFormElem<T>[]
): (onAbandon: () => void, onComplete: (val: T) => void) => void {
  function compose(
    forms: ComposedFormElem<T>[],
    value: T,
    back: () => void,
    complete: (_: T) => void
  ) {
    if (forms.length === 0) {
      complete(value);
    } else {
      const [form, ...rest] = forms;
      parent.title = form.title;
      parent.draw(form.show(value));
      parent.backButtonCallback = back;
      parent.nextButtonCallback = () => {
        compose(
          rest,
          form.transform(value),
          () => compose(forms, form.transform(value), back, complete),
          complete
        );
      };
    }
  }

  return (abandon: () => void, complete: (val: T) => void) => {
    parent.closeButtonCallback = () => {
      abandon();
      parent.closeButtonCallback = () => {};
    };
    compose(forms, initial, abandon, complete);
  };
}

@customElement("ndx-form-manager")
abstract class NdxFormManager
  extends LitElement
  implements ComposedFormManager
{
  nextButtonCallback(): void {
    throw new Error("Method not implemented.");
  }
  backButtonCallback(): void {
    throw new Error("Method not implemented.");
  }
  closeButtonCallback(): void {
    throw new Error("Method not implemented.");
  }
  draw(elem: Element): void {
    throw new Error("Method not implemented.");
  }

  @property()
  ready: boolean = false;

  render() {
    return html`<div id="titlerow">
        <h2>${this.title}</h2>
        <span class="material-symbols-outlined">close</span>
      </div>
      <div id="formbody"></div>
      <div id="bottomrow">
        <dark-button>Continue</dark-button>
      </div>`;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        border: 1px solid red;
        position: relative;
      }

      #titlerow,
      #bottomrow {
        display: flex;
        flex-direction: row;
        justify-content: center;
        position: relative;
        min-width: 600px;
        border: 1px solid blue;
      }

      #titlerow > span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(8em, -50%);
        cursor: pointer;
      }

      dark-button {
        transform: translate(13em, 0);
      }
    `,
  ] as CSSResultGroup;
}

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
