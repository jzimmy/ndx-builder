/***
 * All the logic for the app is in here, this is where the forms are glued together
 */
import { LitElement } from "lit";
import { attribDtypeFormTitle } from "./forms/attrib-form";
import { AttribValueForm } from "./forms/attrib-form";
import { AttribInfoForm } from "./forms/attrib-form";
import { CodegenForm } from "./forms/codegen-form";
import { FormChain, Trigger } from "./logic/hofs";
import { CPSForm } from "./logic/cps-form";
import {
  DatasetInctypeForm,
  GenericInctypeForm,
  GroupInctypeForm,
  TargetIncTypeForm,
} from "./forms/inctype-form";
import {
  NamespaceStartForm,
  NamespaceTypesForm,
  NamespaceMetadataForm,
} from "./forms/namespace-forms";
import {
  AttributeDec,
  GroupTypeDef,
  DatasetTypeDef,
  TypeDef,
  Namespace,
  LinkDec,
  GroupDec,
  AnonymousGroupDec,
  IncGroupDec,
  DatasetDec,
  AnonymousDatasetDec,
  IncDatasetDec,
} from "./nwb/spec";
import { AxesForm } from "./forms/axes-form";
import { TypenameForm } from "./forms/name-forms";
import { Initializers } from "./nwb/spec-defaults";
import { DatasetTypeVizForm, GroupTypeVizForm } from "./forms/typeviz-form";
import { LinkInfoForm } from "./forms/link-form";
import { DtypeForm } from "./forms/dtype-form";
import { AnonDecNameForm, IncDecNameForm } from "./forms/name-forms";

// this good place to get a sense of overall workflow
export const namespaceBuilderSteps = [
  "Add custom types",
  "Define extension namespace",
  "Export extension generator script",
];

const typeDefSteps = [
  "Pick a base type",
  "Name type",
  "Define type properties",
  "Add subcomponents",
];

const groupTypeDefBuilderSteps = [...typeDefSteps];
const datasetTypeDefBuilderSteps = [
  ...typeDefSteps.slice(0, 2),
  "Define axes",
  "Data type",
  ...typeDefSteps.slice(3),
];

const attributeBuilderSteps = ["Name attribute", "Define axes"];

// alias for `new FormChain<T>(...)`
function fc<T>(f?: CPSForm<T>, steps?: string[], index = -1) {
  return new FormChain(f, steps, index);
}

// Empty chain a.k.a. unit. Like nullptr in C++
// Needs to be type `any` to allow generalization during inference
const nullform = fc<any>();

// all logic is in built up here, then when ready, build it with the parent
// look at hofs.ts to understand the internals
export function buildFormChains(parent: LitElement): Trigger<Namespace> {
  let linkBuilderTrigger = fc<LinkDec>(new TargetIncTypeForm())
    .then(new LinkInfoForm())
    .withParent(parent);

  let anonGroupDecChain = fc(
    new AnonDecNameForm<AnonymousGroupDec>(),
    [],
    0
  ).convert<GroupDec>(
    (v) => ["ANONYMOUS", v],
    ([_, v]) => v as AnonymousGroupDec
  );

  let incGroupDecChain = fc(
    new IncDecNameForm<IncGroupDec>()
  ).convert<GroupDec>(
    (v) => ["INC", v],
    ([_, v]) => v as IncGroupDec
  );

  let anonDatasetDecChain = fc(
    new AnonDecNameForm<AnonymousDatasetDec>(),
    [],
    0
  )
    .then(new AxesForm(), [], 0)
    .then(new DtypeForm(), [], 0)
    .convert<DatasetDec>(
      (v) => ["ANONYMOUS", v],
      ([_, v]) => v as AnonymousDatasetDec
    );

  let incDatasetDecChain = fc(
    new IncDecNameForm<IncDatasetDec>()
  ).convert<DatasetDec>(
    (v) => ["INC", v],
    ([_, v]) => v as IncDatasetDec
  );

  let groupDecBuilderTrigger = fc(new GroupInctypeForm())
    .convert<GroupDec>(
      ({ neurodataTypeInc }) =>
        neurodataTypeInc[0] == "None"
          ? ["ANONYMOUS", { ...Initializers.anonymousGroupDec }]
          : ["INC", { ...Initializers.incGroupDec, neurodataTypeInc }],
      (v) =>
        v[0] == "ANONYMOUS"
          ? { ...v[1], neurodataTypeInc: ["None", null] }
          : { ...v[1] }
    )
    .branch(
      (v: GroupDec) => v[0] == "ANONYMOUS",
      anonGroupDecChain,
      incGroupDecChain
    )
    .withParent(parent);

  let datasetDecBuilderTrigger = fc(new DatasetInctypeForm())
    .convert<DatasetDec>(
      ({ neurodataTypeInc }) =>
        neurodataTypeInc[0] == "None"
          ? ["ANONYMOUS", { ...Initializers.anonymousDatasetDec }]
          : ["INC", { ...Initializers.incDatasetDec, neurodataTypeInc }],
      (v) =>
        v[0] == "ANONYMOUS"
          ? { ...v[1], neurodataTypeInc: ["None", null] }
          : { ...v[1] }
    )
    .branch(
      (v: DatasetDec) => v[0] == "ANONYMOUS",
      anonDatasetDecChain,
      incDatasetDecChain
    )
    .withParent(parent);

  let attributeBuilderTrigger = fc<AttributeDec>(
    new AttribInfoForm(),
    attributeBuilderSteps,
    0
  )
    .then(new AttribValueForm(), attributeBuilderSteps, 1)
    .branch(
      (v: AttributeDec) => v.value[0] === "SHAPE",
      fc(
        new DtypeForm<AttributeDec>().withTitle(attribDtypeFormTitle),
        [...attributeBuilderSteps, "Data type"],
        attributeBuilderSteps.length
      ),
      nullform
    )
    .withParent(parent);

  let groupBuilderFormChain = fc<GroupTypeDef>(
    new TypenameForm<GroupTypeDef>().withTitle("Name your new group type"),
    groupTypeDefBuilderSteps,
    1
  ).then(
    new GroupTypeVizForm(
      attributeBuilderTrigger,
      datasetDecBuilderTrigger,
      groupDecBuilderTrigger,
      linkBuilderTrigger
    ),
    groupTypeDefBuilderSteps,
    3
  );

  let datasetBuilderFormChain = fc<DatasetTypeDef>(
    new TypenameForm<DatasetTypeDef>().withTitle("Name your new dataset type"),
    datasetTypeDefBuilderSteps,
    1
  )
    .then(new AxesForm(), datasetTypeDefBuilderSteps, 2)
    .then(new DtypeForm(), datasetTypeDefBuilderSteps, 3)
    .then(
      new DatasetTypeVizForm(attributeBuilderTrigger),
      datasetTypeDefBuilderSteps,
      4
    );

  let typedefBuilderTrigger = fc<TypeDef>()
    .then(new GenericInctypeForm(), typeDefSteps, 0)
    .branch(
      ([k, _]) => k === "GROUP",
      // branch guarantees safety, so `as` cast is okay here
      groupBuilderFormChain.convert(
        (v) => ["GROUP", v] as TypeDef,
        ([_, g]) => g as GroupTypeDef
      ),
      datasetBuilderFormChain.convert(
        (v) => ["DATASET", v] as TypeDef,
        ([_, d]) => d as DatasetTypeDef
      )
    )
    .withParent(parent);

  let typedefEditorTrigger = fc<TypeDef>()
    .branch(
      ([k, _]) => k === "GROUP",
      // branch guarantees safety, so `as` cast is okay here
      groupBuilderFormChain.convert(
        (v) => ["GROUP", v] as TypeDef,
        ([_, g]) => g as GroupTypeDef
      ),
      datasetBuilderFormChain.convert(
        (v) => ["DATASET", v] as TypeDef,
        ([_, d]) => d as DatasetTypeDef
      )
    )
    .withParent(parent);

  let namespaceBuilderTrigger = fc<Namespace>(new NamespaceStartForm())
    .then(
      new NamespaceTypesForm(typedefBuilderTrigger, typedefEditorTrigger),
      namespaceBuilderSteps,
      0
    )
    .then(new NamespaceMetadataForm(), namespaceBuilderSteps, 1)
    .then(new CodegenForm(), namespaceBuilderSteps, 2)
    .withParent(parent);

  return namespaceBuilderTrigger;
}
