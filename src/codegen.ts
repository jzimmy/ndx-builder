import { customElement, query, state } from "lit/decorators.js";
import {
  AnonymousDatasetDec,
  AnonymousGroupTypeDec,
  AttributeDec,
  CompoundDtype,
  DatasetDec,
  DatasetTypeDef,
  Dtype,
  GroupDec,
  GroupTypeDef,
  IncDatasetDec,
  IncGroupDec,
  LinkDec,
  Namespace,
  PrimitiveDtype,
  Quantity,
  TypeDef,
} from "./nwb/spec";
import { CPSForm, assertNever } from "./hofs";
import { html } from "lit";
import { NDXBuilderDefaultShowAndFocus } from "./basic-form";
import { FormStepBar } from "./basic-elems";
import { Initializers } from "./nwb/spec-defaults";
import {
  NWBAttributeSpec,
  NWBDatasetSpec,
  NWBDtypeSpec,
  NWBGroupSpec,
  NWBLinkSpec,
  NWBNamespaceSpec,
  NWBRefSpec,
  primitive,
} from "./ir/pynwb-spec";
import { interpreter_script } from "./data/interpreter";
import { obfuscateString } from "./upload";

export const MAGIC_SIGNATURE = "NDX_BUILDER_SIGNATURE";

function codegen(ns: Namespace): string {
  let namespaceSpec = convertNamespace(ns);
  let types = ns.typedefs.map(convertTypeDef);
  let includes = getIncludes(ns);

  let interpreter = interpreter_script;

  interpreter = interpreter.replace('{{"types"}}', JSON.stringify(types));
  interpreter = interpreter.replace('{{"includes"}}', JSON.stringify(includes));
  interpreter = interpreter.replace(
    '{{"namespace"}}',
    JSON.stringify(namespaceSpec)
  );
  interpreter = interpreter.replace(
    '{{"signature"}}',
    MAGIC_SIGNATURE + obfuscateString(JSON.stringify(ns)) + MAGIC_SIGNATURE
  );

  return interpreter;
}

export type NWBTypeSpec = ["GROUP", NWBGroupSpec] | ["DATASET", NWBDatasetSpec];

@customElement("codegen-form")
export class CodegenForm extends CPSForm<Namespace> {
  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.script = codegen(val);
    this.namespace = val;
    this.stepBarElem.setProgressState(progress);
  }

  transform(val: Namespace): Namespace {
    return val;
  }

  clear(): void {
    this.script = "";
  }

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  @state()
  script: string = "";

  @state()
  namespace: Namespace = { ...Initializers.namespace };

  @query("step-bar")
  stepBarElem!: FormStepBar;

  render() {
    return html`
    <step-bar></step-bar>
    <input type="button" value="back" @click=${this.back}></input>
    <pre>${this.script}</pre>
    <continue-bar .message=${"export"} .continue=${() =>
      exportFile(this.script, "create_extension_spec.py")}></continue-bar>
    `;
  }
}

function convertNamespace(ns: Namespace): NWBNamespaceSpec {
  let spec: NWBNamespaceSpec = {
    doc: ns.doc,
    name: ns.name,
    full_name: ns.name,
    version: ns.version,
    author: ns.authors.map(([a, _c]) => a),
    contact: ns.authors.map(([_a, c]) => c),
  };
  return spec;
}

function convertTypeDef(t: TypeDef): NWBTypeSpec {
  // nested functions

  function convertGroupTypeDef(g: GroupTypeDef): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: g.doc,
      groups: g.groups.map(convertGroupDec),
      datasets: g.datasets.map(convertDatasetDec),
      attributes: g.attributes.map(convertAttributeDec),
      links: g.links.map(convertLinkDec),
      neurodata_type_def: g.neurodataTypeDef,
    };
    if (g.name && g.name[1]) spec.default_name = g.name[0];
    else if (g.name && !g.name[1]) spec.name = g.name[0];

    if (g.neurodataTypeInc[0] != "None")
      spec.neurodata_type_inc = g.neurodataTypeInc[1].neurodataTypeDef;

    return spec;
  }

  function convertDatasetTypeDef(d: DatasetTypeDef): NWBDatasetSpec {
    let spec: NWBDatasetSpec = {
      doc: d.doc,
      attributes: d.attributes.map(convertAttributeDec),
      shape: d.shape.map((s) => s.map(([d, _l]) => d)),
      dims: d.shape.map((s) => s.map(([_d, l]) => l)),
      neurodata_type_def: d.neurodataTypeDef,
    };
    if (d.name && d.name[1]) spec.default_name = d.name[0];
    else if (d.name && !d.name[1]) spec.name = d.name[0];

    if (d.neurodataTypeInc[0] != "None")
      spec.neurodata_type_inc = d.neurodataTypeInc[1].neurodataTypeDef;

    return spec;
  }

  function convertGroupDec(g: GroupDec) {
    switch (g[0]) {
      case "ANONYMOUS":
        return convertAnonGroupDec(g[1]);
      case "INC":
        return convertIncGroupDec(g[1]);
      default:
        assertNever(g[0]);
    }
  }

  function convertDatasetDec(d: DatasetDec) {
    switch (d[0]) {
      case "ANONYMOUS":
        return convertAnonDatasetDec(d[1]);
      case "INC":
        return convertIncDatasetDec(d[1]);
      default:
        assertNever(d[0]);
    }
  }

  function convertQuantity(q: Quantity): string | number {
    switch (q[0]) {
      case "?":
      case "*":
      case "+":
        return q[0];
      case "Num":
        return q[1];
      default:
        assertNever(q[0]);
    }
  }

  function convertIncGroupDec(g: IncGroupDec): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: g.doc,
    };

    if (g.neurodataTypeInc[0] != "None")
      spec.neurodata_type_inc = g.neurodataTypeInc[1].neurodataTypeDef;
    if (typeof g.quantityOrName == typeof "")
      spec.name = g.quantityOrName[1] as string;
    else spec.quantity = convertQuantity(g.quantityOrName as Quantity);

    return spec;
  }

  function convertAnonGroupDec(g: AnonymousGroupTypeDec): NWBGroupSpec {
    let spec: NWBGroupSpec = {
      doc: g.doc,
      groups: g.groups.map(convertGroupDec),
      datasets: g.datasets.map(convertDatasetDec),
      attributes: g.attributes.map(convertAttributeDec),
      links: g.links.map(convertLinkDec),
      name: g.name,
    };
    return spec;
  }

  function convertIncDatasetDec(d: IncDatasetDec): NWBDatasetSpec {
    let spec: NWBGroupSpec = {
      doc: d.doc,
    };

    if (d.neurodataTypeInc[0] != "None")
      spec.neurodata_type_inc = d.neurodataTypeInc[1].neurodataTypeDef;
    if (typeof d.quantityOrName == typeof "")
      spec.name = d.quantityOrName[1] as string;
    else spec.quantity = convertQuantity(d.quantityOrName as Quantity);

    return spec;
  }

  function convertAnonDatasetDec(d: AnonymousDatasetDec): NWBDatasetSpec {
    let spec: NWBDatasetSpec = {
      name: d.name,
      doc: d.doc,
      attributes: d.attributes.map(convertAttributeDec),
      shape: d.shape.map((s) => s.map(([d, _l]) => d)),
      dims: d.shape.map((s) => s.map(([_d, l]) => l)),
      dtype: convertDtype(d.dtype),
    };
    return spec;
  }

  function convertAttributeDec(a: AttributeDec): NWBAttributeSpec {
    let spec: NWBAttributeSpec = {
      name: a.name,
      doc: a.doc,
      required: a.required,
      dtype: convertDtype(a.dtype) as NWBRefSpec | primitive,
    };

    if (a.value[0] == "SCALAR" && a.value[1][1]) {
      spec.default_value = a.value[1][0];
    } else if (a.value[0] == "SCALAR" && !a.value[1][1]) {
      spec.value = a.value[1][0];
    } else if (a.value[0] == "SHAPE") {
      spec.shape = a.value[1].map((s) => s.map(([d, _l]) => d));
      spec.dims = a.value[1].map((s) => s.map(([_d, l]) => l));
    }

    return spec;
  }

  function convertLinkDec(l: LinkDec): NWBLinkSpec {
    let spec: NWBLinkSpec = {
      doc: l.doc,
      target_type: l.targetType[1][1]!.neurodataTypeDef,
    };
    return spec;
  }

  function convertDtype(d: Dtype): NWBRefSpec | primitive | NWBDtypeSpec[] {
    switch (d[0]) {
      case "COMPOUND":
        return d[1].map(({ name, doc, dtype }: CompoundDtype) => {
          let spec: NWBDtypeSpec = {
            name,
            doc,
            dtype: convertDtype(dtype) as NWBRefSpec | primitive,
          };
          return spec;
        });
      case "PRIMITIVE":
        return convertPrimitive(d[1]);
      case "REFSPEC":
        let spec: NWBRefSpec = {
          target_type: d[1][1][1]!.neurodataTypeDef,
          reftype: "object",
        };
        return spec;
      default:
        assertNever(d[0]);
    }
  }

  function convertPrimitive(p: PrimitiveDtype): primitive {
    switch (p) {
      case "Ascii":
      case "Text":
      case "Bool":
      case "Numeric":
      case "IsoDatetime":
        return p.toLowerCase() as primitive;
      case "i8":
      case "i16":
      case "i32":
      case "i64":
        return "int" + p.slice(1);
      case "u8":
      case "u16":
      case "u32":
      case "u64":
        return "uint" + p.slice(1);
      case "f32":
      case "f64":
        return "float" + p.slice(1);
      case "Any":
        return "None";
      default:
        assertNever(p);
    }
  }

  // back to convertTypeDef

  switch (t[0]) {
    case "GROUP":
      return ["GROUP", convertGroupTypeDef(t[1])];
    case "DATASET":
      return ["DATASET", convertDatasetTypeDef(t[1])];
    default:
      assertNever(t[0]);
  }
}

// Exports contents as a new file
function exportFile(contents: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(contents)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

type Include = {
  kind: "Core" | "Typedef";
  def: string;
};

function getIncludes(typedef: TypeDef): Include[] {
  // nested functions

  function getIncludesTypeDef(t: TypeDef): Include[] {
    switch (t[0]) {
      case "GROUP":
        return getIncludesGroupTypeDef(t[1]);
      case "DATASET":
        return getIncludesDatasetTypeDef(t[1]);
      default:
        return [];
    }
  }

  function getIncludesGroupTypeDef(g: GroupTypeDef): Include[] {
    const includes = [
      ...g.groups.flatMap(getIncludesGroupDec),
      ...g.datasets.flatMap(getIncludesDatasetDec),
      ...g.attributes.flatMap(getIncludesAttributeDec),
      ...g.links.flatMap(getIncludesLinkDec),
    ];
    if (g.neurodataTypeInc[0] != "None") {
      return [
        { kind: "Core", def: g.neurodataTypeInc[1].neurodataTypeDef },
        ...includes,
      ];
    }
    return includes;
  }

  function getIncludesDatasetTypeDef(d: DatasetTypeDef): Include[] {
    const includes = [...d.attributes.flatMap(getIncludesAttributeDec)];
    if (d.neurodataTypeInc[0] != "None") {
      return [
        { kind: "Core", def: d.neurodataTypeInc[1].neurodataTypeDef },
        ...includes,
      ];
    }
    return includes;
  }

  function getIncludesGroupDec(g: GroupDec): Include[] {
    if (g[0] == "INC" && g[1].neurodataTypeInc[0] != "None")
      return [
        {
          kind: g[1].neurodataTypeInc[0],
          def: g[1].neurodataTypeInc[1].neurodataTypeDef,
        },
      ];
    else if (g[0] == "ANONYMOUS")
      return [
        ...g[1].groups.flatMap(getIncludesGroupDec),
        ...g[1].datasets.flatMap(getIncludesDatasetDec),
        ...g[1].attributes.flatMap(getIncludesAttributeDec),
        ...g[1].links.flatMap(getIncludesLinkDec),
      ];
    else return [];
  }

  function getIncludesDatasetDec(d: DatasetDec): Include[] {
    if (d[0] == "INC" && d[1].neurodataTypeInc[0] != "None")
      return [
        {
          kind: d[1].neurodataTypeInc[0],
          def: d[1].neurodataTypeInc[1].neurodataTypeDef,
        },
      ];
    else if (d[0] == "ANONYMOUS")
      return [
        ...d[1].attributes.flatMap(getIncludesAttributeDec),
        ...getIncludesDtype(d[1].dtype),
      ];
    else return [];
  }

  function getIncludesDtype(d: Dtype): Include[] {
    if (d[0] == "REFSPEC" && d[1][1][0] != "None")
      return [{ kind: d[1][1][0], def: d[1][1][1].neurodataTypeDef }];
    else if (d[0] == "COMPOUND")
      return d[1].flatMap((f) => getIncludesDtype(f.dtype));
    else return [];
  }

  function getIncludesAttributeDec(a: AttributeDec): Include[] {
    return getIncludesDtype(a.dtype);
  }

  function getIncludesLinkDec(l: LinkDec): Include[] {
    return l.targetType[1][0] != "None"
      ? [{ kind: l.targetType[1][0], def: l.targetType[1][1].neurodataTypeDef }]
      : [];
  }

  // back to getCoreIncludes
  return getIncludesTypeDef(typedef);
}

function sortNamespace(ns: Namespace): [string[], TypeDef[]] {
  let includes = ns.typedefs
    .map((ty) => ({ ty, includes: getIncludes(ty) }))
    .map(({ ty, includes }) => ({
      ty,
      def: ty[1].neurodataTypeDef,
      coreIncludes: includes.filter((i) => i.kind == "Core").map((i) => i.def),
      deps: includes.filter((i) => i.kind == "Typedef").map((i) => i.def),
    }));

  let allCore = Array.from(new Set(includes.flatMap((i) => i.coreIncludes)));

  type IncludeNode = (typeof includes)[0];

  function topologicalSort(nodes: IncludeNode[]) {}

  function findStartNodes(nodes: IncludeNode[]): Swaps[] {
    return nodes.filter((n) => n.deps.length == 0);
  }

  return [allCore, ns.typedefs];
}

type Swaps = { [key: number]: number };

function applySwaps<T>(array: T[], newOrder: Swaps) {
  for (let i in newOrder) {
    let j = newOrder[i];
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
