import * as actionTypes from "../actionTypes";
import gql from "graphql-tag"
import {IProject} from "../../reducers/creator/creatorDashboard";

const setLoading = (loading: boolean) => ({
  type: actionTypes.SET_LOADING,
  payload: loading
});

const getProjectListSuccess = (projects: IProject[]) => ({
  type: actionTypes.GET_PROJECTS_SUCCESS,
  payload: projects
});

const addProjectSuccess = (project: IProject) => ({
  type: actionTypes.ADD_PROJECT_SUCCESS,
  payload: project
});

const updateProjectSuccess = (project: any, index: number) => ({
  type: actionTypes.UPDATE_PROJECT_SUCCESS,
  payload: {
    project,
    index
  }
});

const deleteProjectSuccess = (index: number) => ({
  type: actionTypes.DELETE_PROJECT_SUCCESS,
  payload: index
});

export const updateProjects = (value: any) => ({
  type: actionTypes.UPDATE_PROJECTS,
  payload: value
});

const sortProjectsByOrder = (projects: IProject[]) => {
  // sort ascending
  projects.sort((a, b) => {
    return a.cascadedProjectOrder - b.cascadedProjectOrder
  });
  return projects
};

const addProjectToExperienceSuccess = (res: any) => ({
  type: actionTypes.ADD_PROJECT_TO_EXPERIENCE_SUCCESS,
  payload: res
});

// get projects list
export const getProjects = (client: any, req: any) => {
  return (dispatch: any) => {
    const query = gql`
      query viewProject($projectOwnerId: Float!) {
        viewProject(projectOwnerId: $projectOwnerId) {
          projectId
          projectAlias
          projectName
          projectDescription
          tagCloud
          deleted
          active
          createdAt
          updatedAt
          backgroundStimulusId
          iconStimulusId
          departmentId
          projectOwnerId
          cascadedProjectId
          createdBy
          updatedBy
          cascadedProjectOrder
        }
      }
    `;
    const variables = {...req};
    dispatch(setLoading(true));
    client.query({
      query,
      fetchPolicy: "no-cache",
      variables
    }).then((res: any) => {
      if (res.data.viewProject) {
        const filterProjects = res.data['viewProject'].filter((project: IProject) => !project.deleted);
        const projects = sortProjectsByOrder(filterProjects);
        dispatch(getProjectListSuccess(projects));
      }
      dispatch(setLoading(false));
    }).catch((err: any) => {
      dispatch(getProjectListSuccess([]));
      dispatch(setLoading(false));
    })
  }
};

// create a project
export const createProject = (client: any, req: any) => {
  return (dispatch: any) => {
    const mutation = gql`
      mutation addProject($cascadedProjectOrder: Float, $cascadedProjectId: Float, $projectOwnerId: Float!, $departmentId: Float!, $iconStimulusId: Float!, $backgroundStimulusId: Float, $tagCloud: JSON, $projectDescription: String, $projectName: String!, $projectAlias: String!) {
        addProject(cascadedProjectOrder: $cascadedProjectOrder, cascadedProjectId: $cascadedProjectId, projectOwnerId: $projectOwnerId, departmentId: $departmentId, iconStimulusId: $iconStimulusId, backgroundStimulusId: $backgroundStimulusId, tagCloud: $tagCloud, projectDescription: $projectDescription, projectName: $projectName, projectAlias: $projectAlias) {
          projectId
          projectAlias
          projectName
          projectDescription
          tagCloud
          deleted
          active
          createdAt
          updatedAt
          backgroundStimulusId
          iconStimulusId
          departmentId
          projectOwnerId
          cascadedProjectId
          createdBy
          updatedBy
          cascadedProjectOrder
        }
      }
    `;
    const variables = {...req};
    dispatch(setLoading(true));
    client.mutate({
      mutation,
      fetchPolicy: "no-cache",
      variables
    }).then((res: any) => {
      if (res.data.addProject) {
        dispatch(addProjectSuccess(res.data.addProject));
      }
      dispatch(setLoading(false));
    }).catch((err: any) => {
      // handle error
      dispatch(setLoading(false));
    })
  }
};

// update project
export const updateProject = (client: any, req: any, index: number) => {
  return (dispatch: any) => {
    const mutation = gql`
      mutation updateProject($cascadedProjectOrder: Float, $cascadedProjectId: Float, $projectOwnerId: Float, $departmentId: Float, $iconStimulusId: Float, $backgroundStimulusId: Float, $tagCloud: JSON, $projectDescription: String, $projectName: String, $projectAlias: String, $projectId: Float!) {
        updateProject(cascadedProjectOrder: $cascadedProjectOrder, cascadedProjectId: $cascadedProjectId, projectOwnerId: $projectOwnerId, departmentId: $departmentId, iconStimulusId: $iconStimulusId, backgroundStimulusId: $backgroundStimulusId, tagCloud: $tagCloud, projectDescription: $projectDescription, projectName: $projectName, projectAlias: $projectAlias, projectId: $projectId) {
          projectId
          projectAlias
          projectName
          projectDescription
          tagCloud
          deleted
          active
          createdAt
          updatedAt
          backgroundStimulusId
          iconStimulusId
          departmentId
          projectOwnerId
          cascadedProjectId
          createdBy
          updatedBy
          cascadedProjectOrder
        }
      }
    `;
    const variables = {...req};
    dispatch(setLoading(true));
    client.mutate({
      mutation,
      fetchPolicy: "no-cache",
      variables
    }).then((res: any) => {
      if (res.data['updateProject']) {
        dispatch(updateProjectSuccess(res.data['updateProject'], index))
      }
      dispatch(setLoading(false));
    }).catch((err: any) => {
      // handle error
      dispatch(setLoading(false));
    })
  }
};

// delete project
export const deleteProject = (client: any, req: any, index: number) => {
  return (dispatch: any) => {
    const mutation = gql`
      mutation deleteProject($projectId: Float!) {
        deleteProject(projectId: $projectId) {
          status
          messagecode
          message
          data  
        }
      }
    `;
    const variables = {...req};
    dispatch(setLoading(true));
    client.mutate({
      mutation,
      fetchPolicy: "no-cache",
      variables
    }).then((res: any) => {
      if (res.data['deleteProject'] && res.data['deleteProject'].status === true) {
        dispatch(deleteProjectSuccess(index));
      }
      dispatch(setLoading(false));
    }).catch((err: any) => {
      // handle error
      dispatch(setLoading(false));
    })
  }
};

// add Project To Experience
export const addProjectToExperience = (client: any, req: any) => {
  return (dispatch: any) => {
    const mutation = gql`
      mutation addProjectToExperience($session_code: [String!]!, $project_id: Float!) {
        addProjectToExperience(session_code: $session_code, project_id: $project_id) {
          status
          messagecode
          message
          data  
        }
      }
    `;
    const variables = {...req};
    dispatch(setLoading(true));
    client.mutate({
      mutation,
      fetchPolicy: "no-cache",
      variables
    }).then((res: any) => {
      if (res.data['addProjectToExperience']) {
        dispatch(addProjectToExperienceSuccess(res.data['addProjectToExperience']))
      }
      dispatch(setLoading(false));
    }).catch((err: any) => {
      // handle error
      dispatch(setLoading(false));
    })
  }
};