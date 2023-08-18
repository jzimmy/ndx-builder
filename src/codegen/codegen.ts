import { interpreterScript } from "../data/interpreter";
import { assertNever } from "../utils";
import {
  AnonymousDatasetDec,
  AnonymousGroupDec,
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
} from "../nwb/spec";
import {
  NWBGroupSpec,
  NWBDatasetSpec,
  NWBAttributeSpec,
  NWBDtypeSpec,
  NWBLinkSpec,
  NWBNamespaceSpec,
  NWBRefSpec,
  primitive,
} from "./pynwb-spec";
import { obfuscateString } from "./upload";

export const MAGIC_SIGNATURE = "!@#NDX_BUILDER_SIGNATURE!@#";

export default function codegen(ns: Namespace): string {
  let nsSpec = convertNamespace(ns);
  let [includes, tydefs] = sortNamespace(ns);
  let types = tydefs.map(convertTypeDef);

  let interpreter = interpreterScript;

  // sed
  interpreter = interpreter.replace('{{"namespace_name"}}', nsSpec.name);
  interpreter = interpreter.replace(
    '{{"types"}}',
    JSON.stringify(types, null, 2)
  );
  interpreter = interpreter.replace(
    '{{"includes"}}',
    JSON.stringify(includes, null, 2)
  );
  interpreter = interpreter.replace(
    '{{"namespace"}}',
    JSON.stringify(nsSpec, null, 2)
  );
  interpreter = interpreter.replace(
    '{{"signature"}}',
    MAGIC_SIGNATURE + obfuscateString(JSON.stringify(ns)) + MAGIC_SIGNATURE
  );

  return interpreter;
}

export type NWBTypeSpec = ["GROUP", NWBGroupSpec] | ["DATASET", NWBDatasetSpec];

// note that in original NWB spec namespace doesn't contain the typedefs
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
  switch (t[0]) {
    case "GROUP":
      return ["GROUP", convertGroupTypeDef(t[1])];
    case "DATASET":
      return ["DATASET", convertDatasetTypeDef(t[1])];
    default:
      assertNever(t[0]);
  }

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
      dtype: convertDtype(d.dtype),
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

  function convertAnonGroupDec(g: AnonymousGroupDec): NWBGroupSpec {
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
}

type Include = {
  kind: "Core" | "Typedef";
  def: string;
};

function getIncludes(typedef: TypeDef): Include[] {
  return getIncludesTypeDef(typedef);

  // nested recursive functions
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
  return [allCore, topologicalSort(includes).map((i) => i.ty)];

  // reorder typedefs so that all dependencies are defined before use
  type IncludeNode = (typeof includes)[0];

  // uses Kahn's algorithm
  function topologicalSort(nodes: IncludeNode[]) {
    const L = new Array<IncludeNode>();
    let S = nodes.filter((n) => n.deps.length == 0);

    while (S.length > 0) {
      let n = S.pop()!;
      L.push(n);
      let needsN = nodes.filter((m) => m.deps.includes(n.def));
      for (let m of needsN) {
        m.deps = m.deps.filter((dep) => dep != n.def);
        if (m.deps.length == 0) S.push(m);
      }
    }

    if (nodes.every((n) => n.deps.length == 0)) return L;
    else
      throw new Error(
        `Types contain circular dependency. Types with conflict are ${nodes
          .filter((n) => n.deps.length > 0)
          .map((n) => n.def)}`
      );
  }
}
