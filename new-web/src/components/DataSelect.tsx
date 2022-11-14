import { FormGroup, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  emptyMessage: string;
  errorMsg?: string;
  value?: string;
  label: string;
  dataSource: Promise<string[]>;
  onChange: (value: string) => void;
}

export default function DataSelect(props: Props): JSX.Element {
  const [data, setData] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(
    props.value ?? "none"
  );

  useEffect(() => {
    props.dataSource.then((res) => setData(res));
  }, [props.dataSource]);

  function onSelect(e: any): void {
    const value = e.target.value;

    setSelectedValue(value);
    props.onChange(value);
  }

  return (
    <>
      <FormGroup>
        <TextField
          onChange={onSelect}
          value={data.length > 0 ? selectedValue : "none"}
          label={props.label}
          error={!!props.errorMsg}
          helperText={props.errorMsg}
          select
        >
          <MenuItem value="none" disabled>
            {props.emptyMessage}
          </MenuItem>

          {data.map((value) => {
            return (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            );
          })}
        </TextField>
      </FormGroup>
    </>
  );
}
