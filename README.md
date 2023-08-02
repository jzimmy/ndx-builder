# ndx-builder

### Organization

The app is represented as one long bidirectional user flow

The logic is handles by creating `FormChain`s and each viewable state is a singular
form.

**Locations:**

- `src/namespace.ts`: `NamespaceStartFormpage` and `NamespaceMetadataFormpage`
- `src/inctype.ts`: `IncTypeBrowser` and `Subtype`
- `src/typedef.ts`: `TypeDefNameAndDescriptionFormpage` and `AxesFormpage`
