import React, { useEffect } from 'react';
import {
  Grid, Button, CircularProgress, Collapse,
  Stack, Snackbar, Alert,
  useTheme, useMediaQuery, Box,
} from '@mui/material';
import {
  Person, Email, Phone, Lock, Domain,
  FamilyRestroom, Badge, Work, Cake, Language, Cancel, Check,
} from '@mui/icons-material';

import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';

import { createParentSchema }         from '../../../yupSchema/createParentSchema';
import { createParent, updateParent } from '../../../services/parent.service';
import useRelatedData                  from '../../../hooks/useRelatedData';
import useFormSnackbar                 from '../../../hooks/useFormSnackBar';
import { getSubmitErrorMessage }       from '../../../utils/handleSubmitError';

import FormSection        from '../../../components/form/FormSection';
import {
  FormTextField,
  FormSelectField,
  FormDateField,
  FormPasswordField,
  CampusField,
} from '../../../components/form/FormFields';

// ─── Static option lists ──────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'father',   label: 'Father'   },
  { value: 'mother',   label: 'Mother'   },
  { value: 'guardian', label: 'Guardian' },
  { value: 'other',    label: 'Other'    },
];

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'French'  },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'ar', label: 'Arabic'  },
];

// ─── Endpoint config ──────────────────────────────────────────────────────────

const ENDPOINTS = {
  campus: (id) => `/campus/${id}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the JSON payload.
 * Empty string values are replaced with undefined so the backend ignores them.
 */
const buildPayload = (values, isEdit) => {
  const payload = {};

  Object.entries(values).forEach(([key, value]) => {
    if (isEdit && key === 'password' && !value) return;
    if (value === '' || value === null || value === undefined) return;
    payload[key] = value;
  });

  return payload;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
    <CircularProgress />
  </Box>
);

const FormActions = ({ isEdit, submitting, disabled, onCancel, isMobile, theme }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
    {onCancel && (
      <Button
        variant="outlined"
        onClick={onCancel}
        startIcon={<Cancel />}
        disabled={submitting}
        fullWidth={isMobile}
        sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Cancel
      </Button>
    )}
    <Button
      variant="contained"
      type="submit"
      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
      disabled={submitting || disabled}
      fullWidth={isMobile}
      sx={{
        px: 4, py: 1.5, borderRadius: 2,
        textTransform: 'none', fontWeight: 600,
        boxShadow: theme.shadows[4],
        '&:hover': { boxShadow: theme.shadows[8] },
      }}
    >
      {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Parent'}
    </Button>
  </Stack>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ParentForm = ({ initialData, onSuccess, onCancel }) => {
  const { campusId } = useParams();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit       = !!initialData;

  const { snackbar, showSnackbar, closeSnackbar } = useFormSnackbar();

  const { data: related, loading } = useRelatedData(ENDPOINTS, campusId);
  const campus = related.campus?.[0] ?? null;

  // ── Formik ──────────────────────────────────────────────────────────────────

  const formik = useFormik({
    initialValues: {
      firstName:         initialData?.firstName         || '',
      lastName:          initialData?.lastName          || '',
      email:             initialData?.email             || '',
      phone:             initialData?.phone             || '',
      password:          '',
      gender:            initialData?.gender            || 'male',
      relationship:      initialData?.relationship      || 'father',
      dateOfBirth:       initialData?.dateOfBirth?.split('T')[0] || '',
      nationalId:        initialData?.nationalId        || '',
      occupation:        initialData?.occupation        || '',
      preferredLanguage: initialData?.preferredLanguage || 'fr',
      notes:             initialData?.notes             || '',
      schoolCampus:      initialData?.schoolCampus?._id || campusId || '',
    },
    validationSchema: createParentSchema(isEdit),
    validateOnChange: true,
    validateOnBlur:   true,

    onSubmit: async (values, { resetForm }) => {
      const payload = buildPayload(values, isEdit);

      try {
        if (isEdit) {
          await updateParent(initialData._id, payload);
          onSuccess?.('Parent updated successfully');
        } else {
          await createParent(payload);
          onSuccess?.('Parent account created successfully');
          resetForm();
        }
      } catch (err) {
        console.error('ParentForm submit error:', err);
        showSnackbar(getSubmitErrorMessage(err), 'error');
      }
    },
  });

  // Sync schoolCampus once campus data is loaded
  useEffect(() => {
    const id = campus?._id ?? campusId;
    if (id && formik.values.schoolCampus !== id) {
      formik.setFieldValue('schoolCampus', id, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campus?._id]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={3}>

          {/* ── Personal Information ──────────────────────────────────── */}
          <FormSection title="Personal Information" />

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="firstName"  label="First Name"  icon={Person} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="lastName"   label="Last Name"   icon={Person} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelectField
              formik={formik}
              name="gender"
              label="Gender"
              options={GENDER_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelectField
              formik={formik}
              name="relationship"
              label="Relationship to Child"
              icon={FamilyRestroom}
              options={RELATIONSHIP_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDateField formik={formik} name="dateOfBirth" label="Date of Birth" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="nationalId"  label="National ID (optional)"  icon={Badge} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="occupation"  label="Occupation (optional)"   icon={Work}  />
          </Grid>

          {/* ── Contact & Security ────────────────────────────────────── */}
          <FormSection title="Contact & Security" />

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="email" label="Email Address" type="email" icon={Email} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField formik={formik} name="phone" label="Phone Number"  icon={Phone} />
          </Grid>

          <Collapse in={!isEdit} sx={{ width: '100%' }}>
            <Grid container spacing={3} sx={{ pl: 3, pr: 3 }}>
              <Grid size={{ xs: 12 }}>
                <FormPasswordField formik={formik} />
              </Grid>
            </Grid>
          </Collapse>

          {/* ── Preferences ──────────────────────────────────────────── */}
          <FormSection title="Preferences" subtitle="(optional)" />

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelectField
              formik={formik}
              name="preferredLanguage"
              label="Preferred Language"
              icon={Language}
              options={LANGUAGE_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CampusField campusName={campus?.campus_name} icon={Domain} />
          </Grid>

          {/* ── Admin Notes ──────────────────────────────────────────── */}
          <FormSection title="Internal Notes" subtitle="(admin only — not visible to parent)" />

          <Grid size={{ xs: 12 }}>
            <FormTextField
              formik={formik}
              name="notes"
              label="Notes"
              multiline
              rows={3}
            />
          </Grid>

          {/* ── Actions ──────────────────────────────────────────────── */}
          <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
            <FormActions
              isEdit={isEdit}
              submitting={formik.isSubmitting}
              disabled={!formik.isValid || !formik.dirty}
              onCancel={onCancel}
              isMobile={isMobile}
              theme={theme}
            />
          </Grid>

        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: theme.shadows[8] }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ParentForm;
