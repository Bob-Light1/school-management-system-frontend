import React, { useState } from 'react';
import { TextField, Button, Stack, InputAdornment, IconButton, Alert } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

const ChangePasswordForm = ({ studentId, on处Success }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: 'info' });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/students/${studentId}/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setStatus({ msg: 'Mot de passe mis à jour !', type: 'success' });
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      setStatus({ 
        msg: error.response?.data?.message || 'Erreur lors de la mise à jour', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      {status.msg && <Alert severity={status.type}>{status.msg}</Alert>}

      <Formik
        initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        validationSchema={passwordSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Stack spacing={2}>
              <TextField
                fullWidth
                type={showPwd ? 'text' : 'password'}
                name="currentPassword"
                label="Ancien mot de passe"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentPassword && !!errors.currentPassword}
                helperText={touched.currentPassword && errors.currentPassword}
                slotProps={{
                  input: {
                    startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
                  }
                }}
              />

              <TextField
                fullWidth
                type={showPwd ? 'text' : 'password'}
                name="newPassword"
                label="Nouveau mot de passe"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && !!errors.newPassword}
                helperText={touched.newPassword && errors.newPassword}
              />

              <TextField
                fullWidth
                type={showPwd ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPwd(!showPwd)}>
                          {showPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ py: 1.5, fontWeight: 'bold' }}
              >
                {isSubmitting ? 'Mise à jour...' : 'Changer le mot de passe'}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Stack>
  );
};

export default ChangePasswordForm;