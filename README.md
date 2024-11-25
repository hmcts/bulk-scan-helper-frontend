# bulk-scan-helper-frontend

## Getting Started

### Prerequisites

Running the application requires the following tools to be installed in your environment:

- [Node.js](https://nodejs.org/) v12.0.0 or later
- [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com)

### Running the application

Install dependencies by executing the following command:

```bash
yarn install
```

Bundle:

```bash
yarn webpack
```

Run:

```bash
yarn start
```

The applications's home page will be available at http://localhost:8787
Please note you'll need to add cert and private pem files to src/main/resources.
Please contact a member of the bulk scan team for these files.
You'll also need to add demo_subscription_key, aat_subscription_key and
perftest_subscription_key as environment variables. These are available in reform-scan-{env}
key vaults under the value for 'bulk-scan-team-cft-apim-subscription-key'.
You'll also need to have GlobalProtect running to allow the sas token to be retrieved.

### Running with Docker

Create docker image:

```bash
docker-compose build
```

Run the application by executing the following command:

```bash
docker-compose up
```

This will start the frontend container exposing the application's port
(set to `8787` in this template app).

In order to test if the application is up, you can visit https://localhost:8787 in your browser.
You should get a very basic home page (no styles, etc.).

## Developing

### Code style

We use [ESLint](https://github.com/typescript-eslint/typescript-eslint)
alongside [sass-lint](https://github.com/sasstools/sass-lint)

Running the linting with auto fix:

```bash
yarn lint --fix
```

### Running the tests

This template app uses [Jest](https://jestjs.io//) as the test engine. You can run unit tests by executing
the following command:

```bash
yarn test
```

Here's how to run functional tests (the template contains just one sample test):

```bash
yarn test:routes
```

Running accessibility tests:

```bash
yarn test:a11y
```

Make sure all the paths in your application are covered by accessibility tests (see [a11y.ts](src/test/a11y/a11y.ts)).

### Security

#### CSRF prevention

[Cross-Site Request Forgery](https://github.com/pillarjs/understanding-csrf) prevention has already been
set up in this template, at the application level. However, you need to make sure that CSRF token
is present in every HTML form that requires it. For that purpose you can use the `csrfProtection` macro,
included in this template app. Your njk file would look like this:

```
{% from "macros/csrf.njk" import csrfProtection %}
...
<form ...>
  ...
    {{ csrfProtection(csrfToken) }}
  ...
</form>
...
```

#### Helmet

This application uses [Helmet](https://helmetjs.github.io/), which adds various security-related HTTP headers
to the responses. Apart from default Helmet functions, following headers are set:

- [Referrer-Policy](https://helmetjs.github.io/docs/referrer-policy/)
- [Content-Security-Policy](https://helmetjs.github.io/docs/csp/)

There is a configuration section related with those headers, where you can specify:

- `referrerPolicy` - value of the `Referrer-Policy` header

Here's an example setup:

```json
    "security": {
      "referrerPolicy": "origin",
    }
```

Make sure you have those values set correctly for your application.

### Healthcheck

The application exposes a health endpoint (https://localhost:8787/health), created with the use of
[Nodejs Healthcheck](https://github.com/hmcts/nodejs-healthcheck) library. This endpoint is defined
in [health.ts](src/main/routes/health.ts) file. Make sure you adjust it correctly in your application.
In particular, remember to replace the sample check with checks specific to your frontend app,
e.g. the ones verifying the state of each service it depends on.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
