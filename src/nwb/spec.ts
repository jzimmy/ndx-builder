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

export type Quantity =
  | ["?", null]
  | ["*", null]
  | ["+", null]
  | ["Num", number];

export enum CoreGroupType {
  Example,
  New,
  // ...
}

export enum CoreDatasetType {
  Example,
  New,
  // ...
}

export enum PrimitiveDtype {
  i8,
  i16,
  i32,
  i64,
  u8,
  u16,
  u32,
  u64,
  f32,
  f64,
  Text,
  IsoDatetime,
}
export type Dtype =
  | ["PRIMITIVE", PrimitiveDtype]
  | ["REFSPEC", GroupType | DatasetType]
  | ["COMPOUND", Dtype[]];

// Discriminated Union for top level GroupTypes
// GroupType is a top level NWB Group, that can be used in a neurodataTypeInc and
// can be used anywhere in a namespace
export type GroupType = ["Core", CoreGroupType] | ["Typedef", GroupTypeDef];

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
  | ["Typedef", DatasetTypeDef];

// DatasetTypeDef is a DatasetType that was created using the NDX API.
export type DatasetTypeDef = {
  neurodataTypeDef: string;
  neurodataTypeInc: DatasetType;

  doc: string;
  name?: Defaultable<string>;

  shape: [number, string][];
  dtype: Dtype;

  attributes: AttributeDec[];
};

// DatasetDec is an instantiation of a DatasetType. It is used in the
// subfields of a GroupType
export type DatasetDec =
  | ["Inc", IncDatasetDec]
  | ["Anonymous", AnonymousDatasetDec];

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
  shape: [number, string][];
  dtype: Dtype;
  attributes: AttributeDec[];
};

export type AttributeDec = {
  name: string;
  doc: string;
  dtype: Dtype;
  shape: [number, string][];
  required: boolean;
  value?: Defaultable<string>; // boolean flag means value is default
};

export type LinkDec = {
  doc: string;
  targetType: GroupType | DatasetType;
  quantityOrName: Quantity | string; // if named, quantity is one
};

export type TypeDef = ["GROUP", GroupTypeDef] | ["DATASET", DatasetTypeDef];

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
