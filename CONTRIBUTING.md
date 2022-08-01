# Contributing

First off, thank you for considering contributing to this project. Here are a few things you may find helpful.

## Prerequisites

In order to work on this project you'll need git and a recent version of Node.js (ideally
the [gallium](https://nodejs.org/download/release/v16.16.0/) LTS release).  
[Nvm](https://github.com/nvm-sh/nvm) can be used to automatically select the correct version enforced
by [.nvmrc](./.nvmrc), see [Deeper Shell integration](https://github.com/nvm-sh/nvm#deeper-shell-integration).

## Project structure

```
├── assets
├── src
│   ├── App.tsx              # App entry point
│   ├── core                 # Core module
│   │   ├── components
│   │   │   └── TabBar.tsx
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

| Name    | Description                                                                     |
| ------- | ------------------------------------------------------------------------------- |
| start   | Start a local dev server for the app                                            |
| android | Opens your app in Expo Go on a connected Android device                         |
| ios     | Opens your app in Expo Go in a currently running iOS simulator on your computer |
| web     | Opens your app in a web browser                                                 |
| eject   | Create native iOS and Android project files before building natively            |

## Code style

While not strictly enforced through formatting, conformance
to [Google's TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
is encouraged.

## Git workflow

### Commits

We use [Conventional Commits](https://conventionalcommits.org/) to keep a consistent style and automatically generate
changelog entries for new releases.

### Git flow

We use a [Git Flow](https://danielkummer.github.io/git-flow-cheatsheet/)-like branching model. In short:

- `main` is the stable trunk,
- `develop` is the development trunk,
- use `feature/...` branches to work on new features,
- use `hotfix/...`branches to perform urgent fixes,
- use hyphen separators (ie `feature/data-fetching`),
- use commit footers to reference related issues (ie `Refs #10`, `Closes #10` etc.).

### Hooks

We use git hooks to automatically lint and format the code and commit messages.

### PR process

- Fork the repo
- Work on a branch according to the flow rules described above
- Open a PR against `main`
