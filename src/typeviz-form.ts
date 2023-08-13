import { customElement, query, state } from "lit/decorators.js";
import { NDXBuilderDefaultShowAndFocus } from "./basic-form";
import {
  AttributeDec,
  DatasetDec,
  DatasetTypeDef,
  GroupDec,
  GroupTypeDef,
  LinkDec,
} from "./nwb/spec";
import { TemplateResult, html } from "lit";
import { CPSForm, CPSFormController, ProgressState, Trigger } from "./hofs";
import { Initializers } from "./nwb/spec-defaults";
import "./typeviz";
import { FormStepBar } from "./basic-elems";

function subform<T>(prev: CPSFormController, trigger: Trigger<T>): Trigger<T> {
  return (i, a, c) => {
    prev.showAndFocus(false);
    trigger(
      i,
      () => {
        prev.showAndFocus(true);
        a();
      },
      (v) => {
        prev.showAndFocus(true);
        c(v);
      }
    );
  };
}

abstract class TypevizForm<T> extends CPSForm<T> {
  get firstInput(): HTMLElement | undefined {
    return undefined;
  }

  abstract body(): TemplateResult<1>;

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @query("step-bar")
  stepBar!: FormStepBar;

  drawProgressBar(progress?: ProgressState | undefined): void {
    this.stepBar.setProgressState(progress);
  }

  render() {
    return html`
      <back-or-quit-bar .back=${() => this.back()} .next=${() => this.next()}>
        <step-bar></step-bar>
      </back-or-quit-bar>
      ${this.body()}
      <continue-bar .continue=${() => this.next()}></continue-bar>
    `;
  }
}

@customElement("group-typeviz-form")
export class GroupTypeVizForm extends TypevizForm<GroupTypeDef> {
  constructor(
    attributeBuilderForm: Trigger<AttributeDec>,
    datasetBuilderForm: Trigger<DatasetDec>,
    groupBuilderForm: Trigger<GroupDec>,
    linkBuilderForm: Trigger<LinkDec>
  ) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
    this.triggerLinkDecBuilderForm = subform(this, linkBuilderForm);
    this.triggerDatasetDecBuilderForm = datasetBuilderForm;
    this.triggerGroupDecBuilderForm = groupBuilderForm;
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;
  triggerLinkDecBuilderForm: Trigger<LinkDec>;
  triggerDatasetDecBuilderForm: Trigger<DatasetDec>;
  triggerGroupDecBuilderForm: Trigger<GroupDec>;

  @state()
  groupDef: GroupTypeDef = { ...Initializers.groupTypeDef };

  body(): TemplateResult<1> {
    return html`
      <group-def-elem
        .data=${this.groupDef}
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
        .triggerLinkDecBuilderForm=${this.triggerLinkDecBuilderForm}
        .triggerDatasetDecBuilderForm=${this.triggerDatasetDecBuilderForm}
        .triggerGroupDecBuilderForm=${this.triggerGroupDecBuilderForm}
      ></group-def-elem>
    `;
  }

  fill(val: GroupTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (
      this.groupDef.attributes.length == 0 &&
      this.groupDef.groups.length == 0 &&
      this.groupDef.links.length == 0 &&
      this.groupDef.datasets.length == 0
    ) {
      this.groupDef = {
        ...val,
        attributes: this.groupDef.attributes,
        groups: this.groupDef.groups,
        links: this.groupDef.links,
        datasets: this.groupDef.datasets,
      };
    } else {
      this.groupDef = val;
    }
  }

  transform(_: GroupTypeDef): GroupTypeDef {
    return { ...this.groupDef };
  }

  clear(): void {
    this.groupDef = { ...Initializers.groupTypeDef };
  }
}

export class DatasetTypevizForm extends TypevizForm<DatasetTypeDef> {
  constructor(attributeBuilderForm: Trigger<AttributeDec>) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;

  @state()
  datasetDef: DatasetTypeDef = { ...Initializers.datasetTypeDef };

  body(): TemplateResult<1> {
    return html`
      <dataset-def-elem
        .data=${this.datasetDef}
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
      ></dataset-def-elem>
    `;
  }

  fill(val: DatasetTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    if (this.datasetDef.attributes.length == 0) {
      this.datasetDef = {
        ...val,
        attributes: this.datasetDef.attributes,
      };
    } else {
      this.datasetDef = val;
    }
  }

  transform(_val: DatasetTypeDef): DatasetTypeDef {
    return { ...this.datasetDef };
  }

  clear(): void {
    this.datasetDef = { ...Initializers.datasetTypeDef };
  }
}
