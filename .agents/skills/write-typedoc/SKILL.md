---
name: write-typedoc
description: Define a guideline for writing typedoc comments for modules in packages/core
applyTo:
  - packages/core/src/**/*.ts
---

# Writing typedoc

This skill will help you to write typedoc comments for modules in packages/core.

## Typedoc formats

- TSdoc format: https://tsdoc.org/

## Expected inputs

A segment of filename.

## Step by step guide

1. Identify the file name segment
2. Inside each file, find the exported items: class, interfaces, function, variables
3. Write typedoc comments for each exported item, except the @example section.
4. Ask user to write a summary of an example they want to add to @example, including an option "I
   will write it myself". If they pick "I will write it myself", skip the @example section.
5. Show the file with typedoc comments

## Example

Input: `builder/index.ts`

Output: Refers to `core/src/builder/index.ts` file. You can read the comment inside this file for
further references.

## Don't

- Do not add comments to test files. The test file name may contain these formats:
  - `*.test.ts`
  - `*.spec.ts`
