import Konva from "konva";
import _ImageCropSizeRanges from "./_ImageCropSizeInfo";

export default class _ImageCrop extends Konva.Image {
  constructor(attributes) {
    super(attributes);
    this.className = '_ImageCrop';
    this.isCropSizeTooSmall = undefined;
  }

  /**
   * Decomposes standard 2x2 matrix into transform componentes
   * @static
   * @memberOf geometry
   * @param  {Array} a transformMatrix
   * @return {Object} Components of transform
   */
  qrDecompose(a) {
    let angle = Math.atan2(a[1], a[0]),
      denom = Math.pow(a[0], 2) + Math.pow(a[1], 2),
      scaleX = Math.sqrt(denom),
      scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX;

    return {
      rotation: angle / (Math.PI / 180),
      scaleX: scaleX,
      scaleY: scaleY,
      x: a[4],
      y: a[5]
    };
  }

  getGroupCoords(object, group) {
    let mB = object.getAbsoluteTransform().getMatrix();
    let mX = group.getAbsoluteTransform().getMatrix();

    //possible to replace with mB * mX.invert()
    let M = mB[0], N = mB[1], O = mB[2], P = mB[3], R = mB[4], S = mB[5],
      A = mX[0], B = mX[1], C = mX[2], D = mX[3], E = mX[4], F = mX[5],
      AD = A * D,
      BC = B * C,
      G = (C * N - M * D) / (BC - AD),
      H = (A * N - M * B) / (AD - BC),
      I = (C * P - O * D) / (BC - AD),
      J = (A * P - O * B) / (AD - BC),
      K = (C * (S - F) + D * (E - R)) / (BC - AD),
      L = (A * (S - F) + B * (E - R)) / (AD - BC);


    let matrix = [G, H, I, J, K, L],
      options = this.qrDecompose(matrix);

    return options;
  }

  limitMoveToStage() {
    this.on('dragmove', (t) => {
      if (t.target.x() <= 0) {
        t.target.x(0);
      }
      else if (t.target.x() + this.width() >= this.getStage().width()) {
        t.target.x(this.getStage().width() - this.width());
      }

      if (t.target.y() <= 0) {
        t.target.y(0);
      }
      else if (t.target.y() + this.height() >= this.getStage().height()) {
        t.target.y(this.getStage().height() - this.height());
      }
    });
  }

  enableCropOnDblClick() {
    this.on('dblclick', function (e) {
      this.cropStart();
    });
  }

  setCropTransform(value) {
    if (value === false) {
      delete this._cropElement;
      return;
    }
    if (!this._cropElement) {
      this._cropElement = new Konva.Shape();
    }
    this._cropElement.setAttrs(value);
    this._cropElement.setAttrs({
      offsetX: 0,
      offsetY: 0
    });
  }

  getCropTransform() {
    return this._cropElement && this._cropElement.getAttrs();
  }

  cropTransform(value) {
    if (value) {
      this.setCropTransform(value);
    } else {
      return this.getCropTransform();
    }
  }

  cropEnd(context) {
    if (this.cropImage) {
      this.transformer.destroy();
      // this.cropImageTransformer.destroy();
      this.cropImage.off('dragmove', this.cropUpdateBinded);
      this.cropImage.off('transform', this.cropUpdateBinded);
      this.off('dragmove', this.cropUpdateBinded);
      this.off('transform', this.resizeAndCropUpdateBinded);
      this.cropImage.remove();
      this.getStage().offsetX(this.getAttr('x'));
      this.getStage().offsetY(this.getAttr('y'));
      this.getStage().size({
        width: this.size().width,
        height: this.size().height
      });
      delete this.cropImage;
      delete this.transformer;
      // delete this.cropImageTransformer;
      this.getLayer().draw();
    }
  }

  setClientCropSizeMessage = () => {
    clearTimeout(this.isCropSizeTooSmall);
    this.isCropSizeTooSmall = setTimeout(()=>{
      this.getAttr("cropSizeRangeValueCallback")(
        _ImageCropSizeRanges.getRange(
          this.width(),
          this.getAttr("minSize").width
        )
      );
    }, 300);
  }

  cropUpdate(context) {
    let options = this.getGroupCoords(this.cropImage, this);
    this.cropTransform(options);
    this.getLayer().draw();
    this.setClientCropSizeMessage();
  }

  resize() {
    this.setAttrs({
      scaleX: 1,
      scaleY: 1,
      width: this.width() * this.scaleX(),
      height: this.height() * this.scaleY()
    });
  }

  cropReset(context) {
    if (this.cropImage) {
      this.cropEnd();
    }
    this.setCropTransform(false);
    this.getLayer().draw();
  }

  cropStart(context) {
    //this.getStage().find('Transformer').destroy();

    if (this.cropImage) {
      return;
    }
    if (!this._cropElement) {
      this.cropTransform({
        x: 0,
        y: 0,
        width: this.width(),
        height: this.height(),
        rotation: 0,
      })
    }

    let layer = this.getLayer(),
      transform = this.getAbsoluteTransform(),
      transform2 = this._cropElement.getAbsoluteTransform(),
      transform0 = layer.getAbsoluteTransform(),
      options = this.qrDecompose(transform0.copy().invert().multiply(transform).multiply(transform2).getMatrix());

    this.cropImage = new Konva.Image({
      stroke: this.stroke(),
      strokeWidth: this.strokeWidth(),
      image: this.image(),
      opacity: 0.5,
      draggable: false
    });

    this.cropImage.isCroppingElement = false;
    this.cropImage.setAttrs(options);
    this.cropImage.setAttrs({
      width: this._cropElement.width(),
      height: this._cropElement.height(),
    });

    layer.add(this.cropImage);
    // this.cropImageTransformer = new Konva.Transformer({
    //   borderDash: [5, 5],
    //   anchorSize: 21,
    //   anchorCornerRadius: 31,
    // })
    //   .attachTo(this.cropImage);

    this.transformer = new Konva.Transformer({
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      flipEnabled: false,
      //centeredScaling: true,
      anchorSize: 25
    })
      .rotateEnabled(false)
      .attachTo(this);

    let calculatedMinSize = this.getAttr('minSize');
    calculatedMinSize.width = calculatedMinSize.width / (this.image().width / this.transformer.width());
    calculatedMinSize.height = calculatedMinSize.height / (this.image().height / this.transformer.height());

    let calculatedMaxSize = {};
    calculatedMaxSize.width = this._cropElement.width();
    calculatedMaxSize.height = this._cropElement.height();

    this.transformer.boundBoxFunc(function (oldBox, newBox) {
      // restrict size      
      // if (newBox.width < calculatedMinSize.width
      //   || newBox.height < calculatedMinSize.height) {
      //   return oldBox;
      // }
      if (newBox.width > calculatedMaxSize.width
        || newBox.height > calculatedMaxSize.height) {
        return oldBox;
      }

      // restrict position
      if (newBox.x < 0 || newBox.y < 0){
        return oldBox;
      }

      return newBox;
    });

    // layer.add(this.cropImageTransformer, this.transformer);
    layer.add(this.transformer);

    this.cropUpdateBinded = this.cropUpdate.bind(this);

    this.resizeAndCropUpdateBinded = function () {
      this.resize();
      this.cropUpdate();
    }.bind(this);

    this.resize();
    this.cropUpdate();
    this.cropImage.on('dragmove', this.cropUpdateBinded);
    this.cropImage.on('transform', this.cropUpdateBinded);
    this.on('dragmove', this.cropUpdateBinded);
    this.on('transform', this.resizeAndCropUpdateBinded);

    // this.getStage().on('click tap', (e) => {
    //   if (e.target !== this.cropImage && e.target !== this) {
    //     this.cropEnd();
    //   }
    // });
    layer.draw();
  }

  _sceneFunc(context) {
    let width = this.width(),
      height = this.height(),
      image = this.image(),
      cropWidth,
      cropHeight,
      params;

    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.clip();
    if (this.hasFill() || this.hasStroke()) {
      context.fillStrokeShape(this);
    }

    if (image) {
      if (this._cropElement) {
        context.save();
        width = this._cropElement.width();
        height = this._cropElement.height();
        let transform = this._cropElement.getAbsoluteTransform();
        let m = transform.getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }

      cropWidth = this.cropWidth();
      cropHeight = this.cropHeight();
      if (cropWidth && cropHeight) {
        params = [
          image,
          this.cropX(),
          this.cropY(),
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height
        ];
      } else {
        params = [image, 0, 0, width, height];
      }

      context.drawImage.apply(context, params);

      if (this._cropElement) {
        context.restore();
      }
    }
    context.strokeShape(this);
    context.restore();
  }
}

Konva._ImageCrop = _ImageCrop;