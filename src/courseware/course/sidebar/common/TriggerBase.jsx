import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

const SidebarTriggerBase = ({
  onClick,
  ariaLabel,
  children,
  isActive,
}) => (
  <button
    className={classNames(
      'border align-items-center align-content-center d-flex notification-btn rounded-lg',
      {
        'border-light-400 bg-transparent': !isActive,
      },
    )}
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    style={{ borderRadius: '0.5rem', backgroundColor: isActive ? '#093055' : undefined }}
  >
    <div className="icon-container d-flex position-relative align-items-center">
      {children}
    </div>
  </button>
);

SidebarTriggerBase.propTypes = {
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  isActive: PropTypes.bool,
};

export default SidebarTriggerBase;
