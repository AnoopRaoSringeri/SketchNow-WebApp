import { observer } from "mobx-react";
import { useEffect, useState } from "react";

import { useStore } from "@/api-stores/store-provider";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CanvasBoard } from "@/lib/canvas/canvas-board";
import { CanvasHelper } from "@/lib/canvas-helpers";
import { ICanvasTransform } from "@/types/custom-canvas";

export const TableRenderer = observer(function TableRenderer({
    transform,
    id,
    board
}: {
    transform: ICanvasTransform;
    id: string;
    board: CanvasBoard;
}) {
    const [isLocked, setIsLocked] = useState(true);
    const table = board.getTable(id);
    const { x = 0, y = 0, h = 0, w = 0 } = table.getValues();
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<string[][]>([]);
    const { uploadStore } = useStore();
    const { ax, ay } = CanvasHelper.getAbsolutePosition({ x, y }, transform);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await uploadStore.GetData(id);
        setData(res.data);
        setLoading(false);
    };

    const style: React.CSSProperties = {
        top: ay,
        left: ax,
        height: h * transform.scaleX,
        width: w * transform.scaleX,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 10
    };

    const upload = async (file: File, id: string) => {
        setLoading(true);
        const res = await uploadStore.UploadFile(file, id);
        setData(res.data);
        setLoading(false);
    };

    const headers: string[] = data.length > 0 ? data[0] : [];

    return (
        <div style={style}>
            <Button
                onClick={() => setIsLocked((pre) => !pre)}
                className="absolute bottom-5 right-5 z-[60]"
                size="icon"
                variant="ghost"
            >
                {isLocked ? <Icon name="LockOpen" /> : <Icon name="Lock" />}
            </Button>
            <Loader loading={loading} />
            {data.length > 0 ? (
                <ScrollArea
                    className="size-full border border-gray-50/10"
                    style={{
                        zIndex: isLocked ? 0 : 50,
                        zoom: transform.scaleX
                    }}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {headers.map((h) => (
                                    <TableHead key={h}>{h}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="size-full overflow-auto">
                            {data.slice(1).map((row, i) => (
                                <TableRow key={i}>
                                    {row.map((k, i) => (
                                        <TableCell key={k + i} className="text-nowrap">
                                            {row[i]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : loading ? null : (
                <>
                    <label htmlFor={id} className="absolute z-50 flex items-center justify-center opacity-30">
                        Upload file
                    </label>
                    <input
                        name={id}
                        id={id}
                        className="absolute z-50 size-full border-2 border-dashed border-gray-50/20 text-transparent  file:hidden"
                        type="file"
                        title=" "
                        value={""}
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                upload(e.target.files[0], id);
                            }
                        }}
                    />
                </>
            )}
        </div>
    );
});
