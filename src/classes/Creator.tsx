
import Konva from 'konva';
import MyKonva from './MyKonva';

declare global {
    interface Window {asd: any;}
}

type SceneSize = {
    width: number,
    height: number
}

class Creator {

    private sceneSize: SceneSize = {
        width: 500,
        height: 500
    };

    private stage: Konva.Stage;

    constructor(data: JSON){
        this.stage = MyKonva.Node.create(data, 'container');
        this.fitStageIntoParentContainer();
        window.asd = this.stage;
        window.addEventListener('resize', this.fitStageIntoParentContainer);
    }

    fitStageIntoParentContainer: any = (): void => {
        let containerWidth = this.stage.container().offsetWidth - 4;
        let scale = containerWidth / this.sceneSize.width;
        this.stage.width(this.sceneSize.width * scale);
        this.stage.height(this.sceneSize.height * scale);
        this.stage.scale({
            x: scale, y:scale
        });
    }

    public getElementsList(): Array<object>{
        let childrenSortByZIndex: Array<any> = [];
        let layer: Konva.Layer = this.stage.findOne('Layer');
        if(layer){
            let children: Array<any> = layer.getChildren((node: any) => {
                return node.getClassName() === 'Group';
            });
            childrenSortByZIndex = new Array(children.length).fill(0);
            if(children){
                children.forEach((group) => {
                    let children = group.getChildren((node: any) => {
                        return node.getClassName() !== 'Transformer';
                    })
                    childrenSortByZIndex[group.zIndex()] = {
                        type: children[0].getClassName(),
                        id: group.id(),
                        src: children[0].image ? children[0].image().src : ''
                    };
                });
            }
        }
        return childrenSortByZIndex.reverse();
    }

    public getLayer(): Konva.Layer{
        return this.stage.findOne('Layer');
    }

    public async updateElementImage(imageSrc: string, elementId: string){
        let group: any = this.stage.findOne(`#${elementId}`);
        let image = group.findOne('Image');
        let newImageScale = await this.getNewImageScale(imageSrc, image);
        image.setAttr('src', imageSrc);
        image.scaleX(newImageScale);
        image.scaleY(newImageScale);
        image.load();
    }

    private getNewImageScale(newImageSrc: string, oldImage: Konva.Image){
        ;
        return new Promise((resolve, reject) => {
            let newImageObj: HTMLImageElement = new Image();
            newImageObj.onload = (event) => {
                resolve(oldImage.width() * oldImage.scaleX() / newImageObj.width);
            }
            newImageObj.src = newImageSrc;
        });
    }
}

export default Creator;