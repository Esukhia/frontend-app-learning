import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getOutlineTabData,
  getOutlineBlocksData,
  getProgressTabData,
  postCourseDeadlines,
  deprecatedPostCourseGoals,
  postWeeklyLearningGoal,
  postDismissWelcomeMessage,
  postRequestCert,
  getLiveTabIframe,
  getCoursewareSearchEnabledFlag,
  searchCourseContentFromAPI,
  normalizeOutlineBlocks,
} from './api';

import {
  addModel, updateModel,
} from '../../generic/model-store';

import {
  fetchTabDenied,
  fetchTabFailure,
  fetchTabRequest,
  fetchTabSuccess,
  setCallToActionToast,
  fetchOutlineBlocksRequest,
  fetchOutlineBlocksSuccess,
  fetchOutlineBlocksFailure,
} from './slice';

import mapSearchResponse from '../courseware-search/map-search-response';

const eventTypes = {
  POST_EVENT: 'post_event',
};

export function fetchTab(courseId, tab, getTabData, targetUserId) {
  return async (dispatch) => {
    dispatch(fetchTabRequest({ courseId }));
    try {
      const promisesToFulfill = [getCourseHomeCourseMetadata(courseId, 'outline')];
      if (getTabData) {
        promisesToFulfill.push(getTabData(courseId, targetUserId));
      }
      const [
        courseHomeCourseMetadataResult,
        tabDataResult,
      ] = await Promise.allSettled(promisesToFulfill);
      if (courseHomeCourseMetadataResult.status === 'fulfilled') {
        dispatch(addModel({
          modelType: 'courseHomeMeta',
          model: {
            id: courseId,
            ...courseHomeCourseMetadataResult.value,
          },
        }));
      }
      if (tabDataResult?.status === 'fulfilled') {
        dispatch(addModel({
          modelType: tab,
          model: {
            id: courseId,
            ...tabDataResult.value,
          },
        }));
      }
      if (courseHomeCourseMetadataResult.status === 'rejected') {
        throw courseHomeCourseMetadataResult.reason;
      } else if (!courseHomeCourseMetadataResult.value.courseAccess.hasAccess) {
        // If the learner does not have access to the course, short cut to dispatch to a denied response regardless of
        // the tabDataResult.
        dispatch(fetchTabDenied({ courseId }));
      } else if (tabDataResult?.status === 'rejected') {
        throw tabDataResult.reason;
      } else {
        dispatch(fetchTabSuccess({
          courseId,
          targetUserId,
        }));
      }
    } catch (e) {
      dispatch(fetchTabFailure({ courseId }));
      logError(e);
    }
  };
}

export function fetchDatesTab(courseId) {
  return fetchTab(courseId, 'dates', getDatesTabData);
}

export function fetchProgressTab(courseId, targetUserId) {
  return fetchTab(courseId, 'progress', getProgressTabData, parseInt(targetUserId, 10) || targetUserId);
}

export function fetchOutlineTab(courseId) {
  return fetchTab(courseId, 'outline', getOutlineTabData);
}

export function fetchLiveTab(courseId) {
  return fetchTab(courseId, 'live', getLiveTabIframe);
}

export function fetchDiscussionTab(courseId) {
  return fetchTab(courseId, 'discussion');
}

export function fetchOutlineBlocks(courseId) {
  return async (dispatch, getState) => {
    const { outlineBlocksStatus } = getState().courseHome;
    if (outlineBlocksStatus === 'loaded' || outlineBlocksStatus === 'loading') {
      return;
    }
    dispatch(fetchOutlineBlocksRequest());
    try {
      const data = await getOutlineBlocksData(courseId);
      dispatch(fetchOutlineBlocksSuccess(data.blocks));

      const normalized = normalizeOutlineBlocks(courseId, data.blocks);
      const outlineModel = getState().models.outline?.[courseId];
      if (!outlineModel) { return; }

      const mergedSections = { ...outlineModel.courseBlocks.sections };
      Object.keys(mergedSections).forEach(sectionId => {
        const blockData = normalized.sections[sectionId];
        if (blockData) {
          mergedSections[sectionId] = { ...mergedSections[sectionId], ...blockData };
        }
      });

      const mergedSequences = { ...outlineModel.courseBlocks.sequences };
      Object.keys(mergedSequences).forEach(seqId => {
        const blockData = normalized.sequences[seqId];
        if (blockData) {
          mergedSequences[seqId] = { ...mergedSequences[seqId], ...blockData };
        }
      });

      dispatch(updateModel({
        modelType: 'outline',
        model: {
          id: courseId,
          courseBlocks: {
            ...outlineModel.courseBlocks,
            sections: mergedSections,
            sequences: mergedSequences,
          },
        },
      }));
    } catch (e) {
      dispatch(fetchOutlineBlocksFailure());
      logError(e);
    }
  };
}

export function dismissWelcomeMessage(courseId) {
  return async () => postDismissWelcomeMessage(courseId);
}

export function requestCert(courseId) {
  return async () => postRequestCert(courseId);
}

export function resetDeadlines(courseId, model, getTabData) {
  return async (dispatch) => {
    postCourseDeadlines(courseId, model).then(response => {
      const { data } = response;
      const {
        header,
        link,
        link_text: linkText,
      } = data;
      dispatch(getTabData(courseId));
      dispatch(setCallToActionToast({ header, link, linkText }));
    });
  };
}

export async function deprecatedSaveCourseGoal(courseId, goalKey) {
  return deprecatedPostCourseGoals(courseId, goalKey);
}

export async function saveWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders) {
  return postWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders);
}

export function processEvent(eventData, getTabData) {
  return async (dispatch) => {
    // Pulling this out early so the data doesn't get camelCased and is easier
    // to use when it's passed to the backend
    const { research_event_data: researchEventData } = eventData;
    const event = camelCaseObject(eventData);
    if (event.eventName === eventTypes.POST_EVENT) {
      executePostFromPostEvent(event.postData, researchEventData).then(response => {
        const { data } = response;
        const {
          header,
          link,
          link_text: linkText,
        } = data;
        dispatch(getTabData(event.postData.bodyParams.courseId));
        dispatch(setCallToActionToast({ header, link, linkText }));
      });
    }
  };
}

export async function fetchCoursewareSearchSettings(courseId) {
  try {
    const { enabled } = await getCoursewareSearchEnabledFlag(courseId);
    return { enabled };
  } catch (e) {
    return { enabled: false };
  }
}

export function searchCourseContent(courseId, searchKeyword) {
  return async (dispatch) => {
    const start = new Date();

    dispatch(addModel({
      modelType: 'contentSearchResults',
      model: {
        id: courseId,
        searchKeyword,
        results: [],
        errors: undefined,
        loading: true,
      },
    }));

    let data;
    let curatedResponse;
    let errors;
    try {
      ({ data } = await searchCourseContentFromAPI(courseId, searchKeyword));
      curatedResponse = mapSearchResponse(data, searchKeyword);
    } catch (e) {
      // TODO: Remove when publishing to prod. Just temporary for performance debugging.
      // eslint-disable-next-line no-console
      console.error('Error on Courseware Search: ', e.message);
      errors = e.message;
    }

    dispatch(updateModel({
      modelType: 'contentSearchResults',
      model: {
        ...curatedResponse,
        id: courseId,
        searchKeyword,
        errors,
        loading: false,
      },
    }));

    const end = new Date();
    const clientMs = (end - start);
    const {
      took, total, maxScore, accessDeniedCount,
    } = data;

    // TODO: Remove when publishing to prod. Just temporary for performance debugging.
    // eslint-disable-next-line no-console
    console.table({
      'Search Keyword': searchKeyword,
      'Client time (ms)': clientMs,
      'Server time (ms)': took,
      'Total matches': total,
      'Max score': maxScore,
      'Access denied count': accessDeniedCount,
    });
  };
}
