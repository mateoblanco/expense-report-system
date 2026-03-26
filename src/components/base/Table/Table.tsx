import { CSSProperties, ReactNode } from "react";
import styles from "./Table.module.scss";

type TableColumnWidth = CSSProperties["width"] | number;

const getCellContent = <T,>(column: TableColumn<T>, row: T) => {
    const value = column.key ? row[column.key] as string | number | undefined : undefined;

    if (column.render) {
        return column.render(value, row);
    }

    return value ? value : "-";
};

const getColumnStyle = (width?: TableColumnWidth): CSSProperties | undefined => {
    if (width === undefined) {
        return undefined;
    }

    const resolvedWidth = typeof width === "number" ? `${width}%` : width;

    return {
        width: resolvedWidth,
        minWidth: resolvedWidth,
    };
};

export type TableColumn<T> = {
    key?: keyof T & string;
    header?: ReactNode;
    render?: (value: string | number | undefined, row: T) => ReactNode;
    width?: TableColumnWidth;
};

type TableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    isLoading: boolean;
    minWidth?: CSSProperties["minWidth"];
};

const Table = <T extends { id: string }>(props: TableProps<T>) => {
    const tableStyle = props.minWidth ? { minWidth: props.minWidth } : undefined;

    return (
        <div className={styles.wrapper}>
            <table className={styles.table} style={tableStyle}>
                <colgroup>
                    {props.columns.map((column, columnIndex) => {
                        const columnStyle = getColumnStyle(column.width);

                        return (
                            <col
                                key={`${column.key || "column"}-${columnIndex}`}
                                style={columnStyle}
                            />
                        );
                    })}
                </colgroup>

                <thead className={styles.head}>
                    <tr>
                        {props.columns.map((column, columnIndex) => (
                            <th
                                key={`${column.key || "column"}-${columnIndex}`}
                                scope="col"
                                className={styles.headerCell}
                                style={getColumnStyle(column.width)}
                            >
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
                                    <td
                                        key={`${cell.key || "cell"}-${rowIndex}-${cellIndex}`}
                                        className={styles.cell}
                                        style={getColumnStyle(cell.width)}
                                    >
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
