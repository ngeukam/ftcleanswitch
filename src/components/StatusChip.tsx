import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  status: string;
  labels?: Record<string, string>;
  colors?: Record<string, ChipProps['color']>;
  size?: ChipProps['size'];
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  labels = {},
  colors = {},
  size = 'small'
}) => {
  const getLabel = () => {
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getColor = (): ChipProps['color'] => {
    return colors[status] || 'default';
  };

  return (
    <Chip
      label={getLabel()}
      color={getColor()}
      size={size}
      variant="filled"
    />
  );
};

export default StatusChip;