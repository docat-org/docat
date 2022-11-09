import { useEffect, useState } from "react";
import styles from "./../style/components/Banner.module.css";

interface Props {
  errorMsg?: string;
  successMsg?: string;
  timeout?: number;
}

export default function Banner(props: Props): JSX.Element {
  const [msg, setMsg] = useState<string>(
    props.errorMsg || props.successMsg || ""
  );
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (props.errorMsg || props.successMsg) {
      setMsg(props.errorMsg || props.successMsg || "");
      setShow(true);
      setTimeout(() => setShow(false), props.timeout || 5000);
    }
  }, [props.errorMsg, props.successMsg, props.timeout]);

  if (show && props.successMsg) {
    return <div className={styles["success-banner"]}>{msg}</div>;
  }

  if (show && props.errorMsg) {
    return <div className={styles["error-banner"]}>{msg}</div>;
  }

  return <></>;
}
