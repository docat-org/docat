import { useState } from "react";
import "./../style/TextInput.css";

export default function TextInput(props: {
  label: string;
  required: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => string;
  placeholder: string | null;
  value: string | null;
}) {
  const [validationMessage, setValidationMessage] = useState<string>("");

  function validate(value: string): void {
    if (props.required && !value) {
      setValidationMessage("This field is required");
    } else if (props.required && value.trim() === "") {
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
    <div className="input-field">
      <label className="input-label" htmlFor={props.label}>
        {props.label}
        {props.required && <span className="red"> *</span>}
      </label>
      <input
        name={props.label}
        className="input"
        required={props.required}
        placeholder={props.placeholder || ""}
        value={props.value || ""}
        onChange={handleChange}
      />
      <p className="validation-message red">{validationMessage}</p>
    </div>
  );
}
