# Abaqus / CalculiX Input File Extension for VS Code

Language support for Abaqus and CalculiX (CCX) finite element analysis input files.

## Features

### Syntax Highlighting

Highlights the key elements of the Abaqus input file format:

- **Comments** — lines beginning with `**`
- **Keywords** — lines beginning with `*`, categorized by type:
  - Block keywords: `*STEP`, `*PART`, `*INSTANCE`, `*ASSEMBLY`
  - Analysis procedures: `*STATIC`, `*DYNAMIC`, `*FREQUENCY`, etc.
  - Material definitions: `*ELASTIC`, `*PLASTIC`, `*DENSITY`, etc.
  - Output requests: `*OUTPUT`, `*NODE OUTPUT`, `*ELEMENT OUTPUT`, etc.
- **Parameters** — `KEY=VALUE` pairs on keyword lines (e.g. `NAME=Part-1`, `TYPE=C3D8R`)
- **Numbers** — integer, decimal, and scientific notation values in data lines (e.g. `1.234E-5`)

### Code Folding

Two levels of folding are available:

**Block folds** — collapse entire sections bounded by explicit `*END` keywords:
- `*STEP` / `*END STEP`
- `*PART` / `*END PART`
- `*INSTANCE` / `*END INSTANCE`
- `*ASSEMBLY` / `*END ASSEMBLY`

**Data folds** — collapse the data lines beneath any keyword (e.g. `*NODE`, `*ELEMENT`, `*ELASTIC`, `*BOUNDARY`). The fold spans from the keyword line to the line before the next keyword.

## Supported Solvers

Both **Abaqus** and **CalculiX (CCX)** are supported. The two formats are very similar. Since both solvers use the same file extensions, select the language mode manually via the status bar when needed.

## Supported File Types

| Extension | Description |
|-----------|-------------|
| `.inp` | Abaqus / CalculiX input file |
| `.inc` | Abaqus / CalculiX include file |

## Abaqus Input File Format

Abaqus input files use a keyword-based format:

```
** This is a comment
*HEADING
 My FEA Model
*PART, NAME=Part-1
*NODE
      1,           0.,           0.,           0.
      2,           1.,           0.,           0.
*ELEMENT, TYPE=C3D8R, ELSET=Part-1-1
      1,      1,      2,      3,      4,      5,      6,      7,      8
*END PART
*ASSEMBLY, NAME=Assembly
*INSTANCE, NAME=Part-1-1, PART=Part-1
*END INSTANCE
*END ASSEMBLY
*MATERIAL, NAME=MyMaterial
*ELASTIC
 210000., 0.3
*DENSITY
 7.85E-9,
*STEP, NAME=Step-1, NLGEOM=YES
*STATIC
 0.1, 1.
*BOUNDARY
 Set-1, 1, 3
*END STEP
```

## Abaqus vs CalculiX

CalculiX (CCX) was designed to be largely input-compatible with Abaqus. Most keyword syntax, data line formats, and block structures are identical.

### Output Requests

Both solvers support `*NODE FILE` / `*EL FILE` for binary results and `*NODE PRINT` / `*EL PRINT` for text results. The binary results for Abaqus are written to a `.fil` file, while CCX writes to a `.frd` file. Both use the `.dat` extension for text results, though the format is different.

Abaqus has an additional output system that writes to an `.odb` output database (viewable in Abaqus Viewer / CAE). CalculiX has no equivalent.

| | Abaqus | CalculiX |
|---|---|---|
| PRINT keyword output | `.dat` (text) | `.dat` (text) |
| FILE keyword output | `.fil` (Abaqus results file) | `.frd` (CalculiX GraphiX / CGX) |
| Proprietary output | `.odb` (Abaqus Viewer / CAE) | None |

### Element Type Names

CCX element names generally follow Abaqus conventions (e.g. `C3D8`, `S4`, `B31`) with some extensions and omissions. Refer to the CCX documentation for the full supported element library.

## Building from Source

[Node.js](https://nodejs.org) is required.

```bash
npm install
node ./node_modules/typescript/bin/tsc -p ./
```

Press `F5` in VS Code to launch the Extension Development Host for testing.

## Packaging

```bash
node -e "require('@vscode/vsce').createVSIX({cwd: process.cwd()}).then(() => console.log('done')).catch(e => console.error(e))"
```

This produces a `.vsix` file that can be installed via **Extensions: Install from VSIX** in VS Code.
