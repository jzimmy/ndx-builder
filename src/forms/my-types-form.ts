import { css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import {
  DatasetDec,
  Dtype,
  GroupDec,
  LinkDec,
  Namespace,
  TypeDef,
} from "../nwb/spec";
import { ProgressState } from "../logic/cps-form";
import { assertNever } from "../utils";
import { CPSForm } from "../logic/cps-form";
import { NDXBuilderDefaultShowAndFocus } from "..";
import { FormStepBar, iconOf } from "../basic-elems";
import { Initializers } from "../nwb/spec-defaults";
import { when } from "lit/directives/when.js";
import { symbols } from "../styles";
import { classMap } from "lit/directives/class-map.js";
import { Trigger } from "../logic/hofs";

@customElement("namespace-types-form")
export class NamespaceMyTypesForm extends CPSForm<Namespace> {
  constructor(
    typeBuilderTrigger: Trigger<TypeDef>,
    typeEditorTrigger: Trigger<TypeDef>
  ) {
    super();
    this.triggerTypeBuilder = () => {
      this.showAndFocus(false);
      typeBuilderTrigger(
        ["GROUP", Initializers.groupTypeDef],
        () => this.showAndFocus(true),
        (v) => {
          this.showAndFocus(true);
          this.types = [...this.types, v];
        }
      );
    };

    this.triggerTypeEditor = (initializer, index) => {
      this.showAndFocus(false);
      typeEditorTrigger(
        initializer,
        () => this.showAndFocus(true),
        (v) => {
          this.showAndFocus(true);
          this.types = [
            ...this.types.slice(0, index),
            v,
            ...this.types.slice(index + 1),
          ];
        }
      );
    };
  }

  @property()
  types: TypeDef[] = [];

  @query("step-bar")
  stepBar!: FormStepBar;

  fill(val: Namespace, progress?: ProgressState): void {
    this.stepBar.setProgressState(progress);
    if (val.typedefs.length !== 0) this.types = [...val.typedefs];
  }

  transform(val: Namespace): Namespace {
    val.typedefs = [...this.types];
    return val;
  }

  clear(): void {
    this.types = [];
  }

  @property({ type: Function })
  triggerTypeBuilder: () => void = () => {};

  @property({ type: Function })
  triggerTypeEditor: (initializer: TypeDef, index: number) => void = () => {};

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  get ready(): boolean {
    return this.types.length === 0;
  }

  @state()
  selected: number = -1;

  private handleDelete(index: number) {
    let tyname = this.types[index][1].neurodataTypeDef;
    for (let type of this.types) {
      if (referenceCollision(type, tyname)) {
        alert(
          `Cannot delete type ${tyname} that is referenced in somewhere in other type ${type[1].neurodataTypeDef}.\nEdit ${type[1].neurodataTypeDef} to remove the reference first.`
        );
        return;
      }
    }
    this.types = [
      ...this.types.slice(0, index),
      ...this.types.slice(index + 1),
    ];
  }

  render() {
    return html`
      <back-or-quit-bar
        .back=${() => this.back()}
        .hideQuit=${true}
      >
        <step-bar></step-bar>
      </back-or-quit-bar>
      <div class="body">
        <div class="typesbar">
          <h2>My Types</h2>
          <hr />
          <ul>
            ${when(
              this.types.length === 0,
              () => html`<li class="nonemsg">No types yet</li>`
            )}
        ${map(
          this.types,
          ([kind, ty], i) => html` <li
            class=${classMap({ selected: i == this.selected })}
            @click=${() => (this.selected = i)}
          >
            <span class="material-symbols-outlined">${iconOf(kind)}</span>
            ${ty.neurodataTypeDef}
          </li>`
        )}
          </ul>
        </div>
        <div class="sidespace">
            ${when(
              this.selected !== -1,
              () => html`
                <div class="inspector">
                  <span
                    class="material-symbols-outlined"
                    id="close"
                    @click=${() => (this.selected = -1)}
                    >close</span
                  >
                  <span
                    class="material-symbols-outlined"
                    @click=${() =>
                      this.triggerTypeEditor(
                        this.types[this.selected],
                        this.selected
                      )}
                    >edit</span
                  >
                  <span
                    class="material-symbols-outlined"
                    @click=${() => this.handleDelete(this.selected)}
                    >delete</span
                  >
                </div>
                <div class="preview">
                  <h2>${this.types[this.selected][1].neurodataTypeDef}</h2>
                  <div class="extends">
                    <div class="keyword">extends</div>
                    <div class="inctype">
                      ${this.types[this.selected][1].neurodataTypeInc[1]
                        ?.neurodataTypeDef || "None"}
                    </div>
                  </div>
                  <div class="description">
                    ${this.types[this.selected][1].doc}
                  </div>
                </div>
              `,
              () => html`<light-button @click=${() => this.triggerTypeBuilder()}
                >Create a type &nbsp;
                <span class="material-symbols-outlined">add</span></light-button
              >`
            )}
        </div>
      </div>
      <continue-bar
        type="button"
        .disabled=${this.ready}
        value="continue"
        .continue=${() => this.next()}
      />
      </continue-bar>
    `;
  }

  static styles = [
    symbols,
    css`
      :host,
      .typesbar {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1em;
      }

      .typesbar {
        flex: 0 0 auto;
        border-right: 1px solid var(--color-border-alt);
      }

      :host * {
        transition: 0.2s;
      }

      .body {
        display: flex;
        margin: 2em;
      }

      .sidespace {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
        min-width: 20em;
        padding: 2em;
      }

      h2 {
        margin: 0;
      }

      hr {
        position: relative;
        border: 0.5px solid var(--color-border-alt);
        width: 100%;
      }

      ul {
        margin: 0;
        padding: 0em;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      li {
        list-style: none;
        border-bottom: 1px solid var(--color-border-alt);
        padding: 0.2em;
        margin: 0.3em;
        cursor: pointer;
      }

      li,
      li > span.material-symbols-outlined {
        font-size: 1.5em;
      }

      li:hover {
        color: var(--clickable);
        border-color: var(--clickable);
      }

      li.selected {
        border-bottom: 3px solid var(--clickable-hover);
        color: var(--clickable-hover);
      }

      li.nonemsg {
        opacity: 0.5;
        border: none;
        margin: 1em 0;
      }

      .inspector {
        display: flex;
        width: 100%;
      }

      .inspector > span {
        margin: 0.25em;
        padding: 0.1em;
        padding-bottom: 0.3em;
        cursor: pointer;
        transition: 0.2s;
        border-radius: 0.2em;
      }

      .inspector > span.material-symbols-outlined:hover:not(:last-child) {
        color: var(--clickable);
        padding: 0.2em;
        background-color: var(--background-light-button);
      }

      .inspector > span.material-symbols-outlined:hover {
        padding: 0.2em;
        background-color: var(--background-danger);
      }

      .inspector > span#close {
        margin-left: auto;
      }

      .inspector > span:last-child {
        margin-left: 1em;
      }

      .preview {
        border: 1px solid var(--color-border-alt);
        border-radius: 0.5em;
        padding: 1em;
        background: var(--color-background);
        // box-shadow: 0 0 0.5em var(--color-border-alt);
      }

      .extends {
        display: flex;
        font-size: 1.2em;
        align-items: center;
        border-bottom: 1px solid var(--color-border-alt);
        padding-bottom: 0.5em;
      }

      .keyword {
        margin-left: auto;
        color: var(--clickable);
        font-weight: bold;
      }

      .inctype {
        margin-left: 0.5em;
        border: 1px solid var(--color-border-alt);
        padding: 0.1em 0.3em;
      }
    `,
  ];
}
// recursively check if a typedef contains a reference to another type name
function referenceCollision(type: TypeDef, name: string): boolean {
  // nested function to check groups
  function referenceCollisionGroupDec(type: GroupDec, name: string): boolean {
    switch (type[0]) {
      case "INC":
        return type[1].neurodataTypeInc[1]?.neurodataTypeDef === name;
      case "ANONYMOUS":
        return (
          type[1].groups.some((g) => referenceCollisionGroupDec(g, name)) ||
          type[1].datasets.some((d) => referenceCollisionDatasetDec(d, name)) ||
          type[1].links.some((l) => referenceCollisionLinkDec(l, name)) ||
          type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
        );
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check datasets
  function referenceCollisionDatasetDec(
    type: DatasetDec,
    name: string
  ): boolean {
    switch (type[0]) {
      case "INC":
        return type[1].neurodataTypeInc[1]?.neurodataTypeDef === name;
      case "ANONYMOUS":
        return (
          referenceCollisionDtype(type[1].dtype, name) ||
          type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
        );
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check dtypes
  function referenceCollisionDtype(type: Dtype, name: string): boolean {
    switch (type[0]) {
      case "PRIMITIVE":
        return false;
      case "COMPOUND":
        return type[1].some((f) => referenceCollisionDtype(f.dtype, name));
      case "REFSPEC":
        return type[1][1][1]?.neurodataTypeDef === name;
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check links
  function referenceCollisionLinkDec(type: LinkDec, name: string): boolean {
    return type.targetType[1][1]?.neurodataTypeDef === name;
  }

  // now we are ready to check the top level typedef
  switch (type[0]) {
    case "GROUP":
      return (
        type[1].neurodataTypeInc[1]?.neurodataTypeDef === name ||
        type[1].groups.some((g) => referenceCollisionGroupDec(g, name)) ||
        type[1].datasets.some((d) => referenceCollisionDatasetDec(d, name))
      );
    case "DATASET":
      return (
        type[1].neurodataTypeInc[1]?.neurodataTypeDef === name ||
        referenceCollisionDtype(type[1].dtype, name) ||
        type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
      );
    default:
      assertNever(type[0]);
  }
}
