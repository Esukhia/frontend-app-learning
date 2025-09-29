import React from 'react';
import { Button, Card, Stack } from '@openedx/paragon';
import { Forum } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ensureConfig, getConfig } from '@edx/frontend-platform';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

const StartOrResumeCourseCard = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
  } = useModel('outline', courseId);

  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}`;

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <Card className="mb-3 raised-card" data-testid="start-resume-card">
      <Card.Header
        title={hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        actions={(
          <Stack direction="horizontal" gap={3}>
            <Button
              variant="outline-brand"
              href={discussionsUrl}
              iconBefore={Forum}
            >
              {intl.formatMessage({ id: 'start.discussion', defaultMessage: 'Start Discussion' })}
            </Button>
            <Button
              variant="brand"
              href={resumeCourseUrl}
              onClick={() => logResumeCourseClick()}
            >
              {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
            </Button>
          </Stack>
        )}
      />
      {/* Footer is needed for internal vertical spacing to work out. If you can remove, be my guest */}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <Card.Footer><></></Card.Footer>
    </Card>
  );
};

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
