import logoIcon from '../assets/nerdLogo.svg';
import loginIcon from '../assets/icons/arrow-right-to-bracket-light.svg';
import logoutIcon from '../assets/icons/Log-Out.svg';
import signupIcon from '../assets/icons/user-plus-light.svg';
import referIcon from '../assets/icons/Refer-a-Friend.svg';
import resetIcon from '../assets/icons/Password-Reset.svg';
import purchaseIcon from '../assets/icons/basket-shopping.svg';
import dashboardIcon from '../assets/icons/chart-column.svg';

export const routes = {
  login: {
    path: '/login',
    key: 'login',
    value: 'Login',
    icon: loginIcon.src,
  },
  logout: {
    path: '/logout',
    key: 'logout',
    value: 'Logout',
    icon: logoutIcon.src,
  },
  signup: {
    path: '/signup',
    key: 'signup',
    value: 'Signup',
    icon: signupIcon.src,
  },
  emailCheck: {
    path: '/email-check',
    key: 'email-check',
    value: 'Email check',
  },
  home: {
    path: '/',
    key: 'home',
    value: 'Home',
    icon: logoIcon.src,
  },
  purchase: {
    path: '/purchase',
    key: 'purchase',
    value: 'Purchase',
    icon: purchaseIcon.src,
  },
  dashboard: {
    path: '/dashboard',
    key: 'dashboard',
    value: 'Dashboard',
    icon: dashboardIcon.src,
  },
  emailConfirmation: {
    path: '/email-confirmation',
    key: 'email-confirmation',
    value: 'Email Confirmation',
  },
  agreements: {
    path: '/agreements',
    key: 'agreements',
    value: 'Agreements',
  },
  status: {
    path: '/status',
    key: 'status',
    value: 'Status',
  },
  referFriend: {
    path: '/refer-a-friend',
    key: 'refer-a-friend',
    value: 'Refer a friend',
    icon: referIcon.src,
  },
  setupWallet: {
    path: '/setup-wallet',
    key: 'setup-wallet',
    value: 'Setup wallet',
  },
  resetPassword: {
    path: '/reset-password',
    key: 'reset-password',
    value: 'Reset password',
    icon: resetIcon.src,
  },
  changePassword: {
    path: '/change-password',
    key: 'change-password',
    value: 'Change password',
    icon: resetIcon.src,
  },
};
