# Contributing

First off, thank you for considering contributing to this project. Here are a few things you may find helpful.

## Prerequisites

In order to work on this project you'll need git and a recent version of Node.js (ideally
the [gallium](https://nodejs.org/download/release/v16.16.0/) LTS release).  
[Nvm](https://github.com/nvm-sh/nvm) can be used to automatically select the correct version enforced
by [.nvmrc](./.nvmrc), see [Deeper Shell integration](https://github.com/nvm-sh/nvm#deeper-shell-integration).

## Project setup

```shell
$ git clone https://github.com/polito/students-app.git # Clone the repo
$ cd students-app
$ npm install # Install dependencies
$ npx pod-install # Install pods
$ npm run start # Start React Native server
```

See [Running on Device](https://reactnative.dev/docs/running-on-device) for guidance on how to prepare your
environment to run the app.

## iOS local development

In order to build and run the application locally (especially if you're not part of the official Apple Development Team)
you'll have to enable the `Automatically manage signing` option in XCode (students.xcworkspace > students > Signing &
Capabilities).

Changes to this configuration should not be committed to the repository: the pre-commit hook will warn you if you try to
do so and give you instructions on how to proceed.

## Project structure

The project uses feature modules to keep the main areas semantically organized. Each module should be divided by entity
type (`components`, `hooks`, `styles`, `screens`). The `core` module contains general-purpose items, used across the
app.

The `lib` folder is used to isolate library/design-system-level components that one day may be extracted into a
dedicated package for reuse.

```
├── assets
├── src
│   ├── App.tsx              # App entry point
│   ├── core                 # Core module
│   │   ├── components
│   │   │   └── RootNavigator.tsx
│   │   ├── hooks
│   │   └── screens
│   ├── features             # Feature modules
│   │   ├── teaching
│   │   │   ├── components
│   │   :   ├── hooks
│   │       └── screens
│   └── utils                # Utilities
└── lib                      # Library modules
```

## Npm scripts

| Name          | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `start`       | Start the React Native dev server                                           |
| `android`     | Start the app on Android device                                             |
| `ios`         | Start the app on iOS device                                                 |
| `lint`        | Lints and fixes the code using ESLint (use `lint:check` to run checks only) |
| `format`      | Formats the code using Prettier (use `format:check` to run checks only)     |
| `types:check` | Runs static type checking                                                   |
| `check`       | Runs all code checks                                                        |
| `commit`      | Runs commitlint's CLI                                                       |

## Code style

While not strictly enforced through formatting, conformance
to [Google's TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
is encouraged. Notably, here are some rules we think are important:

- Don't use `// @ts-ignore` comments. Try to use type narrowing/casting/patching and, when inevitable,
  use `// @ts-expect-error` comments describing the cause of the error.
- Do not mark interfaces specially (`IMyInterface` or `MyFooInterface`) unless it's idiomatic in its environment.
- Respect identifiers casing.
- When possible, use lambda expressions instead of functions.
- Don't leave commented statements without a textual explanation.

## Performance considerations

- Avoid introducing bulky libraries for common actions that can be performed with built-ins or internal utils.
- Discuss the adoption of libraries with a big impact on bundle size with the rest of the team.
- If possible, avoid default or namespace imports (`import * as`) and other constructs that impact tree-shaking.

## Git workflow

### Commits

We use [Conventional Commits](https://conventionalcommits.org/) to keep a consistent style and automatically generate
changelog entries for new releases. The `npm run commit` script can be of help with this: it runs the commitlint cli to help you
write good commit messages.

### Git flow

We use a [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/)-like branching model. In short:

- `main` is the stable trunk.
- `develop` is the development trunk.
- Use `feature/...` branches to work on new features.
- Use `hotfix/...`branches to perform urgent fixes.
- When useful, add a scope to your commits (ie `feat(teaching): implement trascript page`). Don't repeat branch
  prefixes here.
- Use kebab-case for branch names and scopes (ie `feature/data-fetching`).
- Use commit footers to reference related issues (ie `Refs #10`). Be sure to mark resolved issues with `Closes/Fixes #<issue_number>`.

> ⚠️ Respecting these rules is important in order to obtain a clean and coherent changelog. If you have any doubt don't
> hesitate to ask for help.

### Hooks

We use git hooks to automatically check, lint and format the code and commit messages.

### Internal contribution process

- Work on a branch according to the rules described above.
- Carefully review any linting/formatting errors (ask for help if you don't know how to resolve them).
- If you can, rebase or pre-merge your branch before submitting the PR.
- Open a PR against the relevant destination branch.

### External contribution process

- Fork the repo.
- Work on a branch according to the rules described above.
- Carefully review any linting/formatting errors (ask for help if you don't know how to resolve them).
- Open a PR against `main`.
