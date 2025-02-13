# Tests usage and coding conventions

## Usage

### JavaScript automated tests

```sh
# Set current directory
cd js_denotest

# Run tests
deno test --allow-env --allow-ffi --allow-read

# For parallel run
deno test --parallel --allow-env --allow-ffi --allow-read

# For report coverage
deno test --coverage --allow-env --allow-ffi --allow-read
deno coverage
```

> [!NOTE]
>
> Options `--allow-env --allow-ffi` for using a npm package `atem-connection`.
>
> An option `--allow-read` for test data `atem-state-data-video.json` loading by `atem_tally_extract.test.ts`.

### JavaScript manual tests

Work in progress

## Coding conversions

As standard, follow [Coding conventions](../../CONTRIBUTING.md#coding-conventions). Then follow below.

### Files place & naming convention

| Item                                             | convention               |
| ------------------------------------------------ | ------------------------ |
| Automated unit test                              | `*.test.js` (also `.ts`) |
| Manual unit test                                 | `Try_*`                  |
| Test support utility (e.g. random data generate) | `test-util/*.js`         |

> [!NOTE]
>
> 'Automated unit test' means tests what can check pass/fail automatically.
>
> 'Manual unit test' means test what requires behavior checking by human (e.g. UI module, sound playing module).

### Automated test functions naming

| Item                      | Test function name |
| ------------------------- | ------------------ |
| Success expected case     | `true_cases`       |
| Fail/error expected cases | `err_cases`        |

No specially conventions for test step function name.

### Manual test functions naming prefix

| Item                                               | Prefix   |
| -------------------------------------------------- | -------- |
| Main of manual test                                | `try_*`  |
| Test support function (e.g. dummy data generating) | `part_*` |
