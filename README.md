# GYM 11ty

[![Netlify Status](https://api.netlify.com/api/v1/badges/655fce6b-0f21-4083-8b06-2d87de788b79/deploy-status)](https://app.netlify.com/sites/gym-11ty/deploys)


## Prerequisites
- [NVM - Node Version Manager](https://github.com/nvm-sh/nvm)
- [node.js](https://nodejs.org/)

## Installation
Check to see which version(s) of node you've got installed:
```
nvm list
```

If the list doesn't include the version referenced in `.nvmrc`, be sure to install it:
```
nvm install 22.15
```

Switch to the referenced version:

```
nvm use
```

Install dependencies:
```
npm install
```

## Getting Started
Once installed, there are two ways to get this running, depending on your needs.

### 1. Default
Just run:
```
npm run dev
```
The server will be available at [http://localhost:4040](http://localhost:4040).

### 2. Running in Parallel with Tutor

This approach uses netlify-cli, which has the advantage of serving up relevant CORS headers, redirects, etc. This useful for running locally in parallel with other applications (such as the Tutor distribution of Open edX).

There are two modes of running a parallel 11ty instance along with Tutor: `dev:tutor` and `local:tutor`.

#### tutor:local

An emulation of the production tutor. All MFEs run without ports set.

`npm run local:tutor`

#### tutor:dev

For local development only. The MFEs are set to run with their ports.

`npm run dev:tutor`

### Continued...
In either case, the server will open a browser automatically to [http://localhost:8888](http://localhost:8888).


**Note:** Prior to starting up Tutor, you may need to add `127.0.0.1 edly.io` to your `/etc/hosts` file. Once that's done, you should be able to access [http://edly.io:8888](http://edly.io:8888).

This static site generates a JSON feed at `/api/config.json`, which is consumed by the various Open edX components - [the theme](https://github.com/gymnasium/gym-theme), the MFEs, and our [customized MFE frontend components](https://github.com/gymnasium/gym-frontend-components).

### References
- [Eleventy](https://www.11ty.dev/)

#### Open EdX
- [Paragon Design System](https://paragon-openedx.netlify.app/)
- [Tutor](https://github.com/overhangio/tutor)

#### Nunjucks
- [Nunjucks Templating](https://mozilla.github.io/nunjucks/templating.html)
- [Check for a string in an array – Liquid vs Nunjucks](https://bryanlrobinson.com/blog/using-nunjucks-if-expressions-to-create-an-active-navigation-state-in-11ty/)
