import { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Collapsible } from '@openedx/paragon';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { useCourseOutlineSidebar } from '../hooks';
import CompletionIcon from './CompletionIcon';
import SidebarUnit from './SidebarUnit';
import { UNIT_ICON_TYPES } from './UnitIcon';

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

const SidebarSequence = ({
  courseId,
  defaultOpen,
  sequence,
  activeUnitId,
}) => {
  const intl = useIntl();
  const {
    id,
    complete,
    title,
    specialExamInfo,
    unitIds,
    type,
    completionStat,
  } = sequence;

  const [open, setOpen] = useState(defaultOpen);
  const { activeSequenceId, units, isEnabledCompletionTracking } = useCourseOutlineSidebar();
  const isActiveSequence = id === activeSequenceId;
  const completionSrText = intl.formatMessage(
    complete ? courseOutlineMessages.completedAssignment : courseOutlineMessages.incompleteAssignment,
  );

  const sectionTitle = (
    <>
      <div className="col-auto p-0" style={{ fontSize: '1.1rem' }}>
        <CompletionIcon completionStat={completionStat} enabled={isEnabledCompletionTracking} />
      </div>
      <div className="col-9 d-flex flex-column flex-grow-1 ml-3 mr-auto p-0 text-left">
        <span className="align-middle text-dark-500">{renderTibetanText(title)}</span>
        {specialExamInfo && <span className="align-middle small text-muted">{specialExamInfo}</span>}
        {isEnabledCompletionTracking && (
          <span className="sr-only">
            , {completionSrText}
          </span>
        )}
      </div>
    </>
  );

  return (
    <li>
      <Collapsible
        className={classNames('mb-2', { 'active-section': isActiveSequence, 'bg-info-100': isActiveSequence && !open })}
        styling="card-lg text-break"
        title={sectionTitle}
        open={open}
        onToggle={() => setOpen(!open)}
      >
        <ol className="list-unstyled">
          {unitIds.map((unitId, index) => (
            <SidebarUnit
              key={unitId}
              id={unitId}
              courseId={courseId}
              sequenceId={id}
              unit={units[unitId]}
              isActive={activeUnitId === unitId}
              activeUnitId={activeUnitId}
              isFirst={index === 0}
              isLocked={type === UNIT_ICON_TYPES.lock}
              isCompletionTrackingEnabled={isEnabledCompletionTracking}
            />
          ))}
        </ol>
      </Collapsible>
    </li>
  );
};

SidebarSequence.propTypes = {
  courseId: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool.isRequired,
  sequence: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    specialExamInfo: PropTypes.string,
    unitIds: PropTypes.arrayOf(PropTypes.string),
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  activeUnitId: PropTypes.string.isRequired,
};

export default SidebarSequence;
