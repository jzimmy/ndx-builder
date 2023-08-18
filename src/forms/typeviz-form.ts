import { customElement, query } from "lit/decorators.js";
import { NDXBuilderDefaultShowAndFocus } from "..";
import {
  AttributeDec,
  DatasetDec,
  DatasetTypeDef,
  GroupDec,
  GroupTypeDef,
  LinkDec,
} from "../nwb/spec";
import { TemplateResult, html } from "lit";
import { CPSFormController, Trigger } from "../logic/hofs";
import { CPSForm, ProgressState } from "../logic/cps-form";
import "../typeviz/viz-utils";
import { FormStepBar } from "../basic-elems";
import { DatasetTypeDefElem, GroupTypeDefElem } from "../typeviz/def-viz-elems";
import "../typeviz/all";

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

abstract class TypeVizForm<T> extends CPSForm<T> {
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
      <back-or-quit-bar
        .back=${() => this.back()}
        .quit=${() => this.quit()}
        .next=${() => this.next()}
      >
        <step-bar></step-bar>
      </back-or-quit-bar>
      ${this.body()}
      <continue-bar .continue=${() => this.next()}></continue-bar>
    `;
  }
}

@customElement("group-typeviz-form")
export class GroupTypeVizForm extends TypeVizForm<GroupTypeDef> {
  constructor(
    attributeBuilderForm: Trigger<AttributeDec>,
    datasetBuilderForm: Trigger<DatasetDec>,
    groupBuilderForm: Trigger<GroupDec>,
    linkBuilderForm: Trigger<LinkDec>
  ) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
    this.triggerLinkDecBuilderForm = subform(this, linkBuilderForm);
    this.triggerDatasetDecBuilderForm = subform(this, datasetBuilderForm);
    this.triggerGroupDecBuilderForm = subform(this, groupBuilderForm);
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;
  triggerLinkDecBuilderForm: Trigger<LinkDec>;
  triggerDatasetDecBuilderForm: Trigger<DatasetDec>;
  triggerGroupDecBuilderForm: Trigger<GroupDec>;

  @query("group-def-elem")
  groupDefElem!: GroupTypeDefElem;

  body(): TemplateResult<1> {
    return html`
      <group-def-elem
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
        .triggerLinkDecBuilderForm=${this.triggerLinkDecBuilderForm}
        .triggerDatasetDecBuilderForm=${this.triggerDatasetDecBuilderForm}
        .triggerGroupDecBuilderForm=${this.triggerGroupDecBuilderForm}
      ></group-def-elem>
    `;
  }

  fill(val: GroupTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.groupDefElem.fill(val);
  }

  transform(_: GroupTypeDef): GroupTypeDef {
    return { ...this.groupDefElem.value() };
  }

  clear(): void {
    this.groupDefElem.clear();
  }
}

@customElement("dataset-typeviz-form")
export class DatasetTypeVizForm extends TypeVizForm<DatasetTypeDef> {
  constructor(attributeBuilderForm: Trigger<AttributeDec>) {
    super();
    this.triggerAttribDecBuilderForm = subform(this, attributeBuilderForm);
  }

  triggerAttribDecBuilderForm: Trigger<AttributeDec>;

  @query("dataset-def-elem")
  datasetDefElem!: DatasetTypeDefElem;

  body(): TemplateResult<1> {
    return html`
      <dataset-def-elem
        .triggerAttribDecBuilderForm=${this.triggerAttribDecBuilderForm}
      ></dataset-def-elem>
    `;
  }

  fill(val: DatasetTypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
    this.datasetDefElem.fill(val);
  }

  transform(_val: DatasetTypeDef): DatasetTypeDef {
    return { ...this.datasetDefElem.value() };
  }

  clear(): void {
    this.datasetDefElem.clear();
  }
}
