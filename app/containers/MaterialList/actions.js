import {
  DevSummitAxios,
  getAccessToken
} from '../../helpers';

import local from '../../../config/local';
import {
  FETCH_MATERIAL_LIST,
  UPDATE_SINGLE_INPUT_FIELD,
  UPDATE_MODAL_STATUS,
  ADD_MATERIAL_ITEM,
  IS_FETCHING_MATERIAL,
  DELETE_MATERIAL_LIST
} from './constants';

export function updateInputFields(field, value) {
  return {
    type: UPDATE_SINGLE_INPUT_FIELD,
    field,
    value
  };
}

export function addMaterialItem(item, material) {
  material.unshift(item);
  return {
    type: ADD_MATERIAL_ITEM,
    material
  };
}

export function updateModalStatus(status) {
  return {
    type: UPDATE_MODAL_STATUS,
    status
  };
}

export function isFetchingMaterial(status) {
  return {
    type: IS_FETCHING_MATERIAL,
    status
  };
}

export function fetchMaterialList() {
  return (dispatch) => {
    dispatch(isFetchingMaterial(true));
    getAccessToken()
      .then((token) => {
        const headers = { Authorization: token };
        DevSummitAxios.get('api/v1/documents', { headers })
          .then((response) => {
            dispatch({
              type: FETCH_MATERIAL_LIST,
              payloads: response.data.data
            });
            dispatch(isFetchingMaterial(false));
          })
          .catch((err) => {
            dispatch(isFetchingMaterial(false));
          });
      });
  };
}

export function saveMaterialList(image) {
  return (dispatch, getState) => {
    dispatch(isFetchingMaterial(true));
    const { fields, material } = getState().get('materialList').toJS();
    const {
      title,
      summary,
      file
    } = fields || null;
    getAccessToken()
      .then((token) => {
        // @TODO We need to change into dev-summit url
        const url = local.API_BASE_URL.concat('/api/v1/documents');
        const form = new FormData();

        form.append('title', title);
        form.append('summary', summary);
        form.append('document_data', {
          uri: file.uri,
          type: file.type,
          name: file.fileName
        });

        fetch(url, {
          method: 'POST',
          headers: {
            Authorization: token
          },
          body: form
        })
          .then(resp => resp.json())
          .then((resp) => {
            dispatch(addMaterialItem(resp.data, material));
            dispatch(updateModalStatus(false));
            dispatch(isFetchingMaterial(false));
          }).catch((err) => {
              dispatch(isFetchingMaterial(false));
              console.log(err);
          });
      });
  };
}

export function deleteMaterialList(id) {
  return (dispatch) => {
    dispatch(isFetchingMaterial(true));
    getAccessToken()
      .then((token) => {
        const headers = { Authorization: token };
        DevSummitAxios.delete(`api/v1/documents/${id}`, { headers })
          .then((response) => {
            console.log('landing here to delete item', response);
            dispatch({
              type: DELETE_MATERIAL_LIST,
              payloads: response.data.data
            });
            dispatch(isFetchingMaterial(false));
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };
}