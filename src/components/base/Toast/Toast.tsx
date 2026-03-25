import { Toast as BaseToast } from '@base-ui/react/toast';
import styles from './Toast.module.scss';
import classNames from 'classnames';

export enum ToastType {
    ERROR = 'error',
}

const Toast = () => {
    const { toasts } = BaseToast.useToastManager();
    return (
        <BaseToast.Portal>
            <BaseToast.Viewport className={styles.Viewport}>
                {toasts.map((toast) => {
                    const toastClassName = classNames(styles.Toast, {
                        [styles.error]: toast.type === ToastType.ERROR,
                    });

                    return (
                        <BaseToast.Root key={toast.id} toast={toast} swipeDirection="up" className={toastClassName}>
                            <BaseToast.Content className={styles.Content}>
                                <BaseToast.Title className={styles.Title} />
                                <BaseToast.Description className={styles.Description} />
                                <BaseToast.Close className={styles.Close} aria-label="Close">
                                    <XIcon className={styles.Icon} width={16} height={16} />
                                </BaseToast.Close>
                            </BaseToast.Content>
                        </BaseToast.Root>
                    )
                })}
            </BaseToast.Viewport>
        </BaseToast.Portal>
    )
}

export default Toast;



function XIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}