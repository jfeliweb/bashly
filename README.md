# Free and Open Source SaaS Boilerplate with Tailwind CSS and Shadcn UI

<p align="center">
  <a href="https://react-saas.com"><img height="300" src="apps/web/public/assets/images/nextjs-starter-banner.png?raw=true" alt="Next.js SaaS Template"></a>
</p>

🚀 **SaaS Boilerplate** is a powerful and fully customizable **Turborepo monorepo** template to kickstart your SaaS applications. It includes a **Next.js** web app and a **React Native (Expo)** mobile app, both sharing the same authentication backend. Built with **Tailwind CSS** and the modular UI components of **Shadcn UI** (web) and **NativeWind** (mobile), this SaaS template helps you quickly build and launch across web and mobile with minimal effort.

Packed with essential features like self-hosted **Authentication** with [Better Auth](https://www.better-auth.com/), **Multi-Tenancy** with Team support, **Role & Permission**, Database, I18n (internationalization), Landing Page, User Dashboard, Form handling, SEO optimization, Logging, Transactional Email with [Resend](https://resend.com), File Storage with [Cloudflare R2](https://www.cloudflare.com/products/r2/), Error reporting with [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo), Testing, Deployment, and Monitoring, this SaaS template provides everything you need to get started.

Designed with developers in mind, this **Next.js Starter Kit** uses TypeScript for type safety and integrates ESLint to maintain code quality, along with Prettier for consistent code formatting. The testing suite combines Vitest and React Testing Library for robust unit testing, while Playwright handles integration and E2E testing. Continuous integration and deployment are managed via GitHub Actions. For user management, authentication is self-hosted with [Better Auth](https://www.better-auth.com/), providing email/password login, email verification, and password reset out of the box. For database operations, it uses Drizzle ORM with [Neon PostgreSQL](https://neon.tech) for type-safe, serverless database management.

Whether you're building a new SaaS app or looking for a flexible, **production-ready SaaS template**, this boilerplate has you covered. This free, open-source starter kit has everything you need to accelerate your development and scale your product with ease — across both web and mobile platforms.

Clone this project and use it to create your own SaaS. You can check the live demo at [SaaS Boilerplate](https://react-saas.com), which is a demo with a working authentication and multi-tenancy system.

### Demo

**Live demo: [SaaS Boilerplate](https://react-saas.com)**

| Landing Page | User Dashboard |
| --- | --- |
| [![Next.js Boilerplate SaaS Landing Page](apps/web/public/assets/images/nextjs-boilerplate-saas-landing-page.png)](https://react-saas.com) | [![Next.js Boilerplate SaaS User Dashboard](apps/web/public/assets/images/nextjs-boilerplate-saas-user-dashboard.png)](https://react-saas.com/dashboard) |

| Team Management | User Profile |
| --- | --- |
| [![Next.js Boilerplate SaaS Team Management](apps/web/public/assets/images/nextjs-boilerplate-saas-multi-tenancy.png)](https://react-saas.com/dashboard/organization-profile/organization-members) | [![Next.js Boilerplate SaaS User Profile](apps/web/public/assets/images/nextjs-boilerplate-saas-user-profile.png)](https://react-saas.com/dashboard/user-profile) |

| Sign Up | Sign In |
| --- | --- |
| [![Next.js Boilerplate SaaS Sign Up](apps/web/public/assets/images/nextjs-boilerplate-saas-sign-up.png)](https://react-saas.com/sign-up) | [![Next.js Boilerplate SaaS Sign In](apps/web/public/assets/images/nextjs-boilerplate-saas-sign-in.png)](https://react-saas.com/sign-in) |

| Landing Page with Dark Mode (Pro Version) | User Dashboard with Dark Mode (Pro Version) |
| --- | --- |
| [![Next.js Boilerplate SaaS Landing Page Dark Mode](apps/web/public/assets/images/nextjs-boilerplate-saas-landing-page-dark-mode.png)](https://pro-demo.nextjs-boilerplate.com) | [![Next.js Boilerplate SaaS User Dashboard Dark Mode](apps/web/public/assets/images/nextjs-boilerplate-saas-user-dashboard-sidebar-dark-mode.png)](https://pro-demo.nextjs-boilerplate.com/dashboard) |

| User Dashboard with Sidebar (Pro Version) |
| --- |
| [![Next.js Boilerplate SaaS User Dashboard Sidebar](apps/web/public/assets/images/nextjs-boilerplate-saas-user-dashboard-sidebar.png)](https://pro-demo.nextjs-boilerplate.com) |

### Features

Developer experience first, extremely flexible code structure and only keep what you need:

- 📦 [Turborepo](https://turbo.build) monorepo with shared packages
- ⚡ [Next.js](https://nextjs.org) with App Router support (Web)
- 📱 [Expo](https://expo.dev) + [React Native](https://reactnative.dev) mobile app with [NativeWind](https://www.nativewind.dev/)
- 🔥 Type checking [TypeScript](https://www.typescriptlang.org)
- 💎 Integrate with [Tailwind CSS](https://tailwindcss.com) and Shadcn UI
- ✅ Strict Mode for TypeScript and [React](https://react.dev)
- 🔒 Self-hosted authentication with [Better Auth](https://www.better-auth.com/): Sign up, Sign in, Sign out, Email verification, Password reset, and more
- 📱 Shared auth across web and mobile via [@better-auth/expo](https://www.better-auth.com/docs/plugins/expo)
- 👥 Multi-tenancy & team support: create, switch, update organization and invite team members
- 📝 Role-based access control and permissions
- 📦 Type-safe ORM with [DrizzleORM](https://orm.drizzle.team) and [Neon PostgreSQL](https://neon.tech) (serverless)
- 📧 Transactional email with [Resend](https://resend.com)
- 🗄️ File storage with [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- 🌐 Multi-language (i18n) with [next-intl](https://next-intl-docs.vercel.app/) and [Crowdin](https://l.crowdin.com/next-js)
- ♻️ Type-safe environment variables with T3 Env
- ⌨️ Form with [React Hook Form](https://react-hook-form.com)
- 🔴 Validation library with [Zod](https://zod.dev)
- 📏 Linter with [ESLint](https://eslint.org) (default NextJS, NextJS Core Web Vitals, Tailwind CSS and Antfu configuration)
- 💖 Code Formatter with [Prettier](https://prettier.io)
- 🦊 Husky for Git Hooks
- 🚫 Lint-staged for running linters on Git staged files
- 🚓 Lint git commit with Commitlint
- 📓 Write standard compliant commit messages with Commitizen
- 🦺 Unit Testing with [Vitest](https://vitest.dev) and React Testing Library
- 🧪 Integration and E2E Testing with [Playwright](https://playwright.dev)
- 👷 Run tests on pull requests with GitHub Actions
- 🎉 [Storybook](https://storybook.js.org) for UI development
- 🚨 Error Monitoring with [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo)
- ☂️ Code coverage with [Codecov](https://about.codecov.io/codecov-free-trial/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo)
- 📝 Logging with [Pino.js](https://getpino.io) and Log Management with [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate)
- 🖥️ Monitoring as Code with [Checkly](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate)
- 🎁 Automatic changelog generation with Semantic Release
- 🔍 Visual testing with Percy (Optional)
- 💡 Absolute Imports using `@` prefix
- 🗂 VSCode configuration: Debug, Settings, Tasks and Extensions
- 🤖 SEO metadata, JSON-LD and Open Graph tags
- 🗺️ Sitemap.xml and robots.txt
- ⌘ Database exploration with Drizzle Studio and CLI migration tool with Drizzle Kit
- ⚙️ [Bundler Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- 🌈 Include a FREE minimalist theme
- 💯 Maximize lighthouse score

Built-in features from Next.js:

- ☕ Minify HTML & CSS
- 💨 Live reload
- ✅ Cache busting

### Philosophy

- Nothing is hidden from you, allowing you to make any necessary adjustments to suit your requirements and preferences.
- Dependencies are updated every month
- Start for free without upfront costs
- Easy to customize
- Minimal code
- SEO-friendly
- Everything you need to build a SaaS
- 🚀 Production-ready

### Requirements

- Node.js 20+ and npm

### Getting started

Run the following command on your local environment:

```shell
git clone --depth=1 https://github.com/jfeliweb/SaaS-Boilerplate.git my-project-name
cd my-project-name
npm install
```

For your information, all dependencies are updated every month.

Then, you can run all apps (web + mobile) locally in development mode with live reload by executing:

```shell
npm run dev
```

This uses [Turborepo](https://turbo.build) to run both the Next.js web app and the Expo mobile app simultaneously.

- Open http://localhost:3000 with your favorite browser for the **web app**
- The **mobile app** will start with Expo — press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go

To run only a specific app:

```shell
# Web only
npm run dev --filter=@saas/web

# Mobile only
npm run dev --filter=@saas/mobile
```

Need advanced features? Next.js 16 & React 19, Multi-tenancy & Teams, Roles & Permissions, Shadcn UI, End-to-End Typesafety with oRPC, Stripe Payment, Light / Dark mode. Try [Next.js Boilerplate Pro](https://nextjs-boilerplate.com/pro-saas-starter-kit).

Or, need a Self-hosted auth stack (Better Auth)? Try [Next.js Boilerplate Max](https://nextjs-boilerplate.com/nextjs-multi-tenant-saas-boilerplate)

### Set up authentication

This project uses [Better Auth](https://www.better-auth.com/) for self-hosted authentication. No external service or account is required — authentication runs entirely within your own app.

In your `apps/web/.env.local` file (which is not tracked by Git), set a secret key for Better Auth:

```shell
BETTER_AUTH_SECRET=your_random_secret_key
```

The `BETTER_AUTH_URL` is already set to `http://localhost:3000` in `apps/web/.env` for local development. Update it to your production URL when deploying.

Better Auth provides email/password authentication, email verification, and password reset out of the box. The auth API is served via a Next.js catch-all route at `/api/auth/[...all]`, and the mobile app connects to the same backend using `@better-auth/expo`.

Now, you have a fully working self-hosted authentication system with Next.js and React Native: Sign up, Sign in, Sign out, Email verification, Password reset, and more.

### Set up remote database

The project uses DrizzleORM, a type-safe ORM, paired with [Neon PostgreSQL](https://neon.tech) for serverless database access. By default, the project is set up to work seamlessly with Neon and you can easily choose any PostgreSQL database provider.

To set up a remote and production database, create a free account at [Neon](https://neon.tech) and create a new project. In the Neon Dashboard, copy the connection string and add it as the `DATABASE_URL` variable in your `apps/web/.env.local` file:

```shell
DATABASE_URL=your_neon_database_url
```

### Set up transactional email

The project uses [Resend](https://resend.com) for sending transactional emails (email verification, password reset, etc.). Create a free account at [Resend](https://resend.com), obtain your API key, and add it to `apps/web/.env.local`:

```shell
RESEND_API_KEY=your_resend_api_key
```

### Set up file storage (optional)

For file uploads, the project uses [Cloudflare R2](https://www.cloudflare.com/products/r2/). Create an R2 bucket in your Cloudflare dashboard and add the following to `apps/web/.env.local`:

```shell
R2_ENDPOINT=your_r2_endpoint
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

### Translation (i18n) setup

For translation, the project uses `next-intl` combined with [Crowdin](https://l.crowdin.com/next-js). As a developer, you only need to take care of the English (or another default language) version. Translations for other languages are automatically generated and handled by Crowdin. You can use Crowdin to collaborate with your translation team or translate the messages yourself with the help of machine translation.

To set up translation (i18n), create an account at [Crowdin.com](https://l.crowdin.com/next-js) and create a new project. In the newly created project, you will be able to find the project ID. You will also need to create a new Personal Access Token by going to Account Settings > API. Then, in your GitHub Actions, you need to define the following environment variables: `CROWDIN_PROJECT_ID` and `CROWDIN_PERSONAL_TOKEN`.

After defining the environment variables in your GitHub Actions, your localization files will be synchronized with Crowdin every time you push a new commit to the `main` branch.

### Mobile app

The monorepo includes a **React Native** mobile app built with [Expo](https://expo.dev) and [NativeWind](https://www.nativewind.dev/) for Tailwind-style styling. The mobile app shares the same Better Auth backend as the web app.

**Key technologies:**
- **Expo 52** with Expo Router (file-based routing)
- **NativeWind 4** for Tailwind CSS styling in React Native
- **@better-auth/expo** for seamless authentication against the web API
- **Expo Secure Store** for secure token storage on device

**Running the mobile app:**

```shell
# Run from the monorepo root
npm run dev --filter=@saas/mobile

# Or from the mobile app directory
cd apps/mobile
npx expo start
```

**Configuration:**

The mobile app connects to the web app's auth API via `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000` for local development). The deep linking scheme is configured as `saas-mobile://` in `apps/mobile/app.json`.

**App structure:**
- `apps/mobile/app/(auth)/` — Sign in and Sign up screens
- `apps/mobile/app/(tabs)/` — Dashboard and Profile tab screens
- `apps/mobile/lib/auth-client.ts` — Better Auth client configured for Expo

### Project structure

```shell
.
├── README.md                          # README file
├── .github                            # GitHub folder
├── .husky                             # Husky configuration
├── .vscode                            # VSCode configuration
├── turbo.json                         # Turborepo configuration
├── apps
│   ├── web                            # Next.js web application
│   │   ├── .storybook                 # Storybook folder
│   │   ├── migrations                 # Database migrations
│   │   ├── public                     # Public assets folder
│   │   ├── src
│   │   │   ├── app                    # Next.js App (App Router)
│   │   │   ├── components             # Reusable components
│   │   │   ├── features               # Components specific to a feature
│   │   │   ├── libs                   # 3rd party libraries configuration
│   │   │   ├── locales                # Locales folder (i18n messages)
│   │   │   ├── models                 # Database models
│   │   │   ├── styles                 # Styles folder
│   │   │   ├── templates              # Templates folder
│   │   │   ├── types                  # Type definitions
│   │   │   └── utils                  # Utilities folder
│   │   └── tests
│   │       ├── e2e                    # E2E tests, also includes Monitoring as Code
│   │       └── integration            # Integration tests
│   └── mobile                         # Expo React Native mobile application
│       ├── app                        # Expo Router (file-based routing)
│       │   ├── (auth)                 # Auth screens (sign-in, sign-up)
│       │   └── (tabs)                 # Tab screens (dashboard, profile)
│       └── lib                        # Mobile utilities and auth client
├── packages                           # Shared packages
│   ├── api-client                     # Shared API client
│   ├── tailwind-config                # Shared Tailwind configuration
│   ├── types                          # Shared TypeScript types
│   ├── utils                          # Shared utility functions
│   └── validators                     # Shared validation schemas
└── tsconfig.json                      # Root TypeScript configuration
```

### Customization

You can easily configure Next.js SaaS Boilerplate by searching the entire project for `FIXME:` to make quick customization. Here are some of the most important files to customize:

- `apps/web/public/apple-touch-icon.png`, `apps/web/public/favicon.ico`, `apps/web/public/favicon-16x16.png` and `apps/web/public/favicon-32x32.png`: your website favicon
- `apps/web/src/utils/AppConfig.ts`: configuration file
- `apps/web/src/templates/BaseTemplate.tsx`: default theme
- `apps/web/next.config.mjs`: Next.js configuration
- `apps/web/.env`: default environment variables for the web app
- `apps/mobile/app.json`: mobile app name, slug, and scheme

You have full access to the source code for further customization. The provided code is just an example to help you start your project. The sky's the limit 🚀.

In the source code, you will also find `PRO` comments that indicate the code that is only available in the PRO version. You can easily remove or replace this code with your own implementation.

### Change database schema

To modify the database schema in the project, you can update the schema file located at `apps/web/src/models/Schema.ts`. This file defines the structure of your database tables using the Drizzle ORM library.

After making changes to the schema, generate a migration by running the following command:

```shell
npm run db:generate --filter=@saas/web
```

This will create a migration file that reflects your schema changes. The migration is automatically applied during the next database interaction, so there is no need to run it manually or restart the Next.js server.

### Commit Message Format

The project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification, meaning all commit messages must be formatted accordingly. To help you write commit messages, the project uses [Commitizen](https://github.com/commitizen/cz-cli), an interactive CLI that guides you through the commit process. To use it, run the following command:

```shell
npm run commit
```

One of the benefits of using Conventional Commits is the ability to automatically generate a `CHANGELOG` file. It also allows us to automatically determine the next version number based on the types of commits that are included in a release.

### Subscription payment with Stripe

The project is integrated with Stripe for subscription payment. You need to create a Stripe account and you also need to install the Stripe CLI. After installing the Stripe CLI, you need to login using the CLI:

```shell
stripe login
```

Then, you can run the following command to create a new price:

```shell
npm run stripe:setup-price
```

After running the command, you need to copy the price ID and paste it in `apps/web/src/utils/AppConfig.ts` by updating the existing price ID with the new one.

In your Stripe Dashboard, you are required to configure your customer portal settings at https://dashboard.stripe.com/test/settings/billing/portal. Most importantly, you need to save the settings.

In your `apps/web/.env` file, you need to update the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with your own Stripe Publishable key. You can find the key in your Stripe Dashboard. Then, you also need to create a new file named `apps/web/.env.local` and add the following environment variables in the newly created file:

```shell
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

You get the `STRIPE_SECRET_KEY` from your Stripe Dashboard. The `STRIPE_WEBHOOK_SECRET` is generated by running the following command:

```shell
npm run dev
```

You'll find in your terminal the webhook signing secret. You can copy it and paste it in your `apps/web/.env.local` file.

### Testing

All unit tests are located alongside the source code in the same directory, making them easier to find. The project uses Vitest and React Testing Library for unit testing. You can run the tests with the following command:

```shell
npm run test
```

### Integration & E2E Testing

The project uses Playwright for integration and end-to-end (E2E) testing. You can run the tests with the following commands:

```shell
npx playwright install # Only for the first time in a new environment
npm run test:e2e
```

In the local environment, visual testing is disabled, and the terminal will display the message `[percy] Percy is not running, disabling snapshots.`. By default, visual testing only runs in GitHub Actions.

### Enable Edge runtime (optional)

The App Router folder is compatible with the Edge runtime. You can enable it by adding the following lines `apps/web/src/app/layouts.tsx`:

```tsx
export const runtime = 'edge';
```

For your information, the database migration is not compatible with the Edge runtime. So, you need to disable the automatic migration in `apps/web/src/libs/DB.ts`:

```tsx
await migrate(db, { migrationsFolder: './migrations' });
```

After disabling it, you are required to run the migration manually with:

```shell
npm run db:migrate
```

You also require to run the command each time you want to update the database schema.

### Deploy to production

During the build process, database migrations are automatically executed, so there's no need to run them manually. However, you must define `DATABASE_URL` in your environment variables.

Then, you can generate a production build with:

```shell
$ npm run build
```

It generates an optimized production build of the boilerplate. To test the generated build, run:

```shell
$ npm run start
```

You also need to define the following environment variables for production:

- `BETTER_AUTH_SECRET`: a random secret key for session encryption
- `BETTER_AUTH_URL`: your production URL (e.g., `https://yourdomain.com`)
- `DATABASE_URL`: your Neon PostgreSQL connection string

This command starts a local server using the production build. You can now open http://localhost:3000 in your preferred browser to see the result.

For the **mobile app**, use [EAS Build](https://docs.expo.dev/build/introduction/) to create production builds for iOS and Android. Make sure to set `EXPO_PUBLIC_API_URL` to your production web app URL.

### Error Monitoring

The project uses [Sentry](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo) to monitor errors. In the development environment, no additional setup is needed: NextJS SaaS Boilerplate is pre-configured to use Sentry and Spotlight (Sentry for Development). All errors will automatically be sent to your local Spotlight instance, allowing you to experience Sentry locally.

For production environment, you'll need to create a Sentry account and a new project. Then, in `apps/web/next.config.mjs`, you need to update the `org` and `project` attributes in `withSentryConfig` function. Additionally, add your Sentry DSN to `apps/web/sentry.client.config.ts`, `apps/web/sentry.edge.config.ts` and `apps/web/sentry.server.config.ts`.

### Code coverage

Next.js SaaS Template relies on [Codecov](https://about.codecov.io/codecov-free-trial/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo) for code coverage reporting solution. To enable Codecov, create a Codecov account and connect it to your GitHub account. Your repositories should appear on your Codecov dashboard. Select the desired repository and copy the token. In GitHub Actions, define the `CODECOV_TOKEN` environment variable and paste the token.

Make sure to create `CODECOV_TOKEN` as a GitHub Actions secret, do not paste it directly into your source code.

### Logging

The project uses Pino.js for logging. In the development environment, logs are displayed in the console by default.

For production, the project is already integrated with [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) to manage and query your logs using SQL. To use Better Stack, you need to create a [Better Stack](https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) account and create a new source: go to your Better Stack Logs Dashboard > Sources > Connect source. Then, you need to give a name to your source and select Node.js as the platform.

After creating the source, you will be able to view and copy your source token. In your environment variables, paste the token into the `LOGTAIL_SOURCE_TOKEN` variable. Now, all logs will automatically be sent to and ingested by Better Stack.

### Checkly monitoring

The project uses [Checkly](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate) to ensure that your production environment is always up and running. At regular intervals, Checkly runs the tests ending with `*.check.e2e.ts` extension and notifies you if any of the tests fail. Additionally, you have the flexibility to execute tests from multiple locations to ensure that your application is available worldwide.

To use Checkly, you must first create an account on [their website](https://www.checklyhq.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate). After creating an account, generate a new API key in the Checkly Dashboard and set the `CHECKLY_API_KEY` environment variable in GitHub Actions. Additionally, you will need to define the `CHECKLY_ACCOUNT_ID`, which can also be found in your Checkly Dashboard under User Settings > General.

To complete the setup, update the `apps/web/checkly.config.ts` file with your own email address and production URL.

### Useful commands

#### Bundle Analyzer

Next.js SaaS Starter Kit includes a built-in bundle analyzer. It can be used to analyze the size of your JavaScript bundles. To begin, run the following command:

```shell
npm run build-stats
```

By running the command, it'll automatically open a new browser window with the results.

#### Database Studio

The project is already configured with Drizzle Studio to explore the database. You can run the following command to open the database studio:

```shell
npm run db:studio
```

Then, you can open https://local.drizzle.studio with your favorite browser to explore your database.

### VSCode information (optional)

If you are VSCode user, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

With the plugins installed in your VSCode, ESLint and Prettier can automatically fix the code and display errors. The same applies to testing: you can install the VSCode Vitest extension to automatically run your tests, and it also shows the code coverage in context.

Pro tips: if you need a project wide-type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

### Contributions

Everyone is welcome to contribute to this project. Feel free to open an issue if you have any questions or find a bug. Totally open to suggestions and improvements.

### License

Licensed under the MIT License, Copyright © 2026

See [LICENSE](LICENSE) for more information.

---

Made with ♥ by [jFeliWeb](https://jfeliweb.com)