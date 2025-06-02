import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Notifications } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import messages from '../../../messages';

const NotificationIcon = ({
  status,
  notificationColor,
}) => {
  const intl = useIntl();
  return (
    <>
      <Icon src={Notifications} className="m-0 m-auto" style={{ color: '#093055' }} alt={intl.formatMessage(messages.openNotificationTrigger)} />
      {status === 'active'
        ? (
          <span
            className={classNames(notificationColor, 'rounded-circle p-1 position-absolute')}
            data-testid="notification-dot"
            style={{
              top: '0.3rem',
              right: '0.55rem',
            }}
          />
        )
        : null}
    </>
  );
};

NotificationIcon.defaultProps = {
  status: null,
};

NotificationIcon.propTypes = {
  status: PropTypes.string,
  notificationColor: PropTypes.string.isRequired,
};

export default NotificationIcon;