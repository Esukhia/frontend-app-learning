import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import UnitIcon, { UNIT_ICON_TYPES } from './UnitIcon';
import UnitLinkWrapper from './UnitLinkWrapper';

const renderTibetanText = (text) => {
  if (!text) {
    return null;
  }

  const tibetanRegex = /[\u0F00-\u0FFF]+/g;
  const parts = [];
  let lastIndex = 0;

  const matches = text.matchAll(tibetanRegex);

  // eslint-disable-next-line no-restricted-syntax
  for (const match of matches) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} style={{ fontFamily: 'Jomolhari, serif', fontSize: '1.2em' }}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const SidebarUnit = ({
  id,
  courseId,
  sequenceId,
  isFirst,
  unit,
  isActive,
  isLocked,
  activeUnitId,
  isCompletionTrackingEnabled,
}) => {
  const intl = useIntl();
  const {
    complete,
    title,
    icon = UNIT_ICON_TYPES.other,
  } = unit;

  const iconType = isLocked ? UNIT_ICON_TYPES.lock : icon;
  const completeAndEnabled = complete && isCompletionTrackingEnabled;

  return (
    <li className={classNames({ 'bg-info-100': isActive, 'border-top border-light': !isFirst })}>
      <UnitLinkWrapper
        {...{
          sequenceId,
          activeUnitId,
          id,
          courseId,
        }}
      >
        <div className="col-auto p-0">
          <UnitIcon type={iconType} isCompleted={completeAndEnabled} />
        </div>
        <div className="col-10 p-0 ml-3 text-break">
          <span className="align-middle">
            {renderTibetanText(title)}
          </span>
          {isCompletionTrackingEnabled && (
            <span className="sr-only">
              , {intl.formatMessage(complete ? messages.completedUnit : messages.incompleteUnit)}
            </span>
          )}
        </div>
      </UnitLinkWrapper>
    </li>
  );
};

SidebarUnit.propTypes = {
  id: PropTypes.string.isRequired,
  isFirst: PropTypes.bool.isRequired,
  unit: PropTypes.shape({
    complete: PropTypes.bool,
    icon: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  activeUnitId: PropTypes.string.isRequired,
  isCompletionTrackingEnabled: PropTypes.bool.isRequired,
};

export default SidebarUnit;
