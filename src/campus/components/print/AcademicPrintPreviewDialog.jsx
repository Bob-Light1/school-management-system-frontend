import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Box, Typography, IconButton, Tooltip, Alert,
} from '@mui/material';
import {
  Close, Download, Refresh, PictureAsPdf,
} from '@mui/icons-material';

import { previewAcademicPdf } from '../../../services/academic_print.service';

const TYPE_LABELS = {
  STUDENT_CARD: 'Student ID Card',
  TRANSCRIPT:   'Academic Transcript',
  ENROLLMENT:   'Enrollment Certificate',
  TIMETABLE:    'Class Timetable',
};

/**
 * AcademicPrintPreviewDialog
 *
 * Fetches a PDF preview blob from the backend and renders it in an iframe.
 * Provides a download button for saving the generated file.
 *
 * Props:
 *   open       {boolean}
 *   onClose    {() => void}
 *   type       {'STUDENT_CARD'|'TRANSCRIPT'|'ENROLLMENT'|'TIMETABLE'}
 *   studentId  {string?}
 *   classId    {string?}
 *   params     {{ academicYear?, semester?, weekStart? }}
 *   label      {string?}  — display name for the target (student name / class)
 */
const AcademicPrintPreviewDialog = ({
  open, onClose, type, studentId, classId, params = {}, label = '',
}) => {
  const [blobUrl,  setBlobUrl]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const blobRef = useRef(null);

  const revokePreviousBlob = () => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
  };

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    revokePreviousBlob();

    try {
      const res  = await previewAcademicPdf({ type, studentId, classId, params });
      const url  = URL.createObjectURL(res.data);
      blobRef.current = url;
      setBlobUrl(url);
    } catch (err) {
      const msg = err?.response?.data?.message ?? err.message ?? 'Preview generation failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [type, studentId, classId, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) loadPreview();
    return () => { if (!open) { revokePreviousBlob(); setBlobUrl(null); } };
  }, [open, loadPreview]);

  // Cleanup on unmount
  useEffect(() => () => revokePreviousBlob(), []);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a      = document.createElement('a');
    a.href       = blobUrl;
    a.download   = `${type.toLowerCase()}_${label || 'preview'}_${Date.now()}.pdf`;
    a.click();
  };

  const docLabel = TYPE_LABELS[type] || type;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
        <PictureAsPdf color="error" />
        <Box flex={1}>
          <Typography fontWeight="bold">{docLabel} — Preview</Typography>
          {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
        </Box>
        <Tooltip title="Regenerate">
          <IconButton onClick={loadPreview} disabled={loading} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1} gap={2}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary">Generating PDF…</Typography>
          </Box>
        )}

        {!loading && error && (
          <Box p={3}>
            <Alert severity="error" action={
              <Button size="small" color="inherit" onClick={loadPreview}>Retry</Button>
            }>
              {error}
            </Alert>
          </Box>
        )}

        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            title={docLabel}
            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!blobUrl || loading}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcademicPrintPreviewDialog;
