import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { ChevronRight as ChevronRightIcon } from '@openedx/paragon/icons';

import courseOutlineMessages from '@src/course-home/outline-tab/messages';
import { getSequenceId } from '@src/courseware/data/selectors';
import CompletionIcon from './CompletionIcon';

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

const SidebarSection = ({ intl, section, handleSelectSection }) => {
  const {
    id,
    complete,
    title,
    sequenceIds,
    completionStat,
  } = section;

  const activeSequenceId = useSelector(getSequenceId);
  const isActiveSection = sequenceIds.includes(activeSequenceId);
  const completionSrText = intl.formatMessage(
    complete ? courseOutlineMessages.completedSection : courseOutlineMessages.incompleteSection,
  );

  const sectionTitle = (
    <>
      <div className="col-auto p-0">
        <CompletionIcon completionStat={completionStat} />
      </div>
      <div className="col-10 ml-3 p-0 flex-grow-1 text-dark-500 text-left text-break">
        {renderTibetanText(title)}
        <span className="sr-only">
          , {completionSrText}
        </span>
      </div>
    </>
  );

  return (
    <li className="mb-2 course-sidebar-section">
      <Button
        variant="tertiary"
        className={classNames(
          'd-flex align-items-center w-100 px-4 py-3.5 rounded-0 justify-content-start',
          { 'bg-info-100': isActiveSection },
        )}
        onClick={() => handleSelectSection(id)}
      >
        {sectionTitle}
        <Icon src={ChevronRightIcon} />
      </Button>
    </li>
  );
};

SidebarSection.propTypes = {
  intl: intlShape.isRequired,
  section: PropTypes.shape({
    complete: PropTypes.bool,
    id: PropTypes.string,
    title: PropTypes.string,
    sequenceIds: PropTypes.arrayOf(PropTypes.string),
    completionStat: PropTypes.shape({
      completed: PropTypes.number,
      total: PropTypes.number,
    }),
  }).isRequired,
  handleSelectSection: PropTypes.func.isRequired,
};

export default injectIntl(SidebarSection);
