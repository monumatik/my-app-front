import Konva from "konva";
import _ImageCrop from "./konva/_ImageCrop";


const HTMLImage = Image;

namespace MyKonva {

    const Util_1 = require("konva/lib/Util");
    const Global_1 = require("konva/lib/Global");

    export const ImageCrop = _ImageCrop;

    export class Image extends Konva.Image{
        constructor(args: any){
            super(args);
            this.load();
            this.draggable(false);
        }

        load = (): void => {
            let imageObj = new HTMLImage();
            imageObj.src = this.getAttr('src');
            this.image(imageObj);
        }
    }

    export abstract class Node extends Konva.Node{
        static _createNode(obj: any, container: any) {
            var className = Konva.Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
            if (container) {
                obj.attrs.container = container;
            }
            if (!Global_1.Konva[className]) {
                Util_1.Util.warn('Can not find a node with class name "' +
                    className +
                    '". Fallback to "Shape".');
                className = 'Shape';
            }

            var a = undefined;
            
            if(className !== "Image"){
                a = Global_1.Konva[className];
            }else{
                a = Image;
            }

            no = new a(obj.attrs);
            if (children) {
                len = children.length;
                for (n = 0; n < len; n++) {
                    no.add(MyKonva.Node._createNode(children[n], undefined));
                }
            }
            return no;
        }
    }
}

export default MyKonva;