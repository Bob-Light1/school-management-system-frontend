import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

/**
 * useRelatedData
 * Fetches multiple related endpoints defined in config and returns them as a map.
 *
 * @param {Object} relatedDataEndpoints - e.g. { departments: '/department', subjects: '/subject' }
 * @param {string} campusId             - Passed as query param to each endpoint
 *
 * @returns {Object} relatedData        - e.g. { departments: [...], subjects: [...] }
 *
 * @example
 * const relatedData = useRelatedData(
 *   { departments: '/department', classes: '/class' },
 *   campusId
 * );
 */
const useRelatedData = (relatedDataEndpoints = {}, campusId) => {
  const [relatedData, setRelatedData] = useState({});

  useEffect(() => {
    if (!campusId || Object.keys(relatedDataEndpoints).length === 0) return;

    const controller = new AbortController();

    const fetchAll = async () => {
      try {
        const entries = Object.entries(relatedDataEndpoints);

        const results = await Promise.allSettled(
          entries.map(([, endpoint]) =>
            api.get(endpoint, {
              params: { campusId },
              signal: controller.signal,
            })
          )
        );

        const newData = {};
        entries.forEach(([key], index) => {
          const result = results[index];
          if (result.status === 'fulfilled' && result.value.data?.success) {
            newData[key] = result.value.data.data || [];
          } else {
            newData[key] = [];
            if (result.status === 'rejected' && result.reason?.name !== 'CanceledError') {
              console.warn(`Failed to fetch related data for "${key}":`, result.reason?.message);
            }
          }
        });

        setRelatedData(newData);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('useRelatedData error:', err);
        }
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [campusId]); // Re-fetch if campusId changes

  return relatedData;
};

export default useRelatedData;