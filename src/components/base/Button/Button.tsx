import { Button as BaseButton } from '@base-ui/react/button'
import styles from './Button.module.scss'
import classNames from 'classnames'
import Spinner from '../Spinner/Spinner'

type Props = {
    label?: string
    disabled?: boolean
    icon?: React.ReactNode
    variant: "primary" | "secondary"
    isLoading?: boolean
    fullWidth?: boolean
    onClick: () => void
}

const Button = (props: Props) => {
    const renderContent = () => {
        if (props.isLoading) {
            return <Spinner />
        }

        return <>
            {props.icon && props.icon}
            {props.label}
        </>
    }

    const buttonClassName = classNames(styles.button, {
        [styles.primary]: props.variant === "primary",
        [styles.secondary]: props.variant === "secondary",
        [styles.only_icon]: props.icon && !props.label,
        [styles.full_width]: props.fullWidth,
    })

    return (
        <BaseButton
            type="button"
            className={buttonClassName}
            onClick={props.onClick}
            disabled={props.disabled || props.isLoading}
        >
            {renderContent()}
        </BaseButton>
    )
}

export default Button
