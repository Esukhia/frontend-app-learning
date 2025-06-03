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

import { GetCourseExitNavigation } from '../../course-exit';
import SidebarTriggers from '../../sidebar/SidebarTriggers';
import { Trigger as CourseOutlineTrigger } from '../../sidebar/sidebars/course-outline';

import UnitNavigationEffortEstimate from './UnitNavigationEffortEstimate';
import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';

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

  // Get arrow direction based on RTL settings
  const locale = getLocale();
  const prevArrow = isRtl(locale) ? faChevronRight : faChevronLeft;
  const nextArrow = isRtl(locale) ? faChevronLeft : faChevronRight;

  const renderPreviousButton = () => {
    const disabled = isFirstUnit;
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
        <FontAwesomeIcon icon={prevArrow} className="mr-2" size="sm" />
        {intl.formatMessage(messages.previousButton)}
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
          isAtTop ? 'w-100' : 'flex-grow-1',
        )}
        onClick={onClickNext}
        disabled={disabled}
        as={disabled ? undefined : Link}
        to={disabled ? undefined : nextLink}
      >
        <UnitNavigationEffortEstimate sequenceId={sequenceId} unitId={unitId}>
          {buttonText}
        </UnitNavigationEffortEstimate>
        <FontAwesomeIcon icon={nextArrow} className="ml-2" size="sm" />
      </Button>
    );
  };

  return (
    <div className={classNames('unit-navigation d-flex align-items-center justify-content-between', { 'top-unit-navigation mb-2.5 w-100 mt-n4.5': isAtTop })}>
      {isAtTop && (
        <div className="d-flex align-items-center ml-auto mr-3"> {/* Container for right-aligned triggers */}
          <div className="mr-2"> {/* Course Outline Trigger - visible on all screen sizes */}
            <CourseOutlineTrigger isMobileView />
          </div>
          <SidebarTriggers className="mx-1" />
        </div>
      )}

      <div className={classNames('d-flex align-items-center', { 'w-100 justify-content-between': !isAtTop })}>
        {isAtTop ? (
          <div className="d-flex w-100 flex-wrap">
            <div className="flex-grow-1 flex-basis-0 min-width-0 pr-2">{renderPreviousButton()}</div>
            <div className="flex-grow-1 flex-basis-0 min-width-0 pl-2">{renderNextButton()}</div>
          </div>
        ) : (
          <>
            {renderPreviousButton()}
            {renderNextButton()}
          </>
        )}
      </div>
    </div>
  );
};

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
