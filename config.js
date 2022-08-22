export const config = {
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  brand: {
    emailConfirmationLinkUrl: process.env.NEXT_PUBLIC_EMAIL_CONFIRMATION_LINK_URL,
    referralLinkUrl: process.env.NEXT_PUBLIC_REFERRAL_LINK_URL,
    emailForgotPasswordLinkUrl:
      process.env.NEXT_PUBLIC_FORGOT_EMAIL_CONFIRMATION_LINK_URL,
  },
  core: {
    ethConnectUrl: process.env.NEXT_PUBLIC_ETHCONNECT_SERVICE,
    membershipServiceUrl: process.env.NEXT_PUBLIC_MEMBERSHIP_SERVICE,
    shoppingServiceUrl: process.env.NEXT_PUBLIC_SHOPPING_SERVICE,
    walletServiceUrl: process.env.NEXT_PUBLIC_WALLET_SERVICE,
  },
  firebase: {
    appId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseUrl: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  },
};
