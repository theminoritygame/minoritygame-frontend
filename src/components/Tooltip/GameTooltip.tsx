import React from 'react';
import { Tooltip, IconButton } from '@material-ui/core';
import { HelpSharp } from '@material-ui/icons';
import './GameTooltip.scss';

interface GameTooltipProps {
  title: string;
}

const GameTooltip: React.FC<GameTooltipProps> = ({ title }) => {
  return (
    <Tooltip title={<div className="tooltip-style">{title}</div>} placement="right-end">
      <IconButton>
        <HelpSharp className="icon" />
      </IconButton>
    </Tooltip>
  );
};

export default GameTooltip;