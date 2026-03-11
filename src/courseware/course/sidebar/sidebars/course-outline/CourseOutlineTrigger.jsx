import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { IconButton, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { MenuOpen as MenuOpenIcon } from '@openedx/paragon/icons';

import { useCourseOutlineSidebar } from './hooks';
import { ID } from './constants';
import messages from './messages';

const CourseOutlineTrigger = ({ isMobileView }) => {
  const intl = useIntl();
  const {
    currentSidebar,
    shouldDisplayFullScreen,
    handleToggleCollapse,
    isActiveEntranceExam,
  } = useCourseOutlineSidebar();

  const isDisplayForDesktopView = !isMobileView && !shouldDisplayFullScreen && currentSidebar !== ID;
  const isDisplayForMobileView = isMobileView && shouldDisplayFullScreen;

  if ((!isDisplayForDesktopView && !isDisplayForMobileView) || isActiveEntranceExam) {
    return null;
  }

  return (
    <div className={classNames('outline-sidebar-heading-wrapper collapsed align-self-start', {
      'flex-shrink-0 mr-4': isDisplayForDesktopView,
      'p-0': isDisplayForMobileView,
    })}
    >
      <OverlayTrigger
        placement="right"
        overlay={(
          <Tooltip id="course-outline-tooltip">
            {intl.formatMessage(messages.toggleCourseOutlineTrigger)}
          </Tooltip>
        )}
      >
        <IconButton
          alt={intl.formatMessage(messages.toggleCourseOutlineTrigger)}
          className="outline-sidebar-toggle-btn flex-shrink-0"
          iconAs={MenuOpenIcon}
          onClick={handleToggleCollapse}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: '0.75rem',
            transition: 'all 0.2s ease',
            color: '#093055',
          }}
        />
      </OverlayTrigger>
    </div>
  );
};

CourseOutlineTrigger.defaultProps = {
  isMobileView: false,
};

CourseOutlineTrigger.propTypes = {
  isMobileView: PropTypes.bool,
};

export default CourseOutlineTrigger;
