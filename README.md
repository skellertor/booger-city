This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## :no_entry: Before you start :no_entry:
You are going to need to make sure the backend environment is all set up. There are several things that need to be setup prior to this template being run. Please make sure your team has completed the setup process from the [DevOPs Handoff Documentation](https://nerdunited.atlassian.net/wiki/spaces/SDK/pages/49020946/DevOps+Handoff)

## Live reference site

You can see the template in action [here](https://develop.d2h11jw6bhpbg2.amplifyapp.com/)

## Getting Started :running_woman: <a name="getting-started"></a> 

1. :exclamation::exclamation::exclamation:This project uses private npm packages from our Github package registry. In order to install the npm dependencies, you'll need to create a Github personal access token.:exclamation::exclamation::exclamation:

- Go here `https://github.com/settings/tokens`,
- Create a token, and make sure it has the `write:packages` and `read:packages` options checked
- Once it's created, on that same screen use the `Configure SSO` dropdown to authorize your token for the NerdCoreSdk organization
- Save your token on your machine as `GITHUB_TOKEN`
  - On Windows `setx GITHUB_TOKEN yourTokenHere`
  - On MacOS or Linux `echo $SHELL`
    - if you are using bash run `echo "export GITHUB_TOKEN=yourTokenHere" >> ~/.bash_profile`
    - if you are using zsh run `echo "export GITHUB_TOKEN=yourTokenHere" >> ~/.zshenv`
- Completely close and re-open your terminal / text editor to reload your shell profile

## Clone this repo :busts_in_silhouette:

You can create a copy of this repo one of two ways

1. Will create an exact copy of cores repo. Will not be specific to your brand as far as name, author, version. Follow the directions found [here](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template)

2. Will create a more customized copy by following these instructions [here](https://github.com/NerdCoreSdk/create-nerd-app#readme)

## Next steps :one: :two: :three:

Once you have the repo cloned you will need to do the following steps

1. Create a `.env.local` file in the root of this project. The env variables require firebase and backend services locations. Place the following variables in your `.env.local` file with the appropriate corresponding values:
```
 NEXT_PUBLIC_REACT_APP_FIREBASE_API_KEY=
 NEXT_PUBLIC_REACT_APP_FIREBASE_AUTH_DOMAIN=
 NEXT_PUBLIC_REACT_APP_FIREBASE_DATABASE_URL=
 NEXT_PUBLIC_REACT_APP_FIREBASE_PROJECT_ID=
 NEXT_PUBLIC_REACT_APP_FIREBASE_STORAGE_BUCKET=
 NEXT_PUBLIC_REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
 NEXT_PUBLIC_REACT_APP_FIREBASE_APP_ID=

 NEXT_PUBLIC_MEMBERSHIP_SERVICE=
 NEXT_PUBLIC_ETHCONNECT_SERVICE=
 NEXT_PUBLIC_SHOPPING_SERVICE=
 NEXT_PUBLIC_WALLET_SERVICE=

 NEXT_PUBLIC_EMAIL_CONFIRMATION_LINK_URL= This is the link provided to the user in the email and should direct the user to the email confirmation page in your application (email-confirmation in this template)
 NEXT_PUBLIC_FORGOT_EMAIL_CONFIRMATION_LINK_URL=This is the link provided to the user in the email and should direct the user to the reset password page in your application (reset-password in this template)
 NEXT_PUBLIC_REFERRAL_LINK_URL=
```

2. Run `npm i` to install dependencies. :bomb:If you did not set a github token this will fail. Go back to [Getting Started](#getting-started)
3. run `npm run dev` to start the development server

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Theme :nail_care:

We have included a package called `@nerdcordsdk/nerd-core-ui`. This package includes a `ThemeProvider` component that accepts a theme object. Currently we only accept three properties

1. `primaryColor` - Any hex color
2. `secondaryColor` - Any hex color
3. `brandName` - Any string

The `ThemeProvider` is already implemented. If you wish to change the theme of the `@nerdcoresdk/nerd-core-ui` components, you need to edit `theme/theme.js` file.

## _app.css 
There is also a file in the `/pages` directory called `_app.css`. Unlike all the other css files, this is not a css module, so it is global. You can override any style defined within `@nerdcoresdk/nerd-core-ui` (component library) within this file.
## Nerd Core Component Library:books:
This template relies heavily on our prebuilt composite components. However, the individual components are available for use as well if the composite component does not suit your needs.  Please see our [storybook documentation](https://nerdcoresdk.github.io/nerd-core-ui/) page for everything that is available.  The canvas tab will allow you to interact with each component, while the docs tab will provide detailed information to help you better understand the component, it's usage, and any related components. 

## Nerd Core Auth
This template utilizes an auth provider located in the [nerd-core-auth](https://github.com/NerdCoreSdk/nerd-core-auth) repo. This file is built using firebase authentication integration from 'firebase/auth'. It is a middle layer between the template, and the backend core code in order to perform firebase validation, user creation, login, sessions, password management, and signing out. The firebase token is enriched by the backend and is used to user validation for api calls as well as user identification in the template.

:rotating_light: :rotating_light: :rotating_light:

> Disclaimer: This repo is a work in progress. It will be updated frequently to accommodate features that most brands have in common. This is meant to be a starting point to get you up and running. We will also be updating two internal dependencies `@nerdcoresdk/nerd-core-ui` and `nerdcoresdk/nerd-core-auth`. Updates to dependency features, styles, and bugfixes can easily be integrated by incrementing the version number in the `package.json`. We follow semver standards and practices.


