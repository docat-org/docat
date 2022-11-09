import styles from "./../style/components/StyledForm.module.css";

interface Props {
  children: JSX.Element[];
}

export default function StyledForm(props: Props): JSX.Element {
  //filter out <></> from children
  const children = props.children.filter(
    (child) => child.type.toString() !== "Symbol(react.fragment)"
  );

  return (
    <div className={styles["form"]}>
      {children
        .filter((c) => c && c !== <></>)
        .map((child, index) => {
          return (
            <div key={index} className={styles["form-item"]}>
              {child}
            </div>
          );
        })}
    </div>
  );
}
