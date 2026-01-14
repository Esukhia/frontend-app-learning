import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useContext } from 'react';

// Course components
import { GetCourseExitNavigation } from '../../course-exit';
import SidebarTriggers from '../../sidebar/SidebarTriggers';
import { Trigger as CourseOutlineTrigger } from '../../sidebar/sidebars/course-outline';

// Local components and utilities
import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';
import UserMessagesContext from '../../../../generic/user-messages/UserMessagesContext';
import PreviousButton from './generic/PreviousButton';
import NextButton from './generic/NextButton';
import { NextUnitTopNavTriggerSlot } from '../../../../plugin-slots/NextUnitTopNavTriggerSlot';

const UnitNavigation = ({
  sequenceId,
  unitId,
  onClickPrevious,
  onClickNext,
  isAtTop,
  courseId,
}) => {
  const intl = useIntl();
  const {
    isFirstUnit, isLastUnit, nextLink, previousLink,
  } = useSequenceNavigationMetadata(sequenceId, unitId);

  const { messages: userMessages } = useContext(UserMessagesContext);
  const hasSequenceAlerts = userMessages.some(message => message.topic === 'sequence');

  const renderPreviousButton = () => {
    const buttonStyle = `previous-button ${isAtTop ? 'text-dark mr-3' : 'justify-content-center'}`;
    return (
      <PreviousButton
        isFirstUnit={isFirstUnit}
        variant="outline-secondary"
        buttonLabel={intl.formatMessage(messages.previousButton)}
        buttonStyle={buttonStyle}
        onClick={onClickPrevious}
        previousLink={previousLink}
        isAtTop={isAtTop}
      />
    );
  };

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    const variant = 'outline-primary';
    const buttonStyle = `next-button ${isAtTop ? 'text-dark' : 'justify-content-center'}`;

    if (isAtTop) {
      return (
        <NextUnitTopNavTriggerSlot
          {...{
            variant,
            buttonStyle,
            buttonText,
            disabled,
            sequenceId,
            nextLink,
            onClickHandler: onClickNext,
            isAtTop,
          }}
        />
      );
    }

    return (
      <NextButton
        variant={variant}
        buttonStyle={buttonStyle}
        onClickHandler={onClickNext}
        disabled={disabled}
        buttonText={buttonText}
        nextLink={nextLink}
        hasEffortEstimate
      />
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
  courseId: PropTypes.string.isRequired,
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

export default UnitNavigation;