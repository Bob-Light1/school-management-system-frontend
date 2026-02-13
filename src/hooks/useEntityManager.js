import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance'

/**
 * CUSTOM HOOK: useEntityManager
 * 
 * @param {Object} options - Configuration
 * @param {String} options.apiEndpoint - Endpoint API (ex: 'students', 'teachers')
 * @param {String} options.campusId - ID du campus
 * @param {Number} options.initialRowsPerPage - Lignes par page par défaut (10)
 */

const useEntityManager = ({ 
  apiEndpoint, 
  campusId,
  initialRowsPerPage = 10 
}) => {
  // ========================================
  // STATE
  // ========================================
  const [entities, setEntities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [kpiLoading, setKpiLoading] = useState(true);
  
  // Filters & Search
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // ========================================
  // FETCH KPIs
  // ========================================
  const fetchKPIs = useCallback(async () => {
    if (!campusId) return;
    
    setKpiLoading(true);
    try {
      const res = await api.get(`/campus/${campusId}/dashboard`);

      if (res.data && res.data.success) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setKpis({});
    } finally {
      setKpiLoading(false);
    }
  }, [apiEndpoint, campusId]);

  // ========================================
  // FETCH ENTITIES
  // ========================================
  const fetchEntities = useCallback(async (signal) => {
    
    // Validate MongoDB ObjectId format
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(campusId);
    if (!campusId || !isMongoId) {
      setLoading(false);
      return;
    };

    setLoading(true);

    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search,
        campus: campusId,
        ...filters
      };

      const res = await api.get(`/${apiEndpoint}`, {
        params,
        signal,
      });

      if (res.data && res.data.success) {
        setEntities(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        
      }
    } catch (err) {
      if (err.name !== 'CanceledError') { 
        console.error(`Error loading ${apiEndpoint}:`, err);
      }

      setEntities([]);
      setTotal(0);

    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, campusId, page, rowsPerPage, search, filters]);

  // ========================================
  // CREATE ENTITY
  // ========================================
  const createEntity = useCallback(async (data) => {
    try {
      const res = await api.post(`/${apiEndpoint}`, data );

      if (res.data && res.data.success) {
        await fetchEntities();
        await fetchKPIs();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      console.error(`Error creating ${apiEndpoint}:`, err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create' 
      };
    }
  }, [apiEndpoint, fetchEntities, fetchKPIs]);

  // ========================================
  // UPDATE ENTITY
  // ========================================
  const updateEntity = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/${apiEndpoint}/${id}`, data);

      if (res.data && res.data.success) {
        await fetchEntities();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      console.error(`Error updating ${apiEndpoint}:`, err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update' 
      };
    }
  }, [apiEndpoint, fetchEntities]);

  // ========================================
  // DELETE ENTITY (Archive)
  // ========================================
  const deleteEntity = useCallback(async (id) => {
    try {
      const res = await api.delete(`/${apiEndpoint}/${id}`);

      if (res.data && res.data.success) {
        await fetchEntities();
        await fetchKPIs();
        return { success: true };
      }
    } catch (err) {
      console.error(`Error deleting ${apiEndpoint}:`, err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete' 
      };
    }
  }, [apiEndpoint, fetchEntities, fetchKPIs]);

  // ========================================
  // EFFECTS
  // ========================================
  
  // Fetch KPIs on mount and when campusId changes
  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Fetch entities when dependencies change
  useEffect(() => {
    const controller = new AbortController();

    if (search) {
      // if user is tiping, wait 500ms

      const timer = setTimeout(() => {
        fetchEntities(controller.signal);
      }, 500);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };

    } else {
      
      // direct fecth for pages or filters
      fetchEntities(controller.signal);
      return () => controller.abort();
    }

  }, [fetchEntities, search]);

  // ========================================
  // RETURN
  // ========================================
  return {
    // Data
    entities,
    total,
    loading,
    kpis,
    kpiLoading,
    
    // Actions
    fetchEntities,
    fetchKPIs,
    createEntity,
    updateEntity,
    deleteEntity,
    
    // Filters & Search
    filters,
    setFilters,
    search,
    setSearch,
    
    // Pagination
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
};

export default useEntityManager;