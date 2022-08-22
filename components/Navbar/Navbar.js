import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import jwtDecode from 'jwt-decode';

import { routes } from '../../routes/routes';
import { useAuth } from '../../hooks/useAuth';
import { useIsMobile } from '../../hooks/useIsMobile';

import menuIcon from '../../assets/icons/fa-bars.svg';

import styles from './navbar.module.css';

import { Menu } from '@nerdcoresdk/nerd-core-ui';

export function Navbar() {
  const { signout, enrollmentPhase, enrollmentPhases, status, authStatuses, user } =
    useAuth();
  const isMobile = useIsMobile();
  const router = useRouter();

  const userName = useMemo(() => {
    const token = user.accessToken;
    if (token) {
      const userTokenData = jwtDecode(token);
      return userTokenData.memberName;
    }
  }, [user]);

  const menuItemsLoggedIn = useMemo(() => {
    const items = [];
    isMobile &&
      items.push(
        ...[
          {
            key: routes.purchase.key,
            value: routes.purchase.value,
            icon: routes.purchase.icon,
            handleClick: () => router.push(routes.purchase.path),
          },
          {
            key: routes.dashboard.key,
            value: routes.dashboard.value,
            icon: routes.dashboard.icon,
            handleClick: () => router.push(routes.dashboard.path),
          },
        ]
      );

    enrollmentPhase === enrollmentPhases.COMPLETED &&
      items.push(
        ...[
          {
            key: routes.referFriend.key,
            value: routes.referFriend.value,
            icon: routes.referFriend.icon,
            handleClick: () => router.push(routes.referFriend.path),
          },
        ]
      );
    items.push(
      {
        key: routes.changePassword.key,
        value: routes.changePassword.value,
        icon: routes.changePassword.icon,
        handleClick: () => router.push(routes.changePassword.path),
      },
      {
        key: routes.logout.key,
        value: routes.logout.value,
        icon: routes.logout.icon,
        handleClick: () => signout(),
      }
    );
    return items;
  }, [signout, router, enrollmentPhase, enrollmentPhases, isMobile]);

  const menuItemsLoggedOut = useMemo(() => {
    const items = [
      {
        key: routes.login.key,
        value: routes.login.value,
        icon: routes.login.icon,
        handleClick: () => router.push(routes.login.path),
      },
      {
        key: routes.signup.key,
        value: routes.signup.value,
        icon: routes.signup.icon,
        handleClick: () => router.push(routes.signup.path),
      },
    ];
    isMobile &&
      items.push({
        key: routes.purchase.key,
        value: routes.purchase.value,
        icon: routes.purchase.icon,
        handleClick: () => router.push(routes.purchase.path),
      });
    return items;
  }, [isMobile, router]);

  const navbarItems = useMemo(() => {
    const items = [];
    !isMobile &&
      items.push(
        <span
          key={routes.purchase.key}
          className={
            styles[router.pathname === routes.purchase.path ? 'activePage' : 'nav-item']
          }
        >
          <Link href={routes.purchase.path}>
            <a>{routes.purchase.value}</a>
          </Link>
        </span>
      );
    !isMobile &&
      status === authStatuses.SIGNED_IN &&
      enrollmentPhase === enrollmentPhases.COMPLETED &&
      items.push(
        <span
          key={routes.dashboard.key}
          className={
            styles[router.pathname === routes.dashboard.path ? 'activePage' : 'nav-item']
          }
        >
          <Link href={routes.dashboard.path}>
            <a>{routes.dashboard.value}</a>
          </Link>
        </span>
      );
    return items;
  }, [isMobile, router, status, authStatuses, enrollmentPhase, enrollmentPhases]);

  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-brand-container']}>
        <span>
          <Link
            href={routes.home.path}
            className={
              styles[router.pathname === routes.home.path ? 'activePage' : 'nav-item']
            }
          >
            <a>
              <Image
                src={routes.home.icon}
                alt="company logo"
                layout="fixed"
                width="120"
                height="40"
                priority
              />
            </a>
          </Link>
        </span>
        <span className={styles['navbar-link-container']}>{navbarItems}</span>
      </div>
      <div className={styles['navbar-auth-container']}>
        {status === authStatuses.SIGNED_IN && (
          <span className={styles['auth-item']}>
            <Menu items={menuItemsLoggedIn} showIcons={true} menuLabel={userName} />
          </span>
        )}
        {status === authStatuses.SIGNED_OUT && !isMobile && (
          <>
            <span className={styles['auth-item']}>
              <Link href={routes.login.path}>
                <a>Log In</a>
              </Link>
            </span>
            <span className={styles['auth-item']}>
              <Link href={routes.signup.path}>
                <a>Sign Up</a>
              </Link>
            </span>
          </>
        )}
        {status === authStatuses.SIGNED_OUT && isMobile && (
          <span className={styles['auth-item']}>
            <Menu
              items={menuItemsLoggedOut}
              showIcons={true}
              menuLabel={userName}
              menuLabelIcon={isMobile && menuIcon.src}
            />
          </span>
        )}
      </div>
    </nav>
  );
}
