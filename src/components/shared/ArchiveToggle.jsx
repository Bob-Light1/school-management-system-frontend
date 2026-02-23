import { FormControlLabel, Switch, Typography } from '@mui/material';

const ArchiveToggle = ({ checked, onChange }) => (
  <FormControlLabel
    control={
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="secondary"
      />
    }
    label={
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Show Archived
      </Typography>
    }
  />
);

export default ArchiveToggle;