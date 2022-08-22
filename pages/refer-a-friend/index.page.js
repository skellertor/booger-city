import { useEffect, useState } from 'react';

import { ReferAFriend as ReferFriend } from '@nerdcoresdk/nerd-core-ui';

import { theme } from '../../theme/theme';
import { useAuth } from '../../hooks/useAuth';
import { config } from '../../config';
import { routes } from '../../routes/routes';
import image from '../../assets/ReferAFriend.svg';
import styles from './refer-a-friend.module.css';

export default function ReferAFriend({}) {
  const { user } = useAuth();
  const [userClaim, setUserClaim] = useState({});
  const [referLink, setReferLink] = useState('');

  useEffect(() => {
    user
      .getIdTokenResult()
      .then((currentUserClaims) => setUserClaim(currentUserClaims.claims));
  }, []);

  useEffect(() => {
    setReferLink(
      `${config.brand.referralLinkUrl}${routes.signup.path}?sponsor=${userClaim.memberNumber}`
    );
  }, [userClaim]);

  return (
    <div className={styles.referFriendPage}>
      <ReferFriend
        referralLink={referLink}
        brandName={theme.brandName}
        imageSrc={image.src}
      />
    </div>
  );
}

ReferAFriend.protectedRoute = true;
