import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, state, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { DarkButton } from "./playground";
import { symbols } from "./styles";

// form manager
abstract class ComposedFormManager extends LitElement {
  abstract titleText: string;
  abstract ready: boolean;
  abstract hideBackButton(set: boolean): void;
  // these functions will be set at triggertime
  nextButtonCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  backButtonCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  closeButtonCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  // render the element in the form body slot
  abstract renderForm(elem: Element, title: string): void;
}

export abstract class ComposedFormElem<T> extends LitElement {
  // set title
  abstract title: string;
  // all fields are valid
  abstract isValid: () => boolean;
  // used by the form manager to set visual behaviour
  validate = () => {
    return;
  };
  abstract showWithValues: (value: T) => Element;
  // Applies the modifications requested by the form
  // Ensure this function is idempotent and commutative with sequential form elems
  abstract transform: (oldT: T) => T;
}

// This function is for documentation purposes only. The build system will remove it anyway.
//
// This test is not exhaustive, but it illustrates the idea behind form transforms.
// It should pass for any input!
// @ts-ignore
function __testFormIdempotenceAndCommutativity<T>(
  input: T,
  transforms: ((_: T) => T)[]
) {
  const composedFormResult = transforms.reduce((acc, f) => f(acc), input);
  const reverseComposedDoubleTransformFormResult = [...transforms]
    .reverse()
    .reduce((acc, f) => f(f(acc)), input);
  return composedFormResult == reverseComposedDoubleTransformFormResult;
}

type TriggerFunction<T> = (
  onAbandon: () => void,
  onComplete: (val: T) => void
) => void;

/**
 * Given a form manager, form elements and initial value
 * it will return a new function to trigger the form.
 * The trigger function parameters are the callbacks for when the form is abandoned or completed
 */
export function composeForm<T>(
  parent: ComposedFormManager,
  initial: T,
  forms: ComposedFormElem<T>[]
): TriggerFunction<T> {
  function composeInner(
    currentFormIdx: number,
    value: T,
    onBackCallback: () => void,
    onCompleteCallback: (_: T) => void
  ) {
    if (forms.length === currentFormIdx) {
      onCompleteCallback(value);
    } else {
      const thisForm = forms[currentFormIdx];
      parent.hideBackButton(currentFormIdx == 0);
      parent.renderForm(thisForm.showWithValues(value), thisForm.title);
      thisForm.validate = () => {
        parent.ready = thisForm.isValid();
      };
      parent.backButtonCallback = onBackCallback;
      // when next button is hit, recursively show the rest of the forms
      parent.nextButtonCallback = () => {
        composeInner(
          currentFormIdx + 1,
          thisForm.transform(value),
          // In the next form, the back button should backtrack to this form.
          // Therefore composeInner has same arguments as the function definition,
          // (except for the value, which maintains the progress made by this form)
          () =>
            composeInner(
              currentFormIdx,
              thisForm.transform(value),
              onBackCallback,
              onCompleteCallback
            ),
          onCompleteCallback
        );
      };
    }
  }

  return (onAbandon: () => void, onComplete: (val: T) => void) => {
    parent.closeButtonCallback = () => {
      onAbandon();
      parent.closeButtonCallback = () => {};
    };
    composeInner(0, initial, onAbandon, onComplete);
  };
}

// CATASTROPHIC FAILURE IF SLOTTED CHILDREN DON'T IMPLEMENT ComposedFormElem
@customElement("ndx-form-manager")
export class NdxFormManager extends ComposedFormManager {
  hideBackButton(set: boolean): void {
    this.backButtonHidden = set;
  }

  @state()
  private backButtonHidden = false;

  @property()
  ready: boolean = false;

  @state()
  titleText: string = "hmmm this is a test";

  @query("dark-button")
  continueButton!: DarkButton;

  renderForm(elem: Element, title: string): void {
    this.titleText = title;
    const lastChild = this.lastChild;
    if (lastChild) this.removeChild(lastChild);

    this.appendChild(elem);
    elem.slot = "dangerouslyImplementsComposedFormElem";
  }

  @property()
  onclose: () => void = () => {
    throw new Error("onclose not been set, probably didn't use composeForm");
  };

  render() {
    return html`<div>
        <span
          class="material-symbols-outlined"
          @click=${this.closeButtonCallback}
          >close</span
        >
      </div>
      <div>
        <div id="titlerow">
          <span
            class=${classMap({
              "material-symbols-outlined": true,
              hidden: this.backButtonHidden,
            })}
            @click=${this.backButtonCallback}
            >arrow_back</span
          >
          <h2>${this.titleText}</h2>
        </div>
        <div id="formbody">
          <slot name="dangerouslyImplementsComposedFormElem"></slot>
        </div>
        <div id="bottomrow">
          <dark-button
            .disabled=${!this.ready}
            @click=${this.nextButtonCallback}
            >Continue</dark-button
          >
        </div>
      </div> `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        position: relative;
      }

      :host div {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > div:last-child {
        border-radius: 0.5em;
        padding: 1em;
        flex-direction: column;
        background: var(--color-background-alt);
        z-index: 1;
        border: 1px solid var(--color-border);
        box-shadow: 0 0 20px 5px #eee;
      }

      #titlerow,
      #bottomrow {
        justify-content: center;
        position: relative;
        min-width: 600px;
      }

      #titlerow > h1 {
        margin: 0 auto;
      }

      span.material-symbols-outlined {
        padding: 0.5em;
        font-size: 2em;
        cursor: pointer;
      }

      span.material-symbols-outlined.hidden {
        display: none;
      }

      :host > div:first-child span {
        margin-left: auto;
      }

      dark-button {
        margin-left: auto;
        margin-right: 1em;
      }

      ::slotted(*) {
        transition: 0.3s;
      }
    `,
  ] as CSSResultGroup;
}
