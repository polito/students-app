import { Survey, SurveysApi } from '@polito/api-client';
import { useQuery } from '@tanstack/react-query';

import { SurveyType } from '../../features/surveys/types/SurveyType';
import { pluckData } from '../../utils/queries';

export const SURVEYS_QUERY_KEY = ['surveys'];
export const CPD_QUERY_KEY = ['cpd'];
export const CPD_ALL_QUERY_KEY = ['cpdall'];
export const CPD_CATEGORIES_QUERY_KEY = ['cpdCategories'];

const useSurveysClient = (): SurveysApi => {
  return new SurveysApi();
};

export const useGetSurveys = () => {
  const surveysClient = useSurveysClient();

  return useQuery(SURVEYS_QUERY_KEY, () =>
    surveysClient.getSurveys().then(pluckData),
  );
};

const filterMandatoryNotCompiledSurveys = (surveys: Survey[]): Survey[] => {
  return surveys.filter(survey => survey.isMandatory && !survey.isCompiled);
};

export const useGetCpdSurveys = () => {
  const surveysQuery = useGetSurveys();

  return useQuery(
    CPD_QUERY_KEY,
    () => filterMandatoryNotCompiledSurveys(surveysQuery.data!),
    {
      enabled: surveysQuery.data !== undefined,
    },
  );
};

const filterMandatorySurveys = (surveys: Survey[]): Survey[] => {
  const s = surveys.filter(survey => survey.isMandatory);
  return s;
};

export const useGetAllCpdSurveys = () => {
  const surveysQuery = useGetSurveys();

  return useQuery(
    CPD_ALL_QUERY_KEY,
    () => filterMandatorySurveys(surveysQuery.data!),
    {
      enabled: surveysQuery.data !== undefined,
    },
  );
};

const groupSurveysIntoTypes = (surveys: Survey[]): SurveyType[] => {
  return surveys
    .reduce((acc, survey) => {
      const categoryIndex = acc.findIndex(
        c => c.categoryId === survey.category.id && c.typeId === survey.type.id,
      );

      let category: SurveyType;

      if (categoryIndex >= 0) {
        category = acc.splice(categoryIndex, 1)[0];
      } else {
        category = {
          id: `${survey.category.id}_${survey.type.id}`,
          name: survey.type.name,
          categoryId: survey.category.id,
          typeId: survey.type.id,
          totalCount: 0,
          incompleteCount: 0,
        };
      }

      category.totalCount += 1;
      category.incompleteCount += survey.isCompiled ? 0 : 1;

      acc.push(category);

      return acc;
    }, [] as SurveyType[])
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const useGetSurveyCategories = () => {
  const cpdSurveys = useGetCpdSurveys();

  return useQuery(
    CPD_CATEGORIES_QUERY_KEY,
    () => groupSurveysIntoTypes(cpdSurveys.data!),
    {
      enabled: cpdSurveys.data !== undefined,
    },
  );
};
