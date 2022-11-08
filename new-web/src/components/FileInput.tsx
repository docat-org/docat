import { useRef, useState } from "react";

import "./../style/components/FileInput.css";

export default function FileInput(props: {
  label: string;
  required: boolean;
  okTypes: string[];
  file: File | undefined;
  onChange: (file: File | undefined) => void;
}) {
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>(props.file?.name || "");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef(null);

  function updateFileIfValid(files: FileList | null): void {
    if (!files || !files[0]) {
      return;
    }

    const file = files[0];

    if (props.required && (!file || !file?.name)) {
      setValidationMessage("Please select a file");
      return;
    }

    if (!props.okTypes.find((x) => x === file!.type)) {
      setValidationMessage("This file type is not allowed");
      return;
    }

    setValidationMessage("");
    setFileName(file.name);
    props.onChange(file);
  }

  function handleDragEvents(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!e.dataTransfer.files || !e.dataTransfer.files[0]) {
      return;
    }

    updateFileIfValid(e.dataTransfer.files);
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    e.preventDefault();

    updateFileIfValid(e.target.files);
  }

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    if (inputRef && inputRef.current) {
      // @ts-ignore
      inputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      <label className="input-label" htmlFor="upload">
        {props.label}
        {props.required && <span className="red"> *</span>}
      </label>
      <div
        className={dragActive ? "file-drop-zone drag-active" : "file-drop-zone"}
        onDragEnter={handleDragEvents}
        onClick={onButtonClick}
      >
        <input
          name="upload"
          type="file"
          className="file-input"
          ref={inputRef}
          accept={props.okTypes.join(",")}
          onChange={handleSelect}
        />

        {fileName && (
          <>
            <p>{fileName}</p>
            <p>-</p>
          </>
        )}

        <p>Drag file here or</p>

        <button className="file-upload-button" type="button">
          click to browse.
        </button>

        {dragActive && (
          <div
            className="drag-file-element"
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
          ></div>
        )}
      </div>
      <p className="validation-message red">{validationMessage}</p>
    </div>
  );
}
