import { createSelector } from 'reselect';


export const selectFeedReducer = () => state => state.get('feed')


export const getIsFetchingFeeds = () => createSelector(
  selectFeedReducer(),
  state => state.get('isFetching')
);

export const getIsFetchingMore = () => createSelector(
  selectFeedReducer(),
  state => state.get('isFetchingMore')
);

export const getFetchFeeds = () => createSelector(
  selectFeedReducer(),
  state => state.get('feeds').toJS()
);

export const getFeedsLinks = () => createSelector(
  selectFeedReducer(),
  state => state.get('links').toJS()
);

export const getIsPostingFeed = () => createSelector(
  selectFeedReducer(),
  state => state.get('isPosting')
);

export const getUpdateImage = () => createSelector(
  selectFeedReducer(),
  state => state.get('image').toJS()
);

export const getUpdateText = () => createSelector(
  selectFeedReducer(),
  state => state.get('message')
);

export const getCurrentPage = () => createSelector(
  selectFeedReducer(),
  state => state.get('currentPage')
);

export const getIsRemoveFeed = () => createSelector(
  selectFeedReducer(),
  state => state.get('isRemoving')
);

export const removedFeed = () => createSelector(
  selectFeedReducer(),
  state => state.get('feeds').toJS()
);
