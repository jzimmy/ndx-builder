/* SPEC.TS
 * Author: Jacob Zimmerman
 *
 * Terminology Reference:
 * ----------------------
 *
 * Def
 * ---
 *  Def abbreviates definition, so a type definition of `MyType`.
 *  C equivalent:
 * ```
 *  typedef int MyType;
 *  // or
 *  struct MyType {
 *     int lenght;
 *     char *array;
 *  };
 * ```
 * Dec
 * ---
 *  Dec abbreviates declaration, so it is used to declare a variable with type `MyType`.
 *  C equivalent:
 * ```
 *  MyType my_variable;
 *  // or
 *  struct SomeOtherType {
 *     MyType my_variable;
 *     char *array;
 *  };
 * ```
 *
 * IncDec
 * ---------------
 * Refers to the declaration of a primitive core NWB type, e.g. TimeSeries.
 *
 * AnonymousDec
 * ---------------------
 * Refers to the declaration of a type that is defined inline, it is the only instance of
 * that type that will ever exit.
 * C equivalent:
 * ```
 * struct SomeOtherNamedType {
 *    int count;
 *    struct {
 *      int length;
 *      char *array;
 *    } my_anonymous_type_instance;
 * }
 * ```
 *
 */

// [_, true] means default
export type Defaultable<T> = [T, boolean];
export type Shape = [number | "None", string][];

export type Namespace = {
  name: string;
  doc: string;
  version: [number, number, number];
  authors: [string, string][];
  typedefs: TypeDef[];
};

export type NWBType = ["GROUP", GroupType] | ["DATASET", DatasetType];

export type CoreType = ["GROUP", CoreGroupType] | ["DATASET", CoreDatasetType];
export type TypeDef = ["GROUP", GroupTypeDef] | ["DATASET", DatasetTypeDef];

export type NeuroDataTypeDef =
  | ["GROUP", GroupTypeDef]
  | ["DATASET", DatasetTypeDef];

export type Quantity =
  | ["?", null]
  | ["*", null]
  | ["+", null]
  | ["Num", number];

// TODO, fetch from NWB
export type CoreGroupType = {
  neurodataTypeDef: string;
  name: Defaultable<string>;
  doc: string;
};

export type CoreDatasetType = {
  neurodataTypeDef: string;
  name: Defaultable<string>;
  doc: string;
  shape: Shape[];
  dtype: Dtype;
};

export type PrimitiveDtype =
  | "Ascii"
  | "Text"
  | "Bool"
  | "IsoDatetime"
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "f32"
  | "f64"
  | "Numeric" // can be refined to numeric
  | "Any"; // can be any

export type CompoundDtype = {
  name: string;
  doc: string;
  dtype: Dtype;
};

export type Dtype =
  | ["PRIMITIVE", PrimitiveDtype]
  | ["REFSPEC", NWBType]
  | ["COMPOUND", CompoundDtype[]];

// Discriminated Union for top level GroupTypes
// GroupType is a top level NWB Group, that can be used in a neurodataTypeInc and
// can be used anywhere in a namespace
export type GroupType =
  | ["Core", CoreGroupType]
  | ["Typedef", GroupTypeDef]
  | ["None", null];

// GroupTypeDef is a GroupType that was created using the NDX API.
export type GroupTypeDef = {
  neurodataTypeDef: string;
  neurodataTypeInc: GroupType;

  doc: string;
  name?: Defaultable<string>;

  groups: GroupDec[];
  datasets: DatasetDec[];
  attributes: AttributeDec[];
  links: LinkDec[];
};

// GroupDec is an instantiation of a GroupType, it does not define a top level type
export type GroupDec =
  | ["ANONYMOUS", AnonymousGroupTypeDec]
  | ["INC", IncGroupDec];

// AnonymousGroupTypeDec is an instantiation of custom GroupDec
// that is not in the top level. It creates an inline GroupType
// that cannot be referenced elsewhere.
export type AnonymousGroupTypeDec = {
  doc: string;
  name: string;
  groups: GroupDec[];
  datasets: DatasetDec[];
  attributes: AttributeDec[];
  links: LinkDec[];
};

// IncGroupDec is an instantiation of an existing GroupType.
export type IncGroupDec = {
  doc: string;
  neurodataTypeInc: GroupType;
  quantityOrName: Quantity | string; // if named, quantity is one
};

// Top level dataset neurodata type
export type DatasetType =
  | ["Core", CoreDatasetType]
  | ["Typedef", DatasetTypeDef]
  | ["None", null];

// DatasetTypeDef is a DatasetType that was created using the NDX API.
export type DatasetTypeDef = {
  neurodataTypeDef: string;
  neurodataTypeInc: DatasetType;

  doc: string;
  name?: Defaultable<string>;

  shape: Shape[];
  dtype: Dtype;

  attributes: AttributeDec[];
};

// DatasetDec is an instantiation of a DatasetType. It is used in the
// subfields of a GroupType
export type DatasetDec =
  | ["INC", IncDatasetDec]
  | ["ANONYMOUS", AnonymousDatasetDec];

// An instance of an existing DatasetDec
export type IncDatasetDec = {
  doc: string;
  neurodataTypeInc: DatasetType;
  quantityOrName: Quantity | string; // if named, quantity is one
};

// An instance of a custom dataset that is defined inline
export type AnonymousDatasetDec = {
  doc: string;
  name: string;
  shape: Shape[];
  readonly dtype: Dtype;
  attributes: AttributeDec[];
};

// TODO move Dtype into data
export type AttributeDec = {
  name: string;
  doc: string;
  required: boolean;
  value: ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>];
  readonly dtype: Dtype;
};

export type LinkDec = {
  doc: string;
  readonly targetType: NWBType;
  quantityOrName: Quantity | string; // if named, quantity is one
};

// required UI componenets

// MyTypeDefBar --> TypeDefBuilder -> GroupTypeDefBuilder
//              |                  |-> DatasetTypeDefBuilder
//              |-> NamespaceForm
//
// TypeBrowser --> MyTypeBrowser -> TypeTable
//             |-> CoreTypeBrowser -> CoreModuleTable -> TypeTable
//             |-> CustomNamespaceBrowser
//
// GroupTypeDefBuilder --> TypeBrowser
//                     |-> GroupDecBuilder --> GroupIncDecBuilder
//                     |                    |-> GroupAnonDecBuilder
//                     |-> DatasetDecBuilder --> DatasetIncDecBuilder
//                     |                      |-> DatasetAnonDecBuilder
//                     |-> AttributeDecBuilder
//                     |-> LinkDecBuilder
//
// DatasetTypeDefBuilder --> TypeBrowser
//                       |-> GroupDecBuilder --> GroupIncDecBuilder
//                       |                    |-> GroupAnonDecBuilder
//                       |-> DatasetDecBuilder --> DatasetIncDecBuilder
//                       |                      |-> DatasetAnonDecBuilder
//                       |-> AttributeDecBuilder
//                       |-> LinkDecBuilder

//  Starting directions
//  Add datasets to LabMetaData (empty group)
