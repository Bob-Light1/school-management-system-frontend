import React from 'react';
import { 
  Modal, Box, Typography, TextField, Button, Stack, 
  IconButton, Avatar, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { IMAGE_BASE_URL } from '../../../config/env';
import { API_BASE_URL } from '../../../config/env';
import { useAuth } from '../../../hooks/useAuth';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

export default function EditCampusModal({ open, handleClose, campusData, onUpdate }) {
  const [loading, setLoading] = React.useState(false);
  const { updateUser } = useAuth();

  const formik = useFormik({
    initialValues: {
      campus_name: campusData?.campus_name || '',
      manager_name: campusData?.manager_name || '',
      email: campusData?.email || '',
      image: null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      campus_name: Yup.string().required('Required'),
      manager_name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('campus_name', values.campus_name);
        fd.append('manager_name', values.manager_name);
        fd.append('email', values.email);
        if (values.image) fd.append('image', values.image);

        const cleanUrl = `${API_BASE_URL}/campus/update/${campusData._id}`.replace(/([^:]\/)\/+/g, "$1");

        const res = await axios.put(cleanUrl, fd, {
          headers: { 
            'Authorization': `Bearer ${token}`,
          }
        });

        if (res.data.success) {
          const updated = res.data.updatedCampus;

          onUpdate(updated);

          updateUser({
            manager_name: updated.manager_name,
            image_url: updated.campus_image,
            email: updated.email
          });

          handleClose();
        }

      } catch (error) {
        console.error("Update error:", error.response || error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">Edit Campus</Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {/* Preview & Upload Image */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src={formik.values.image ? URL.createObjectURL(formik.values.image) : `${IMAGE_BASE_URL}${campusData?.campus_image}`}
                sx={{ width: 80, height: 80 }}
              />
              <Button variant="text" component="label" startIcon={<PhotoCamera />} size="small">
                Change Logo
                <input hidden accept="image/*" type="file" onChange={(e) => formik.setFieldValue('image', e.target.files[0])} />
              </Button>
            </Box>

            <TextField
              fullWidth
              name="campus_name"
              label="Campus Name"
              value={formik.values.campus_name}
              onChange={formik.handleChange}
              error={formik.touched.campus_name && Boolean(formik.errors.campus_name)}
              helperText={formik.touched.campus_name && formik.errors.campus_name}
            />

            <TextField
              fullWidth
              name="manager_name"
              label="Manager Name"
              value={formik.values.manager_name}
              onChange={formik.handleChange}
              error={formik.touched.manager_name && Boolean(formik.errors.manager_name)}
              helperText={formik.touched.manager_name && formik.errors.manager_name}
            />

            <TextField
              fullWidth
              name="email"
              label="Contact Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
}