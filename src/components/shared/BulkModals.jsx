import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';

/**
 * BulkClassModal
 * Dialog to reassign a class to selected entities.
 */
export const BulkClassModal = ({
  open,
  onClose,
  entityName,
  selectedCount,
  classes = [],
  bulkClassId,
  setBulkClassId,
  onSubmit,
  processing,
  isXs,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    fullScreen={isXs}
    disableEnforceFocus
    closeAfterTransition={false}
    aria-labelledby="bulk-class-modal"
  >
    <DialogTitle id="bulk-class-modal">
      Change Class for {selectedCount} {entityName}(s)
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
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
        {classes.map((cls) => (
          <MenuItem key={cls._id} value={cls._id}>
            {cls.className}
          </MenuItem>
        ))}
      </TextField>
    </DialogContent>
    <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSubmit} disabled={processing}>
        Change Class
      </Button>
    </Box>
  </Dialog>
);

/**
 * BulkEmailModal
 * Dialog to send an email to selected entities.
 */
export const BulkEmailModal = ({
  open,
  onClose,
  entityName,
  selectedCount,
  bulkEmail,
  setBulkEmail,
  onSubmit,
  processing,
  isXs,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    fullScreen={isXs}
    disableEnforceFocus
    closeAfterTransition={false}
    aria-labelledby="bulk-email-modal"
  >
    <DialogTitle id="bulk-email-modal">
      Send Email to {selectedCount} {entityName}(s)
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <Close />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Subject"
          value={bulkEmail.subject}
          onChange={(e) => setBulkEmail((prev) => ({ ...prev, subject: e.target.value }))}
        />
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={6}
          value={bulkEmail.message}
          onChange={(e) => setBulkEmail((prev) => ({ ...prev, message: e.target.value }))}
        />
      </Stack>
    </DialogContent>
    <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" startIcon={<Send />} onClick={onSubmit} disabled={processing}>
        Send
      </Button>
    </Box>
  </Dialog>
);