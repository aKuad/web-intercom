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

## Coding conventions

> [!IMPORTANT]
>
> For test code, there are some different conventions. See: [src/tests/README.md](src/tests/README.md)

### Source files location

| Location      | Items                                      |
| ------------- | ------------------------------------------ |
| `src/modules` | TS modules for only server side            |
| `src/pages`   | HTML pages of client UI                    |
| `src/static`  | JS modules for client or server side       |
| `src/tests`   | Test code of modules in `modules`/`static` |

### Files naming

| Item                        | Convention (also `.ts` is) |
| --------------------------- | -------------------------- |
| Class definition module     | `UpperCamelCase.js`        |
| Functions definition module | `snake_case.js`            |

### Language .ts or .js

For server side code, use language TypeScript `.ts`.

TypeScript can runs on server side, not on client side. Then `.ts` indicates only for server side code.

### Functions and variables (etc.) naming

Follow [RFC 430](https://github.com/rust-lang/rfcs/blob/master/text/0430-finalizing-naming-conventions.md).

But in JavaScript, constant variables can be written in lower_snake_case. Because there are many constant variables in JavaScript (const object members won't be protected from writing), then many UPPER CHARACTERS in the code is bad looks.

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
