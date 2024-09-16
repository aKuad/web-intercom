# Tests usage and coding conventions

## Usage

### JavaScript automated tests

```sh
# Set current directory
cd js_denotest

# Run tests
deno test **Test*.js

# For parallel run
deno test --parallel **Test*.js

# For report coverage
deno test --coverage **Test*.js
deno coverage
```

### JavaScript manual tests

Work in progress

## Coding conversions

As standard, follow [Coding conventions](../../CONTRIBUTING.md#coding-conventions). Then follow below.

### Files naming prefix

| Item                                         | Prefix   |
| -------------------------------------------- | -------- |
| Automated unit test                          | `Test_*` |
| Manual unit test                             | `Try_*`  |
| Test support utility (e.g. temporary server) | `Util_*` |

> [!NOTE]
>
> 'Automated unit test' means tests what can check pass/fail automatically.
>
> 'Manual unit test' means test what requires behavior checking by human (e.g. UI module, sound playing module).

### Functions / methods naming prefix

| Item                                               | Prefix        |
| -------------------------------------------------- | ------------- |
| Main of automated test (success expected)          | `test_true_*` |
| Main of automated test (fail/error expected)       | `test_err_*`  |
| Main of manual test                                | `try_*`       |
| Test support function (e.g. dummy data generating) | `part_*`      |

For `js_vitest`, there are no main functions (`test_true_*` and `test_err_*`). Alternatively, apply `describe()` naming convention.

| Item                      | `describe()` name |
| ------------------------- | ----------------- |
| Success expected case     | `true_cases`      |
| Fail/error expected cases | `err_cases`       |
