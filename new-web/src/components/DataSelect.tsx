import { FormGroup, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./../style/components/DataSelect.module.css";

interface Props {
  emptyMessage: string;
  label: string;
  dataSource: Promise<string[]>;
  onChange: (value: string) => void;
}

export default function DataSelect(props: Props): JSX.Element {
  const [data, setData] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("none");

  useEffect(() => {
    props.dataSource.then((res) => setData(res));
  }, [props.dataSource]);

  function onSelect(e: any): void {
    setSelectedValue(e.target.value);
    props.onChange(e.target.value);
  }

  return (
    <>
      <FormGroup className={styles["form"]}>
        <TextField
          className={styles["select"]}
          onChange={onSelect}
          value={selectedValue}
          label={props.label}
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
