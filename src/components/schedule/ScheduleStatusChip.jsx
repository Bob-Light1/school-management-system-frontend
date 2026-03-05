import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     color: 'default'  },
  PUBLISHED: { label: 'Published', color: 'success'  },
  POSTPONED: { label: 'Postponed', color: 'warning'  },
  CANCELLED: { label: 'Cancelled', color: 'error'    },
};

const ScheduleStatusChip = ({ status, size = 'small' }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size={size} />;
};

export default ScheduleStatusChip;