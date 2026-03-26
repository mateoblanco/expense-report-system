import classNames from "classnames";
import styles from "./Field.module.scss";
import { formatAmountWithCurrency } from "@/utils/currency";

type Props = {
    label:string,
    size: "1-col" | "2-col",
    value: string,
    mode: "view" | "edit",
    onChange?: (value: string) => void,
    inputType?: "text" | "number" | "textarea",
    currency?: string | null,
}

const Field = (props: Props) => {

    const className = classNames(styles.field, {
        [styles.size_1]: props.size === "1-col",
        [styles.size_2]: props.size === "2-col",
    })

    const handleChange = (value: string) => {
        if (props.onChange) {
            props.onChange(value)
        }
    }

    const renderInput = () => {
        if (props.inputType === "textarea") {
            return (
                <textarea
                    className={styles.textarea}
                    value={props.value}
                    onChange={(e) => handleChange(e.target.value)}
                />
            )
        }
        if (props.inputType === "number") {
            return (
                <input
                    className={styles.input}
                    type="number"
                    value={props.value}
                    step="0.1"
                    onChange={(e) => handleChange(e.target.value)}
                />
            )
        }
        return (
            <input
                className={styles.input}
                type="text"
                value={props.value}
                onChange={(e) => handleChange(e.target.value)}
            />
        )
    }

    const renderValue = () => {
        const value = props.currency && props.value ? formatAmountWithCurrency(Number(props.value), props.currency) : props.value;
        return (
            <p className={styles.value}>
                {props.value ? value: "-"}
            </p>
        )
    }

    return (
        <div className={className}>
            <label className={styles.label}>{props.label}</label>
            {props.mode === "view" ? renderValue() : renderInput()}
        </div>
    )
}

export default Field;