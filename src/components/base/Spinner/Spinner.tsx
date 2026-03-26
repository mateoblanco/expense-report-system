import styles from "./Spinner.module.scss";
import classNames from "classnames";

type Props= {
    size?: "small" | "medium" | "large",

}
const Spinner = (props: Props) => {
    const spinnerStyles = classNames(styles.spinner, {
        [styles.small]: props.size === "small",
    });
    return (
        <div className={spinnerStyles} />
    )
}

export default Spinner;