import { TemplateResult, html, css, CSSResultGroup, LitElement } from "lit";
import { state, query } from "lit/decorators.js";
import { CPSForm, ProgressState } from "./HOFS";
import { symbols } from "./styles";
import { FormStepBar } from "./basic-elems";
import { styleMap } from "lit/directives/style-map.js";

/* BasicFormPage
 * A good template a for a basic input 'quiz' style form,
 * Features, a current step bar, a close button, a back button, and a continue button
 *
 * Developer responsibilities for instances:
 * define isValid() method
 * define body() method
 * add this._selfValidate to all inputs
 */
export abstract class BasicFormPage<T> extends CPSForm<T> {
  abstract formTitle: string;
  ready: boolean = false;
  abstract isValid(): boolean;
  abstract body(): TemplateResult<1>;
  abstract get firstInput(): HTMLElement;

  hideQuit: boolean = false;

  @state()
  progressSteps: string[] = [];

  @state()
  currProgress: number = -1;

  drawProgressBar(progress?: ProgressState) {
    this.stepBar.setProgressState(progress);
  }

  onValidateCallback = (ready: boolean) => {
    this.continueButton.disabled = !ready;
  };

  showAndFocus(show: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, show, this.firstInput);
  }

  @query("input[name=continuebutton]")
  continueButton!: HTMLInputElement;

  @query("step-bar")
  private stepBar!: FormStepBar;

  _selfValidate() {
    this.onValidateCallback(this.isValid());
  }

  render() {
    return html`
      <div class="progress-bar">
        <span class="material-symbols-outlined back_arrow" @click=${this.back}
          >arrow_back</span
        >
        <step-bar></step-bar>
        <span
          style="${styleMap({
      visibility: this.hideQuit ? "hidden" : "visible",
    })}"
          class="material-symbols-outlined close_button"
          @click=${this.quit}
          >close</span
        >
      </div>
      <div>
        <h2>${this.formTitle}</h2>
      </div>
      <div class="body">${this.body()}</div>
      <div>
        <input
          type="button"
          .disabled=${!this.ready}
          name="continuebutton"
          value="Continue"
          @click=${() => {
        if (!this.isValid()) {
          this.onValidateCallback(false);
        } else {
          this.next();
        }
      }}
        />
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      * {
        border: 1px solid red;
      }

      :host {
        margin: auto;
      }

      :host > div:not(.body) {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > div:last-child > input[type="button"] {
        margin-left: auto;
      }

      .progress-bar {
        width: 100%;
      }

      .progress-bar > span:first-child {
        margin-right: auto;
      }

      .progress-bar > span:last-child {
        margin-left: auto;
      }

      .progress-bar > h3 {
        padding: 0 0.5em;
        text-decoration: underline;
      }

      .progress-bar > h3:not(.completed):not(.active) {
        opacity: 0.5;
        text-decoration: none;
      }

      .progress-bar > h3.active {
        color: var(--clickable);
      }

      .body {
        display: flex;
        flex-direction: column;
      }
    `,
  ] as CSSResultGroup;
}

export function NDXBuilderDefaultShowAndFocus(
  elem: LitElement,
  visibility: boolean,
  firstInput?: HTMLElement
) {
  elem.slot = visibility ? "currForm" : "";
  if (firstInput) firstInput.focus();
}
