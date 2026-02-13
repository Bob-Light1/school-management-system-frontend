import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';

/**
 * CUSTOM HOOK: useBulkActions
 * 
 * @param {Object} options - Configuration
 * @param {String} options.apiEndpoint - Endpoint API
 * @param {Array} options.entities - Liste des entités
 * @param {Function} options.onSuccess - Callback succès
 * @param {Function} options.onError - Callback erreur
 */
const useBulkActions = ({ 
  apiEndpoint, 
  entities = [],
  onSuccess,
  onError 
}) => {
  // ========================================
  // STATE
  // ========================================
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

  // ========================================
  // SELECTION HANDLERS
  // ========================================
  
  /**
   * Select or deselect all entities
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedIds(entities.map(e => e._id));
    } else {
      setSelectedIds([]);
    }
  }, [entities]);

  /**
   * Toggle selection for one entity
   */
  const handleSelectOne = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Check if ID is selected
   */
  const isSelected = useCallback((id) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Bulk change class/department
   */
  const bulkChangeClass = useCallback(async (newClassId) => {
    if (!newClassId || selectedIds.length === 0) {
      return { 
        success: false, 
        error: 'Please select entities and a class' 
      };
    }

    setProcessing(true);
    try {
      const res = await api.post(
        `/${apiEndpoint}/bulk/change-class`,
        { 
          entityIds: selectedIds, 
          newRelatedId: newClassId 
        }
      );

      if (res.data && res.data.success) {
        clearSelection();
        if (onSuccess) onSuccess();
        return { 
          success: true, 
          message: `Successfully moved ${selectedIds.length} entities` 
        };
      }
    } catch (err) {
      console.error('Bulk change class error:', err);
      const error = err.response?.data?.message || 'Failed to change class';
      if (onError) onError(error);
      return { success: false, error };
    } finally {
      setProcessing(false);
    }
  }, [apiEndpoint, selectedIds, clearSelection, onSuccess, onError]);

  /**
   * Bulk send email
   */
  const bulkSendEmail = useCallback(async (subject, message) => {
    if (!subject || !message || selectedIds.length === 0) {
      return { 
        success: false, 
        error: 'Please fill in subject, message and select entities' 
      };
    }

    setProcessing(true);
    try {
      const res = await api.post(
        `/${apiEndpoint}/bulk/email`,
        { 
          entityIds: selectedIds, 
          subject, 
          message 
        }
      );

      if (res.data && res.data.success) {
        clearSelection();
        return { 
          success: true, 
          message: `Email sent to ${selectedIds.length} entities` 
        };
      }
    } catch (err) {
      console.error('Bulk email error:', err);
      const error = err.response?.data?.message || 'Failed to send emails';
      if (onError) onError(error);
      return { success: false, error };
    } finally {
      setProcessing(false);
    }
  }, [apiEndpoint, selectedIds, clearSelection, onError]);

  /**
   * Bulk archive
   */
  const bulkArchive = useCallback(async () => {
    if (selectedIds.length === 0) {
      return { success: false, error: 'Please select entities' };
    }

    setProcessing(true);
    try {
      const res = await api.post(
        `/${apiEndpoint}/bulk/archive`,
        { entityIds: selectedIds }
      );

      if (res.data && res.data.success) {
        clearSelection();
        if (onSuccess) onSuccess();
        return { 
          success: true, 
          message: `Successfully archived ${selectedIds.length} entities` 
        };
      }
    } catch (err) {
      console.error('Bulk archive error:', err);
      
      const error = err.response?.data?.message || 'Failed to archive';
      if (onError) onError(error);
      return { success: false, error };

    } finally {
      setProcessing(false);
    }
  }, [apiEndpoint, selectedIds, clearSelection, onSuccess, onError]);

  /**
   * Export selected entities to CSV
   */
  const bulkExport = useCallback(async () => {
    if (selectedIds.length === 0) {
      return { success: false, error: 'Please select entities' };
    }

    setProcessing(true);
    try {
      const res = await api.get(
        `/${apiEndpoint}/export`,
        {
          params: { entityIds: selectedIds.join(',') },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${apiEndpoint}_selected_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { 
        success: true, 
        message: `Exported ${selectedIds.length} entities` 
      };

    } catch (err) {
      console.error('Export error:', err);

      const error = err.response?.data?.message || 'Failed to export';
      if (onError) onError(error);
      return { success: false, error };

    } finally {
      setProcessing(false);
    }
  }, [apiEndpoint, selectedIds, onError]);

  // ========================================
  // RETURN
  // ========================================
  return {
    // Selection state
    selectedIds,
    selectedCount: selectedIds.length,
    hasSelection: selectedIds.length > 0,
    
    // Selection handlers
    handleSelectAll,
    handleSelectOne,
    clearSelection,
    isSelected,
    
    // Bulk operations
    bulkChangeClass,
    bulkSendEmail,
    bulkArchive,
    bulkExport,
    
    // Processing state
    processing,
  };
};

export default useBulkActions;