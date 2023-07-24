import React, { useState } from "react";
import { Switch, FormControlLabel } from "@material-ui/core";
import "./GameSwitch.scss";

interface SwitchProps {
  label: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
}

const GameSwitch: React.FC<SwitchProps> = ({
  label,
  defaultValue,
  onChange,
}) => {
  const [checked, setChecked] = useState(defaultValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setChecked(value);
    onChange(value);
  };

  return (
    <FormControlLabel
      className="GameSwitch-switch"
      control={
        <Switch
          checked={checked}
          onChange={handleChange}
          color="primary"
        />
      }
      label={label}
      style={{color: "darkgray"}}
    />
  );
};

export default GameSwitch;