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

  const renderPreviousButton = () => {
    const disabled = isFirstUnit;
    const prevArrow = isRtl(getLocale()) ? faChevronRight : faChevronLeft;
    return (
      <Button
        variant="outline-secondary"
        className={classNames(
          'previous-button d-flex align-items-center justify-content-center',
          {
            'w-100': !isAtTop,
            'mr-sm-2': isAtTop,
            'mr-2': !isAtTop,
            'flex-grow-1': isAtTop,
          },
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
    const nextArrow = isRtl(getLocale()) ? faChevronLeft : faChevronRight;
    return (
      <Button
        variant="outline-primary"
        className={classNames(
          'next-button d-flex align-items-center justify-content-center',
          {
            'w-100': !isAtTop,
            'flex-grow-1': isAtTop,
          },
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

  // Add SidebarTriggers component to display notification and discussion icons

  return (
    <div className={classNames('unit-navigation d-flex align-items-center justify-content-between', { 'top-unit-navigation mb-2.5 w-100 mt-n4.5': isAtTop })}>
      {isAtTop && (
        <div className="d-flex ml-auto mr-3">
          <SidebarTriggers className="mx-1" />
        </div>
      )}

      <div className={classNames('d-flex align-items-center', { 'w-100 justify-content-between': !isAtTop })}>
        {renderPreviousButton()}
        {isAtTop ? (
          <div className="ml-2">
            {renderNextButton()}
          </div>
        ) : renderNextButton()}
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
