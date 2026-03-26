import { useEffect, useState } from 'react';
import spinners, { BrailleSpinnerName } from 'unicode-animations';
import classNames from 'classnames';
import styles from './StatusBadge.module.scss';
import { ExpenseReport } from '@/app/api/expense-reports/contract';
import CompletedIcon from '@/assets/icons/status_completed.svg';
import FailedIcon from '@/assets/icons/status_failed.svg';



const getStatusLabel = (status: ExpenseReport["status"]) => {
    if (status === "processing") {
        return "Processing"
    }

    if (status === "completed") {
        return "Completed"
    }

    if (status === "failed") {
        return "Failed"
    }

    return status
}


type Props = {
    status: ExpenseReport["status"]
}

const StatusBadge = (props: Props) => {

    const className = classNames(styles.statusBadge, {
        [styles.processing]: props.status === "processing",
        [styles.completed]: props.status === "completed",
        [styles.failed]: props.status === "failed",
    })

    return (
        <span className={className}>
            {props.status === "processing" ? <Spinner name="braille" /> : null}
            {props.status === "completed" ? <CompletedIcon width={12} height={12} /> : null}
            {props.status === "failed" ? <FailedIcon width={12} height={12} /> : null}
            {getStatusLabel(props.status)}
        </span>
    )
}

export default StatusBadge




function Spinner({ name = 'braille' }: { name: BrailleSpinnerName }) {
    const [frame, setFrame] = useState(0);
    const s = spinners[name];

    useEffect(() => {
        const timer = setInterval(
            () => setFrame(f => (f + 1) % s.frames.length),
            s.interval
        );
        return () => clearInterval(timer);
    }, [name]);

    return <span className={styles.spinner}>{s.frames[frame]} </span>;
}

