import classNames from 'classnames';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {
  injectIntl, intlShape, isRtl, getLocale,
} from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { useContext } from 'react';

// Course components
import { GetCourseExitNavigation } from '../../course-exit';
import SidebarTriggers from '../../sidebar/SidebarTriggers';
import { Trigger as CourseOutlineTrigger } from '../../sidebar/sidebars/course-outline';

// Local components and utilities
import UnitNavigationEffortEstimate from './UnitNavigationEffortEstimate';
import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';
import UserMessagesContext from '../../../../generic/user-messages/UserMessagesContext';

const UnitNavigation = ({
  intl,
  sequenceId,
  unitId,
  onClickPrevious,
  onClickNext,
  isAtTop,
}) => {
  const {
    isFirstUnit, isLastUnit, nextLink, previousLink,
  } = useSequenceNavigationMetadata(sequenceId, unitId);

  const { courseId } = useSelector(state => state.courseware);
  const { messages: userMessages } = useContext(UserMessagesContext);
  const hasSequenceAlerts = userMessages.some(message => message.topic === 'sequence');

  // Get arrow direction based on RTL settings
  const locale = getLocale();
  const prevArrow = isRtl(locale) ? faChevronRight : faChevronLeft;
  const nextArrow = isRtl(locale) ? faChevronLeft : faChevronRight;

  const renderPreviousButton = () => {
    const disabled = isFirstUnit;
    const buttonText = intl.formatMessage(messages.previousButton);
    return (
      <Button
        variant="outline-secondary"
        className={classNames(
          'previous-button d-flex align-items-center justify-content-center text-truncate',
          isAtTop ? 'w-100' : 'flex-grow-1 mr-2',
        )}
        disabled={disabled}
        onClick={onClickPrevious}
        as={disabled ? undefined : Link}
        to={disabled ? undefined : previousLink}
      >
        <span className="d-flex align-items-center">
          <FontAwesomeIcon icon={prevArrow} className="mr-2" size="sm" />
          {buttonText}
        </span>
      </Button>
    );
  };

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    return (
      <Button
        variant="outline-primary"
        className={classNames(
          'next-button d-flex align-items-center justify-content-center text-truncate',
          isAtTop ? '' : 'flex-grow-1',
        )}
        style={isAtTop ? { width: '120px' } : undefined}
        onClick={onClickNext}
        disabled={disabled}
        as={disabled ? undefined : Link}
        to={disabled ? undefined : nextLink}
      >
        <UnitNavigationEffortEstimate sequenceId={sequenceId} unitId={unitId}>
          {buttonText}
        </UnitNavigationEffortEstimate>
        <FontAwesomeIcon icon={nextArrow} className="ml-2" size="sm" aria-hidden="false" />
      </Button>
    );
  };

  return (
    <div className={classNames('unit-navigation d-flex align-items-center justify-content-between', { 'top-unit-navigation mb-2.5 w-100 mt-n4.5': isAtTop && !hasSequenceAlerts, 'top-unit-navigation mb-2.5 w-100': isAtTop && hasSequenceAlerts })}>
      {/* Top navigation area with course outline and sidebar triggers */}
      {isAtTop && (
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Course Outline Trigger on left side */}
          <div className="mr-2">
            <CourseOutlineTrigger isMobileView />
          </div>
          {/* Container for right-aligned triggers with spacing */}
          <div className="d-flex align-items-center mr-2">
            <SidebarTriggers className="mx-1" />
          </div>
        </div>
      )}

      {/* Navigation buttons area */}
      <div className={classNames('d-flex align-items-center', { 'w-100 justify-content-between': !isAtTop })}>
        {isAtTop ? (
          /* Top navigation buttons aligned to the right */
          <div className="d-flex ml-auto">
            <div className="mr-2">{renderPreviousButton()}</div>
            <div>{renderNextButton()}</div>
          </div>
        ) : (
          /* Bottom navigation buttons */
          <>
            {renderPreviousButton()}
            {renderNextButton()}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * PropTypes for UnitNavigation component
 */
UnitNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  onClickPrevious: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  isAtTop: PropTypes.bool,
};

UnitNavigation.defaultProps = {
  unitId: null,
  isAtTop: false,
};

export default injectIntl(UnitNavigation);
