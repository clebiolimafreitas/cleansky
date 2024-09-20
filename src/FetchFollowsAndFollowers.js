import axios from 'axios';
import { setFollows, setFollowers } from './LoginSlice';

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const fetchFollowsAndFollowers = (userId) => async (dispatch, getState) => {
  const { token } = getState().user;

  // Verifica se os follows já estão no localStorage
  const followsFromStorage = getFromLocalStorage(`follows_${userId}`);
  const followersFromStorage = getFromLocalStorage(`followers_${userId}`);

  if (followsFromStorage) {
    dispatch(setFollows(followsFromStorage));
  } else {
    // Fetch follows paginados
    let nextFollowsPageToken = null;
    let allFollows = [];
    do {
      const followsData = await axios.get(`/api/users/${userId}/follows`, {
        params: { pageToken: nextFollowsPageToken },
        headers: { Authorization: `Bearer ${token}` },
      });
      allFollows = [...allFollows, ...followsData.items];
      nextFollowsPageToken = followsData.nextPageToken;
    } while (nextFollowsPageToken);

    dispatch(setFollows(allFollows));
    saveToLocalStorage(`follows_${userId}`, allFollows);
  }

  if (followersFromStorage) {
    dispatch(setFollowers(followersFromStorage));
  } else {
    // Fetch followers paginados
    let nextFollowersPageToken = null;
    let allFollowers = [];
    do {
      const followersData = await axios.get(`/api/users/${userId}/followers`, {
        params: { pageToken: nextFollowersPageToken },
        headers: { Authorization: `Bearer ${token}` },
      });
      allFollowers = [...allFollowers, ...followersData.items];
      nextFollowersPageToken = followersData.nextPageToken;
    } while (nextFollowersPageToken);

    dispatch(setFollowers(allFollowers));
    saveToLocalStorage(`followers_${userId}`, allFollowers);
  }
};
