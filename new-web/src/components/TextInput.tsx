import { useState } from "react";
import styles from "./../style/components/TextInput.module.css";

export default function TextInput(props: {
  label: string;
  required: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => string;
  placeholder: string | null;
  value: string | null;
}) {
  const [validationMessage, setValidationMessage] = useState<string>("");

  function validate(value: string): void {
    if (props.required && (!value || value.trim() === "")) {
      setValidationMessage("This field is required");
    } else {
      setValidationMessage("");
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = props.onChange(event);
    validate(newValue);
  }

  return (
    <div className={styles["input-field"]}>
      <label className={styles["input-label"]} htmlFor={props.label}>
        {props.label}
        {props.required && <span className={styles["red"]}> *</span>}
      </label>
      <input
        name={props.label}
        className={styles["input"]}
        required={props.required}
        placeholder={props.placeholder || ""}
        value={props.value || ""}
        onChange={handleChange}
      />
      <p className={`${styles["validation-message"]} ${styles["red"]}`}>
        {validationMessage}
      </p>
    </div>
  );
}
