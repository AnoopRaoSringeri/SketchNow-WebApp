import { Position, Size } from "@/types/canvas";
import { ElementEnum, ICanvasObject, IObjectValue, IToSVGOptions } from "@/types/custom-canvas";

export class Rectangle implements Partial<ICanvasObject> {
    type: ElementEnum = ElementEnum.Rectangle;
    constructor({ x, y, h, w }: Partial<IObjectValue>) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.h = h ?? 0;
        this.w = w ?? 0;
    }
    x = 0;
    y = 0;
    h = 0;
    w = 0;

    draw(ctx: CanvasRenderingContext2D) {
        this.create(ctx);
        ctx.save();
    }

    create(ctx: CanvasRenderingContext2D) {
        ctx.restore();
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.stroke();
    }

    update(ctx: CanvasRenderingContext2D, objectValue: Partial<IObjectValue>) {
        const { h = 0, w = 0 } = objectValue;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.stroke();
        this.h = h;
        this.w = w;
    }

    delete() {}
    onSelect() {}
    set<T extends keyof ICanvasObject>(key: T, value: ICanvasObject[T]) {
        console.log(key, value);
    }
    move(position: Position) {
        console.log(position);
    }
    resize(size: Size) {
        console.log(size);
    }

    toSVG(options: IToSVGOptions) {
        return `<rect width="${this.w * options.width}" height="${this.h * options.height}" x="${this.x * options.width}" y="${this.y * options.height}" class="fill-transparent stroke-white" />`;
    }
}
