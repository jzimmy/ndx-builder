/***
 * All the logic for the app is in here, this is where the forms are glued together
 */
import { LitElement } from "lit";
import {
  AttribInfoForm,
  AttribValueForm,
  attribDtypeFormTitle,
} from "./attrib";
import { CodegenForm } from "./codegen";
import { CPSForm, FormChain, Trigger } from "./hofs";
import {
  DatasetInctypeForm,
  GenericInctypeForm,
  GroupInctypeForm,
  TargetIncTypeForm,
} from "./inctype";
import {
  NamespaceStartForm,
  NamespaceTypesForm,
  NamespaceMetadataForm,
} from "./namespace";
import {
  AttributeDec,
  GroupTypeDef,
  DatasetTypeDef,
  TypeDef,
  Namespace,
  LinkDec,
  GroupDec,
  AnonymousGroupTypeDec,
  IncGroupDec,
  DatasetDec,
  AnonymousDatasetDec,
  IncDatasetDec,
} from "./nwb/spec";
import { AxesForm } from "./axes";
import { TypenameForm } from "./names";
import { Initializers } from "./nwb/spec-defaults";
import { DatasetTypeVizForm, GroupTypeVizForm } from "./typeviz-form";
import { LinkInfoForm } from "./link";
import { DtypeForm } from "./dtype";
import { AnonDecNameForm, IncDecNameForm } from "./names";

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
function fc<T>(f?: CPSForm<T>, stps?: string[], index = -1) {
  return new FormChain(f, stps, index);
}

// Empty chain a.k.a. unit. Like nullptr in C++
// Needs to be type `any` to allow generalization during inference
const nullform = fc<any>();

// all logic is in here, then when ready, build it with the parent
export function buildFormChains(parent: LitElement): Trigger<Namespace> {
  let linkBuilderTrigger = fc<LinkDec>(new TargetIncTypeForm())
    .then(new LinkInfoForm())
    .withParent(parent);

  let anonGroupDecChain = fc(
    new AnonDecNameForm<AnonymousGroupTypeDec>(),
    [],
    0
  ).convert<GroupDec>(
    (v) => ["ANONYMOUS", v],
    ([_, v]) => v as AnonymousGroupTypeDec
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
      (v: AttributeDec) => v.data[0] === "SHAPE",
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

  let namespaceBuilderTrigger = fc<Namespace>(
    new NamespaceStartForm().addDebugTrigger(
      linkBuilderTrigger,
      Initializers.linkDec
    )
  )
    .then(
      new NamespaceTypesForm(typedefBuilderTrigger),
      namespaceBuilderSteps,
      0
    )
    .then(new NamespaceMetadataForm(), namespaceBuilderSteps, 1)
    .then(new CodegenForm(), namespaceBuilderSteps, 2)
    .withParent(parent);

  return namespaceBuilderTrigger;
}
