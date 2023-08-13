/***
 * All the logic for the app is in here, this is where the forms are glued together
 */
import { LitElement } from "lit";
import { AttribInfoForm, AttribValueForm } from "./attrib";
import { CodegenForm } from "./codegen";
import { CPSForm, FormChain, Trigger } from "./hofs";
import {
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
} from "./nwb/spec";
import { AxesForm, TypenameForm, DatasetDefVizForm } from "./defs";
import { AttributeAndShape } from "./parent";
import { Initializers } from "./nwb/spec-defaults";
import { GroupTypeVizForm } from "./typeviz-form";
import { AnonGroupDecInfo, IncGroupDecInfo } from "./decs";
import { LinkInfoForm } from "./link";

const namespaceBuilderSteps = [
  "Add custom types",
  "Define extension namespace",
  "Export extension generator script",
];

const typeDefSteps = [
  "Pick a base type",
  "Define type properties",
  "Add subcomponents",
];

const attributeBuilderSteps = ["Name attribute", "Define axes"];

const datasetTypeDefBuilderSteps = [
  ...typeDefSteps.slice(0, 1),
  "Name dataset type",
  "Define axes",
  ...typeDefSteps.slice(2),
];

const groupTypeDefBuilderSteps = [
  ...typeDefSteps.slice(0, 1),
  "Name group type",
  ...typeDefSteps.slice(2),
];

// alias for `new FormChain<T>(...)`
function fc<T>(f?: CPSForm<T>, stps?: string[], index = -1) {
  return new FormChain(f, stps, index);
}

// all logic is in here, then when ready, build it with the parent
export function buildFormChains(
  parent: LitElement,
  debug = false
): Trigger<Namespace> {
  let linkBuilderTrigger = fc<LinkDec>(new TargetIncTypeForm())
    .then(new LinkInfoForm())
    .withParent(parent);

  let anonGroupDecChain = fc(new AnonGroupDecInfo(), [], 0).convert<GroupDec>(
    (v) => ["ANONYMOUS", v],
    ([_, v]) => v as AnonymousGroupTypeDec
  );

  let incGroupDecChain = fc(new IncGroupDecInfo()).convert<GroupDec>(
    (v) => ["INC", v],
    ([_, v]) => v as IncGroupDec
  );

  let groupDecBuilderTrigger = fc(new GroupInctypeForm())
    .convert<GroupDec>(
      ({ neurodataTypeInc }) =>
        neurodataTypeInc[0] == "None"
          ? ["ANONYMOUS", { ...Initializers.anonymousGroupDec }]
          : ["INC", { ...Initializers.incGroupDec, neurodataTypeInc }],
      (v) => {
        return v[0] == "ANONYMOUS"
          ? { ...v[1], neurodataTypeInc: ["None", null] }
          : { ...v[1] };
      }
    )
    .branch(
      (v: GroupDec) => v[0] == "ANONYMOUS",
      anonGroupDecChain,
      incGroupDecChain
    )
    .withParent(parent);

  let attributeBuilderTrigger = new FormChain<AttributeDec>(
    new AttribInfoForm(),
    attributeBuilderSteps,
    0
  )
    .then(new AttribValueForm(), attributeBuilderSteps, 1)
    .branch(
      (v: AttributeDec) => v.data[0] === "SHAPE",
      fc(), // data type form
      fc()
    )
    .withParent(parent);

  let groupBuilderFormChain = fc<GroupTypeDef>(
    new TypenameForm(),
    groupTypeDefBuilderSteps,
    1
  ).then(
    new GroupTypeVizForm(
      attributeBuilderTrigger,
      () => {},
      () => {},
      linkBuilderTrigger
    ),
    groupTypeDefBuilderSteps,
    3
  );

  let datasetBuilderFormChain = fc<DatasetTypeDef>(
    new TypenameForm(),
    datasetTypeDefBuilderSteps,
    1
  )
    .then(new AxesForm(), datasetTypeDefBuilderSteps, 2)
    .then(
      new DatasetDefVizForm(attributeBuilderTrigger),
      datasetTypeDefBuilderSteps,
      3
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
      attributeBuilderTrigger,
      Initializers.attributeDec
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
