# CONTRIBUTING

There are development conventions in this repository.

Main purpose is organizing and reminding conventions for me ([aKuad](https://github.com/aKuad)).

## Workflow conventions

### 1 issue, 1 branch, 1 PR

Follow this workflow:

1. Create an issue (what describe required work)
2. Create a branch and start working on it
3. Sometimes push the working branch
4. Create a pull request for the working branch merge to `main`
5. Confirm the pull request

So do not create branches or PRs without issues.

### Issue template selecting and branch naming

| Issue template | Branch naming | Description                                             |
| -------------- | ------------- | ------------------------------------------------------- |
| -              | `main`        | Default branch - do not commit here directly            |
| Feature add    | `feature/*`   | Feature add - make something new                        |
| Feature fix    | `fix/*`       | Feature fix - something need modification               |
| Code refactor  | `refactor/*`  | Code refactoring - make code better, no feature changes |
| Documentation  | `doc/*`       | Documentation editing                                   |
| Miscellaneous  | `misc/*`      | Other of them                                           |

Put words for describe the work into `*`. Multiple words join with `-`. (e.g. `feature/work-desc`)

## Coding conventions (general)

### Functions and variables (etc.) naming

Follow [RFC 430](https://github.com/rust-lang/rfcs/blob/master/text/0430-finalizing-naming-conventions.md).

But in JavaScript, constant variables can be written in lower_snake_case. Because there are many constant variables in JavaScript (const object members won't be protected from writing), then many UPPER CHARACTERS in the code is bad looks.

### Files naming

| Item                        | Convention (also `.js` is) |
| --------------------------- | -------------------------- |
| Class definition module     | `UpperCamelCase.py`        |
| Functions definition module | `snake_case.py`            |

## Coding conventions (tests)

As standard, follow [Coding conventions (general)](#coding-conventions-general). Then additionally, follow below.

### Files naming prefix

| Item                                         | Prefix   |
| -------------------------------------------- | -------- |
| Automated unit test                          | `Test_*` |
| Manual unit test (e.g. UI module)            | `Try_*`  |
| Test support utility (e.g. temporary server) | `Util_*` |

### Functions / methods naming prefix

| Item                                               | Prefix   |
| -------------------------------------------------- | -------- |
| Main of test                                       | `test_*` |
| Test support function (e.g. dummy data generating) | `part_*` |

## Messages syntax conventions

### Commit message

| Syntax       | Description                   |
| ------------ | ----------------------------- |
| `Add: <mes>` | Made something new            |
| `Mod: <mes>` | Something needed modification |
| `Fix: <mes>` | Something was wrong           |

Put a short description and reasons of commit into `<mes>`. Reasons are better.

### Commit sign-off

Put sign-off into each commit message.

e.g.

```txt
commit message here

Signed-off-by: aKuad <53811809+aKuad@users.noreply.github.com>
```

On git CLI, you can put sign-off easily with `-s` option.

```sh
git commit -s -m "commit message here"
```

### Pull request title

To create a pull request, 1 related issue requires. (1 issue, 1 branch, 1 PR)

```txt
related issue title (#issue_id)
```

e.g.

```txt
Module creation for core feature (#1)
```

### Merge commit message

```txt
related issue title (Issue #issue_id, PR #pr_id)
```

e.g.

```txt
Module creation for core feature (Issue #1, PR #2)
```
