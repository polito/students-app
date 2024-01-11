import { useMemo } from 'react';

import { Results } from '@orama/orama';

import { PlaceOverviewWithMetadata } from '../types';

export const useGetPlacesFromSearchResult = (
  searchResult?: Results<PlaceOverviewWithMetadata>,
) =>
  useMemo(
    () => searchResult?.hits.map(h => h.document) ?? [],
    [searchResult?.hits],
  );
