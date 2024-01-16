import { useEffect, useState } from 'react';

import {
  AnyOrama,
  AnySchema,
  PartialSchemaDeep,
  Results,
  SearchParams,
  create,
  search as fullTextSearch,
  insertMultiple,
} from '@orama/orama';
import { TypedDocument } from '@orama/orama/dist/types';

/**
 * Performs a full-text (Orama) search on the documents provided
 */
export const useFullTextSearch = <
  S extends AnySchema,
  O extends AnyOrama<S>,
  T extends PartialSchemaDeep<TypedDocument<O>>,
>(
  schema: S,
  query: SearchParams<O, TypedDocument<O>>,
  items?: T[],
) => {
  const [result, setResult] = useState<
    (Results<TypedDocument<O>> & { documents?: T[] }) | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);
  const [index, setIndex] = useState<O>();

  useEffect(() => {
    if (items?.length) {
      (async () => {
        const _index = (await create({
          schema,
        })) as unknown as O;
        await insertMultiple(_index, items);
        setIndex(_index);
      })();
    }
  }, [schema, items]);

  useEffect(() => {
    if (index) {
      (async () => {
        setIsSearching(true);
        const _result = await fullTextSearch(index, query);
        setResult(
          _result
            ? {
                ..._result,
                documents: _result?.hits?.map(
                  ({ document }) => document,
                ) as unknown as T[],
              }
            : null,
        );
        setIsSearching(false);
      })();
    }
  }, [index, query]);

  return {
    result,
    isSearching,
  };
};
