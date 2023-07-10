import "./components/generic/titlebar";
import "./components/generic/carousel";
// import "./components/namespace-form/ndx-namespace";
// import "./components/namespace-form/ndx-schema";
import "./components/type-builder/ndx-types";
import "./components/generic/dropdown";

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}
