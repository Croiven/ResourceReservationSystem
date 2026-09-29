import { useCallback, useEffect, useState } from 'react';
import * as resourceApi from '../services/resourceApi';
import type { Resource, ResourceType } from '../types/resource';
import { ApiError } from '../types/api';
import type { ActiveFilter } from '../utils/resourceLabels';
import { buildResourceListQuery } from '../utils/resourceListQuery';
import { useDebouncedValue } from './useDebouncedValue';

export function useResourceList(defaultActiveFilter: ActiveFilter) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(defaultActiveFilter);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await resourceApi.listResources(
        buildResourceListQuery(debouncedSearch, typeFilter, activeFilter),
      );
      setResources(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to load resources. Please try again.');
      }
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, typeFilter, activeFilter]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    activeFilter,
    setActiveFilter,
    resources,
    isLoading,
    error,
    setError,
    loadResources,
  };
}
