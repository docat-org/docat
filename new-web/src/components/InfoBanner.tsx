import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
  errorMsg?: string;
  successMsg?: string;
  timeout?: number;
}

class Message {
  msg: string = "";
  type: "error" | "success" = "error";

  constructor(props: Props) {
    this.msg = props.errorMsg || props.successMsg || "";
    this.type = props.errorMsg ? "error" : "success";
  }
}

export default function Banner(props: Props): JSX.Element {
  const [msg, setMsg] = useState<Message>(new Message(props));
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (props.errorMsg || props.successMsg) {
      setMsg(new Message(props));
      setShow(true);
    }
  }, [props]);

  return (
    <Snackbar
      key={`${msg.msg}`}
      open={show}
      autoHideDuration={props.timeout || 6000}
      onClose={() => setShow(false)}
    >
      <Alert
        onClose={() => setShow(false)}
        severity={msg.type}
        sx={{ width: "100%" }}
      >
        {msg.msg}
      </Alert>
    </Snackbar>
  );
}
