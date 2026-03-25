import { ReactNode } from "react";
import styles from "./Table.module.scss";




const getCellContent = <T,>(column: TableColumn<T>, row: T) => {
    const value = column.key ? row[column.key] as string | number | undefined : undefined;

    if (column.render) {
        return column.render(value, row);
    }

    return value ? value : "-";
};

export type TableColumn<T> = {
    key?: keyof T & string;
    header?: ReactNode;
    render?: (value: string | number | undefined, row: T) => ReactNode;
};

type TableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
};

const Table = <T extends { id: string }>(props: TableProps<T>) => {

    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead className={styles.head}>
                    <tr>
                        {props.columns.map((column, columnIndex) => (
                            <th key={`${column.key || "column"}-${columnIndex}`} scope="col" className={styles.headerCell}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {props.data.length > 0 ? (
                        props.data.map((row, rowIndex) => (
                            <tr key={`${rowIndex}-${row.id}`} className={styles.bodyRow}>
                                {props.columns.map((cell, cellIndex) => (
                                    <td key={`${cell.key || "cell"}-${rowIndex}-${cellIndex}`} className={styles.cell}>
                                        {getCellContent(cell, row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className={styles.emptyCell} colSpan={props.columns.length}>
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
