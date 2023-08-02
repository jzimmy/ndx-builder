import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, state, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { CPSForm, FormChain } from "./HOFS";
import {
  GroupType,
  DatasetType,
  Dtype,
  Defaultable,
  GroupTypeDef,
  DatasetTypeDef,
  Namespace,
} from "./nwb/spec";
import {
  GroupInctypeFormpageElem,
  DatasetInctypeFormpageElem,
} from "./inctype";
import { AxesFormpageElem, TypenameFormpageElem } from "./typedef";
import { NamespaceStartFormpageElem } from "./namespace";

export interface HasGroupIncType {
  neurodataTypeInc: GroupType;
}

export interface HasDatasetIncType {
  neurodataTypeInc: DatasetType;
}

export interface HasTypeNameAndDescription {
  neurodataTypeDef: string;
  doc: string;
}

export interface HasInstanceNameAndDescription {
  name: string;
  doc: string;
}

export interface HasAxes {
  shape: [number, string][];
  dtype: Dtype;
}

export interface HasDefaultName {
  name?: Defaultable<string>;
}

export interface HasRequired {
  required: boolean;
}

export const Initializers = {
  groupTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  } as GroupTypeDef,
  datasetTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    attributes: [],
    shape: [],
    dtype: ["PRIMITIVE", "f32"],
  } as DatasetTypeDef,
  namespace: {
    name: "",
    doc: "",
    version: [0, 1, 0],
    authors: [],
    typedefs: [],
  } as Namespace,
};

// form manager
@customElement("form-parent")
export class NdxFormParent extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = false;

  constructor() {
    super();

    this.triggerGroupBuilder = () => {};
    this.triggerDatasetBuilder = () => {};

    let namespaceBuilderForm = new FormChain<Namespace>(
      new NamespaceStartFormpageElem()
    ).withParent(this);

    let groupBuilderForm = new FormChain<GroupTypeDef>(
      new GroupInctypeFormpageElem()
    )
      .then(new TypenameFormpageElem())
      .withParent(this);

    let datasetBuilderForm = new FormChain<DatasetTypeDef>(
      new DatasetInctypeFormpageElem()
    )
      .then(new TypenameFormpageElem())
      .then(new AxesFormpageElem())
      .withParent(this);

    namespaceBuilderForm(
      Initializers.namespace,
      () => {
        throw new Error("Unreachable");
      },
      (ns) => {}
    );

    // this.triggerGroupBuilder = () => {
    //   this.formOpen = true;
    //   groupBuilderForm(
    //     Initializers.groupTypeDef,
    //     () => {
    //       this.formOpen = false;
    //       console.log("quit groupbuilder");
    //     },
    //     (res) => {
    //       this.formOpen = false;
    //       console.log("Built dataset", res);
    //     }
    //   );
    // };

    // this.triggerDatasetBuilder = () => {
    //   this.formOpen = true;
    //   this.updateComplete.then(() => {
    //     datasetBuilderForm(
    //       Initializers.datasetTypeDef,
    //       () => {
    //         this.formOpen = false;
    //         console.log("quit datasetbuilder");
    //       },
    //       (res) => {
    //         this.formOpen = false;
    //         console.log("Built dataset", res);
    //       }
    //     );
    //   });
    // };
  }

  static showAndFocus(
    elem: LitElement,
    visibility: boolean,
    firstInput?: HTMLElement
  ) {
    elem.slot = visibility ? "currForm" : "";
    if (firstInput) firstInput.focus();
  }

  private triggerGroupBuilder: () => void;
  private triggerDatasetBuilder: () => void;

  render() {
    return html`
      ${when(
        !this.formOpen,
        () => html`
          <input
            type="button"
            value="new_group"
            @click=${this.triggerGroupBuilder}
          />
          <input
            type="button"
            value="new_dataset"
            @click=${this.triggerDatasetBuilder}
          />
        `
      )}
      <form>
        ${when(this.formOpen, () => html` <slot name="currForm"></slot> `)}
      </form>
    `;
  }

  static styles = [
    css`
      :host {
      }
    `,
  ];
}

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

  @state()
  progressSteps: string[] = [];

  @state()
  currProgress: number = -1;

  drawProgressBar = (progressSteps: string[], curr: number) => {
    this.progressSteps = progressSteps;
    this.currProgress = curr;
  };

  onValidateCallback = (ready: boolean) => {
    this.continueButton.disabled = !ready;
  };

  showAndFocus(show: boolean): void {
    this.slot = show ? "currForm" : "";
    this.firstInput.focus();
  }

  @query("input[type=button]")
  continueButton!: HTMLInputElement;

  _selfValidate() {
    this.onValidateCallback(this.isValid());
  }

  render() {
    return html`
      <div class="progress-bar">
        <span class="material-symbols-outlined back_arrow" @click=${this.back}
          >arrow_back</span
        >
        ${map(
          this.progressSteps,
          (step, i) =>
            html`<h3
              class=${classMap({
                active: i == this.currProgress,
                completed: i < this.currProgress,
              })}
            >
              ${step}
            </h3>`
        )}
        <span class="material-symbols-outlined close_button" @click=${this.quit}
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
