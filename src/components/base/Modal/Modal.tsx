import { Dialog } from '@base-ui/react/dialog';
import classNames from 'classnames';
import styles from './Modal.module.scss';

type Props = {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scrollable?: boolean;
    popupClassName?: string;
}

const Modal = (props: Props) => {

    return (
        <Dialog.Root
            open={props.open}
            onOpenChange={props.onOpenChange}
            disablePointerDismissal={false}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.Backdrop} />
                <Dialog.Viewport className={styles.Viewport}>
                    <Dialog.Popup className={classNames(styles.Popup, {
                        [styles.scrollable]: props.scrollable,
                    }, props.popupClassName)}>
                        {props.children}
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root >
    );
};

export default Modal;
