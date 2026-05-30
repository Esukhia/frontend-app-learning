import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';

import { BookmarkButton } from '@src/courseware/course/bookmark';
import messages from '@src/courseware/course/sequence/messages';

const UnitTitleSlot = ({
  unitId,
  unit,
  renderUnitNavigation,
}) => {
  const { formatMessage } = useIntl();
  const isProcessing = unit.bookmarkedUpdateState === 'loading';

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.unit_title.v1"
      idAliases={['unit_title_slot']}
      pluginProps={{
        unitId,
        unit,
        isEnabledOutlineSidebar: true,
        renderUnitNavigation,
      }}
    >
      <div className="unit-title-header d-flex flex-column-reverse flex-xl-row align-items-start align-items-xl-center justify-content-between gap-3">
        <div className="unit-title-container mb-0 mt-3 mt-xl-0">
          <h3 className="h3 text-break mb-0">{unit.title}</h3>
        </div>
        <div className="unit-title-nav flex-shrink-0">
          {renderUnitNavigation(true)}
        </div>
      </div>
      <p className="sr-only">{formatMessage(messages.headerPlaceholder)}</p>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
    </PluginSlot>
  );
};

UnitTitleSlot.propTypes = {
  unitId: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookmarked: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    bookmarkedUpdateState: PropTypes.string.isRequired,
  }).isRequired,
  renderUnitNavigation: PropTypes.func.isRequired,
};

export default UnitTitleSlot;
