import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Paper,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Menu,
  MenuItem,
  LinearProgress,
  TextField,
  Fab,
  Skeleton,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add,
  Close,
  SwapHoriz,
  Email,
  Send,
  Block,
  Download,
  Edit,
  Visibility,
  Delete,
  Inbox,
  Upload,
  MoreVert,
  FileDownload,
  FileUpload,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import KPICards from './KpiCard';
import FilterBar from './FilterBar';
import ExportDialog from './Exportdialog';
import ImportDialog from './Importdialog';
import useEntityManager from '../../hooks/useEntityManager';
import useBulkActions from '../../hooks/useBulkActions';
import api from '../../api/axiosInstance';

/**
 * GENERIC ENTITY MANAGEMENT PAGE - FINAL VERSION 
 * @param {Object} props - Configuration props
 */

const GenericEntityPage = ({
  entityName,
  entityNamePlural,
  apiEndpoint,
  tableColumns,
  filterConfig,
  getKPIMetrics,
  FormComponent,
  DetailComponent,
  renderTableRow,
  bulkActions = ['changeClass', 'sendEmail', 'archive', 'export'],
  addButtonText,
  addButtonIcon,
  searchPlaceholder,
  enableImport = true,   // Enable import feature
  enableExport = true,   // Enable export feature
}) => {
  const { campusId } = useParams();
  const theme = useTheme();
  
  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.down('lg'));
  
  const isMobile = isSm;

  // ========================================
  // HOOKS
  // ========================================

  const {
    entities,
    total,
    loading,
    kpis,
    kpiLoading,
    fetchEntities,
    fetchKPIs,
    deleteEntity,
    filters,
    setFilters,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  } = useEntityManager({
    apiEndpoint,
    campusId,
    initialRowsPerPage: 10,
  });

  const {
    selectedIds,
    selectedCount,
    hasSelection,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
    isSelected,
    bulkChangeClass,
    bulkSendEmail,
    bulkArchive,
    bulkExport,
    processing,
  } = useBulkActions({
    apiEndpoint,
    entities,
    onSuccess: () => {
      fetchEntities();
      fetchKPIs();
    },
    onError: (error) => {
      showSnackbar(error, 'error');
    },
  });

  // ========================================
  // LOCAL STATE
  // ========================================

  const [relatedData, setRelatedData] = useState({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulkClassModalOpen, setIsBulkClassModalOpen] = useState(false);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); 
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewEntity, setViewEntity] = useState(null);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [bulkClassId, setBulkClassId] = useState('');
  const [bulkEmail, setBulkEmail] = useState({ subject: '', message: '' });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // ========================================
  // FETCH RELATED DATA
  // ========================================

  useEffect(() => {
    const controller = new AbortController();
  
    const fetchRelatedData = async () => {
      try {
        const resClasses = await api.get('/class', {
          params: { campusId },
          signal: controller.signal
        });
  
        if (resClasses.data?.success) {
          setRelatedData(prev => ({
            ...prev,
            classes: resClasses.data.data || []
          }));
        }
  
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error(err);
        }
      }
    };
  
    if (campusId) fetchRelatedData();
  
    return () => controller.abort();
  
  }, [campusId]);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const computedFilters = useMemo(() => {
    if (typeof filterConfig === 'function') {
      return filterConfig(relatedData.classes || []);
    }
    if (Array.isArray(filterConfig)) {
      return filterConfig;
    }
    return [];
  }, [filterConfig, relatedData.classes]);

  const metrics = useMemo(() => 
    getKPIMetrics(kpis, theme), 
    [kpis, theme, getKPIMetrics]
  );

  // ========================================
  // HANDLERS (useCallback for performance)
  // ========================================

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  }, [setFilters, setPage]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setPage(0);
  }, [setFilters, setSearch, setPage]);

  const handleOpenFormModal = useCallback((entity = null) => {
    setSelectedEntity(entity);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenDrawer = useCallback((entity) => {
    setViewEntity(entity);
    setIsDrawerOpen(true);
  }, []);

  const handleArchive = useCallback(async (id) => {
    if (window.confirm(`Are you sure you want to archive this ${entityName}?`)) {
      const result = await deleteEntity(id);
      if (result.success) {
        showSnackbar(`${entityName} archived successfully`);
      } else {
        showSnackbar(result.error || `Failed to archive ${entityName}`, 'error');
      }
    }
  }, [entityName, deleteEntity, showSnackbar]);

  const handleFormSuccess = useCallback((message) => {
    setIsFormModalOpen(false);
    fetchEntities();
    fetchKPIs();
    showSnackbar(message);
  }, [fetchEntities, fetchKPIs, showSnackbar]);

  // Import success handler
  const handleImportSuccess = useCallback((message) => {
    setIsImportDialogOpen(false);
    fetchEntities();
    fetchKPIs();
    showSnackbar(message, 'success');
  }, [fetchEntities, fetchKPIs, showSnackbar]);

  // Bulk actions handlers
  const handleBulkChangeClassSubmit = useCallback(async () => {
    if (!bulkClassId) {
      showSnackbar('Please select a class', 'error');
      return;
    }

    const result = await bulkChangeClass(bulkClassId);
    
    if (result.success) {
      setIsBulkClassModalOpen(false);
      setBulkClassId('');
      showSnackbar(result.message);
    } else {
      showSnackbar(result.error, 'error');
    }
  }, [bulkClassId, bulkChangeClass, showSnackbar]);

  const handleBulkSendEmailSubmit = useCallback(async () => {
    if (!bulkEmail.subject || !bulkEmail.message) {
      showSnackbar('Please fill in subject and message', 'error');
      return;
    }

    const result = await bulkSendEmail(bulkEmail.subject, bulkEmail.message);
    
    if (result.success) {
      setIsBulkEmailModalOpen(false);
      setBulkEmail({ subject: '', message: '' });
      showSnackbar(result.message);
    } else {
      showSnackbar(result.error, 'error');
    }
  }, [bulkEmail, bulkSendEmail, showSnackbar]);

  const handleBulkArchiveSubmit = useCallback(async () => {
    if (!window.confirm(`Archive ${selectedCount} ${entityName}(s)?`)) return;

    const result = await bulkArchive();
    
    if (result.success) {
      showSnackbar(result.message);
    } else {
      showSnackbar(result.error, 'error');
    }
  }, [selectedCount, entityName, bulkArchive, showSnackbar]);

  const handleBulkExportSubmit = useCallback(async () => {
    setIsExportDialogOpen(true);
    setBulkMenuAnchor(null);
  }, []);

  const handleBulkAction = useCallback((action) => {
    setBulkMenuAnchor(null);
    switch (action) {
      case 'changeClass':
        setIsBulkClassModalOpen(true);
        break;
      case 'sendEmail':
        setIsBulkEmailModalOpen(true);
        break;
      case 'archive':
        handleBulkArchiveSubmit();
        break;
      case 'export':
        handleBulkExportSubmit();
        break;
      default:
        break;
    }
  }, [handleBulkArchiveSubmit, handleBulkExportSubmit]);

  // ========================================
  // RENDER HELPERS
  // ========================================

  // Empty State Component
  const EmptyState = ({ title, description, actionText, onAction }) => (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Inbox sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title || `No ${entityNamePlural.toLowerCase()} found`}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description || `Try adjusting your filters or add a new ${entityName.toLowerCase()}.`}
      </Typography>
      {onAction && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAction}
          sx={{ borderRadius: 2 }}
        >
          {actionText || `Add ${entityName}`}
        </Button>
      )}
    </Box>
  );

  // Mobile Card Component
  const MobileCard = ({ entity }) => (
    <Card elevation={2} sx={{ borderRadius: 2, transition: 'all 0.2s', '&:hover': { boxShadow: theme.shadows[4] } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Checkbox checked={isSelected(entity._id)} onChange={() => handleSelectOne(entity._id)} sx={{ mt: -1 }} />
          <Stack spacing={1} flex={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {entity.firstName} {entity.lastName || entity.name || 'Entity'}
            </Typography>
            {entity.email && (
              <Typography variant="caption" color="text.secondary">
                {entity.email}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', px: 2 }}>
        <IconButton size="small" onClick={() => handleOpenDrawer(entity)} sx={{ color: 'primary.main' }}>
          <Visibility fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleOpenFormModal(entity)} sx={{ color: 'info.main' }}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleArchive(entity._id)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <Box component="main" sx={{ py: { xs: 2, sm: 4, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* Header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box>
              <Typography variant={isXs ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
                {entityNamePlural} Management
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Comprehensive {entityNamePlural.toLowerCase()} oversight and administration
              </Typography>
            </Box>

            {/* Desktop Actions */}
            {!isXs && (
              <Stack direction="row" spacing={1}>
                {/*Import/Export Buttons */}
                {(enableImport || enableExport) && (
                  <IconButton
                    onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                    sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
                
                <Button
                  startIcon={addButtonIcon || <Add />}
                  variant="contained"
                  onClick={() => handleOpenFormModal()}
                  sx={{ px: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: theme.shadows[4], whiteSpace: 'nowrap' }}
                >
                  {addButtonText || `Add ${entityName}`}
                </Button>
              </Stack>
            )}
          </Stack>

          {/* KPI Cards */}
          <KPICards metrics={metrics} loading={kpiLoading} />

          {/* Filters */}
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            filters={computedFilters}
            filterValues={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            searchPlaceholder={searchPlaceholder || `Search ${entityNamePlural.toLowerCase()}...`}
          />

          {/* Bulk Actions Bar */}
          {hasSelection && (
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.lighter' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedCount} selected
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={!isXs && <SwapHoriz />}
                    onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    disabled={processing}
                    sx={{ minWidth: isXs ? 'auto' : undefined }}
                  >
                    {isXs ? 'Actions' : 'Bulk Actions'}
                  </Button>
                  <IconButton size="small" onClick={clearSelection}>
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          )}

          {/* Content - Responsive */}
          {loading ? (
            <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
              <Stack spacing={2}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Paper>
          ) : entities.length === 0 ? (
            <Paper elevation={3} sx={{ borderRadius: 3 }}>
              <EmptyState
                title={`No ${entityNamePlural.toLowerCase()} found`}
                description={`Try adjusting your filters or add a new ${entityName.toLowerCase()}.`}
                actionText={`Add ${entityName}`}
                onAction={() => handleOpenFormModal()}
              />
            </Paper>
          ) : isMobile ? (
            <Stack spacing={2}>
              {entities.map((entity) => (
                <MobileCard key={entity._id} entity={entity} />
              ))}
            </Stack>
          ) : (
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <TableContainer 
                sx={{ 
                  overflowX: 'auto', 
                  maxWidth: '100%', 
                  '&::-webkit-scrollbar': { 
                    height: 8, 
                  }, 
                  '&::-webkit-scrollbar-track': { 
                    bgcolor: 'grey.100' 
                  }, 
                  '&::-webkit-scrollbar-thumb': { 
                    bgcolor: 'grey.400', 
                    borderRadius: 4, 
                    '&:hover': { 
                      bgcolor: 'grey.600' 
                    },
                  }, 
                }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: 'background.neutral' }}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.length === entities.length}
                          indeterminate={selectedIds.length > 0 && selectedIds.length < entities.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      {tableColumns.map((col) => (
                        <TableCell key={col.key} sx={{ fontWeight: 700 }} align={col.align || 'left'}>
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entities.map((entity) =>
                      renderTableRow(entity, {
                        selected: isSelected(entity._id),
                        onSelect: () => handleSelectOne(entity._id),
                        onView: () => handleOpenDrawer(entity),
                        onEdit: () => handleOpenFormModal(entity),
                        onArchive: () => handleArchive(entity._id),
                        theme,
                        isMobile,
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ 
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } 
                  }, 
                }}
              />
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Floating Action Button - Mobile Only */}
      {isXs && (
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={() => handleOpenFormModal()} 
          sx={{ position: 'fixed', bottom: { xs: 80, sm: 16 }, right: 16, zIndex: 1000 }}
        >
          <Add />
        </Fab>
      )}

      {/*  More Menu (Import/Export) */}
      <Menu 
        anchorEl={moreMenuAnchor} 
        open={Boolean(moreMenuAnchor)} 
        onClose={() => setMoreMenuAnchor(null)}
      >
        {enableImport && (
          <MenuItem onClick={() => { setIsImportDialogOpen(true); setMoreMenuAnchor(null); }}>
            <FileUpload sx={{ mr: 1 }} /> Import
          </MenuItem>
        )}
        {enableExport && (
          <MenuItem onClick={() => { setIsExportDialogOpen(true); setMoreMenuAnchor(null); }}>
            <FileDownload sx={{ mr: 1 }} /> Export
          </MenuItem>
        )}
      </Menu>

      {/* Form Modal */}
      <Dialog 
        open={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        maxWidth="md" 
        fullWidth 
        fullScreen={isXs}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {selectedEntity ? `Edit ${entityName}` : `Add New ${entityName}`}
          <IconButton 
            onClick={() => setIsFormModalOpen(false)} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {FormComponent && (
            <FormComponent 
              initialData={selectedEntity} 
              onSuccess={handleFormSuccess} 
              onCancel={() => setIsFormModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer 
        anchor="right" 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        sx={{ 
            '& .MuiDrawer-paper': { 
              width: { xs: '100%', sm: 400, md: 450 }, 
              maxWidth: '90vw' 
            }, 
          }}
        >
        {viewEntity && DetailComponent && (
          <DetailComponent
            entity={viewEntity}
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            onEdit={() => { 
              setIsDrawerOpen(false); 
              handleOpenFormModal(viewEntity); 
            }}
            onArchive={() => { 
              setIsDrawerOpen(false); 
              handleArchive(viewEntity._id); 
            }}
          />
        )}
      </Drawer>

      {/*Export Dialog */}
      {enableExport && (
        <ExportDialog
          open={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          apiEndpoint={apiEndpoint}
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          selectedIds={selectedIds}
          filters={filters}
        />
      )}

      {/* Import Dialog */}
      {enableImport && (
        <ImportDialog
          open={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          apiEndpoint={apiEndpoint}
          entityName={entityName}
          entityNamePlural={entityNamePlural}
          campusId={campusId}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Bulk Class Modal */}
      <Dialog 
        open={isBulkClassModalOpen} 
        onClose={() => setIsBulkClassModalOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={isXs}
      >
        <DialogTitle>
          Change Class for {selectedCount} {entityName}(s)
          <IconButton 
            onClick={() => setIsBulkClassModalOpen(false)} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField 
            select 
            fullWidth 
            label="New Class" 
            value={bulkClassId} 
            onChange={(e) => setBulkClassId(e.target.value)} 
            sx={{ mt: 2 }}
          >
            {(relatedData.classes || []).map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.className}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setIsBulkClassModalOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBulkChangeClassSubmit} 
            disabled={processing}
          >
            Change Class
          </Button>
        </Box>
      </Dialog>

      {/* Bulk Email Modal */}
      <Dialog 
        open={isBulkEmailModalOpen} 
        onClose={() => setIsBulkEmailModalOpen(false)} 
        maxWidth="sm" 
        fullWidth 
        fullScreen={isXs}
      >
        <DialogTitle>
          Send Email to {selectedCount} {entityName}(s)
          <IconButton 
            onClick={() => setIsBulkEmailModalOpen(false)} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField 
              fullWidth 
              label="Subject" 
              value={bulkEmail.subject} 
              onChange={(e) => setBulkEmail(prev => ({ ...prev, subject: e.target.value }))} 
            />
            <TextField 
              fullWidth 
              label="Message" 
              multiline rows={6} 
              value={bulkEmail.message} 
              onChange={(e) => setBulkEmail(prev => ({ ...prev, message: e.target.value }))} 
            />
          </Stack>
        </DialogContent>
        <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setIsBulkEmailModalOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />} 
            onClick={handleBulkSendEmailSubmit} 
            disabled={processing}
          >
              Send
          </Button>
        </Box>
      </Dialog>

      {/* Bulk Actions Menu */}
      <Menu 
        anchorEl={bulkMenuAnchor} 
        open={Boolean(bulkMenuAnchor)} 
        onClose={() => setBulkMenuAnchor(null)}
      >
        {bulkActions.includes('changeClass') && (
          <MenuItem onClick={() => handleBulkAction('changeClass')}>
            <SwapHoriz sx={{ mr: 1 }} /> Change Class
          </MenuItem>
        )}
        {bulkActions.includes('sendEmail') && (
          <MenuItem onClick={() => handleBulkAction('sendEmail')}>
            <Email sx={{ mr: 1 }} /> Send Email
          </MenuItem>
        )}
        {bulkActions.includes('archive') && (
          <MenuItem onClick={() => handleBulkAction('archive')}>
            <Block sx={{ mr: 1 }} /> Archive
          </MenuItem>
        )}
        {bulkActions.includes('export') && (
          <MenuItem onClick={() => handleBulkAction('export')}>
            <Download sx={{ mr: 1 }} /> Export
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: isXs ? 'center' : 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GenericEntityPage;