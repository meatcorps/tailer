# Tailer

![Maintained][maintained-badge]
[![Make a pull request][prs-badge]][prs]
[![License][license-badge]](LICENSE.md)

# Introduction

Simple tail application optimized for log4net. Based on Angular 12, Ace Editor and Electron.

Thank you Maxime Gris fpr the awesome Angular + Electron Bootstrap project [Click here for github page](https://github.com/maximegris/angular-electron)

## Getting Started (Original instruction from the bootstrap)

*Clone this repository locally (changed the url to this repo):*

``` bash
git clone https://github.com/meatcorps/tailer.git
```

*Install dependencies with npm (used by Electron renderer process):*

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager.

If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

*Install NodeJS dependencies with npm (used by Electron main process):*

``` bash
cd app/
npm install
```

Why two package.json ? This project follow [Electron Builder two package.json structure](https://www.electron.build/tutorials/two-package-structure) in order to optimize final bundle and be still able to use Angular `ng add` feature.

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload!

The application code is managed by `app/main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200), and an Electron window. \
The Angular component contains an example of Electron and NodeJS native lib import. \
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `app/main.ts`.

## Project structure

|Folder|Description|
| ---- | ---- |
| app | Electron main process folder (NodeJS) |
| src | Electron renderer process folder (Web / Angular) |


## Included Commands

| Command                  | Description                                                                          |
|--------------------------|--------------------------------------------------------------------------------------|
| `npm run build`          | Build the app. Your built files are in the /dist folder.                             |
| `npm run build:prod`     | Build the app with Angular aot. Your built files are in the /dist folder.            |
| `npm run electron:local` | Builds your application and start electron                                           |
| `npm run electron:build` | Builds your application and creates an app consumable based on your operating system |

**Your application is optimised. Only /dist folder and NodeJS dependencies are included in the final bundle.**

## Links:

* [Ace editor](https://ace.c9.io/)
* [Angular](https://angular.io/)
* [Electron](https://www.electronjs.org/)


[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/meatcorps/tailer/blob/master/LICENSE.md
[prs-badge]: https://img.shields.io/badge/PRs-welcome-red.svg
[prs]: http://makeapullrequest.com
