import React from 'react';
import Konva from 'konva';
import MyKonva from '../../classes/MyKonva';
import _ImageCrop from '../../classes/konva/_ImageCrop';
import Helper from '../../classes/Helper';
import _ImageCropSizeInfo from '../../classes/konva/_ImageCropSizeInfo';

export default class ImageCrop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: '',
      cropSizeMessage: undefined,
      cropSizeMessageWrapperColorClass: undefined,
    }

    this.initialized = false;
    this.stage = null;
    this.tempImage = '';

    this.ids = [];
    this.ids.containerId = 'modal';
    this.ids.thumbnailId = 'img-modal';

    this.projectLayerSize = null;
    this.originImage = {};
  }

  getLayerSize() {
    let width = 0,
      height = 0;

    width = this.props.layer.width();
    height = this.props.layer.height();

    let result = Helper.getChildByType(this.props.layer, MyKonva.Image);
    if (result) {
      return {
        width: Math.abs(result.width()),
        height: Math.abs(result.height())
      }
    }
  }

  setInitialized(value) {
    this.initialized = value;
  }

  isInitialized() {
    return this.initialized === true;
  }

  createCropStage() {
    var stageId = this.ids.containerId;
    var imageId = this.ids.thumbnailId;
    var image = document.getElementById(imageId);
    if (!this.originImage || Object.keys(this.originImage).length == 0) {
      if (!image || (image.clientHeight == 0 && image.clientWidth == 0)) return;

      this.originImage.image = image;
      this.originImage.size = {};
      this.originImage.size.clientWidth = image.clientWidth;
      this.originImage.size.clientHeight = image.clientHeight;
    }

    this.stage = new Konva.Stage({
      container: stageId,
      width: this.originImage.size.clientWidth,
      height: this.originImage.size.clientHeight
    });

    var layer = new Konva.Layer();
    this.stage.add(layer);

    let konvaImage = new Konva._ImageCrop({
      image: image,
      cropSizeRangeValueCallback: this.cropSizeRangeValueCallback
    });

    this.setState({ image: konvaImage });
    this.tempImage = konvaImage;

    let result = this.calculateCropLayer(this.originImage, layer);
    let newWidth = result.width;
    let newHeight = result.height;
    let cropCords = result.cropCords;

    // if image has exactly the same aspect ratio, the anchors are not visible, so reduce the crop layer
    // if (newWidth === cropCords.width && newHeight === cropCords.height) {
      let descreaseHeight = Math.round(50 / (result.cropCords.width / result.cropCords.height))

      cropCords.width -= 50;
      // calculate height decrease by ratio
      cropCords.height -= descreaseHeight;
      cropCords.x += 10;
      cropCords.y += 10;
    // }

    konvaImage.setAttrs({
      draggable: true,
      width: cropCords.width,
      height: cropCords.height,
      x: cropCords.x,
      y: cropCords.y,
      cropTransform: {
        draggable: false,
        width: newWidth,
        height: newHeight,
        x: -cropCords.x,
        y: -cropCords.y,
      },
      minSize: {
        width: 0,
        height: 0,
      }
    });
    konvaImage.src = image.src;
    konvaImage.limitMoveToStage();

    layer.add(konvaImage);

    setTimeout(() => {
      konvaImage.cropStart();
      konvaImage.moveToTop();
      this.setInitialized(true);
      if(this.props.initialCrop)
        this.saveStage();
    }, 100);
  }

  saveStage() {
    if (typeof this.tempImage.cropEnd !== 'function') return;

    this.tempImage.cropEnd();

    let calculatedPixelRatio = 1;
    const isCropLayerPortrait = (this.projectLayerSize.width / this.projectLayerSize.height) < 1;

    if (isCropLayerPortrait) {
      calculatedPixelRatio = this.originImage.image.naturalHeight / this.originImage.size.clientHeight;
    }
    else {
      calculatedPixelRatio = this.originImage.image.naturalWidth / this.originImage.size.clientWidth;
    }

    if (!Number(calculatedPixelRatio)) {
      calculatedPixelRatio = 1;
    }

    let croppedImageSrc = this.stage.toDataURL({
      quality: 1,
      pixelRatio: calculatedPixelRatio
    });
    
    if (this.props.updateImageCallback) {
      this.props.updateImageCallback(croppedImageSrc);
    }
  }

  calculateCropLayer(originImage, layer) {
    let result = {};
    let cropCords = {};
    let newWidth, newHeight;

    this.projectLayerSize = this.getLayerSize();
    const realWidth = originImage.image.naturalWidth;
    const realHeight = originImage.image.naturalHeight;
    const imageRatio = realWidth / realHeight;
    const layerRatio = this.projectLayerSize.width / this.projectLayerSize.height;
    this.resultRatio = layerRatio;

    var isImagePortrait = imageRatio < 1;
    var isCropLayerPortrait = layerRatio < 1;

    if (isImagePortrait) {
      newHeight = layer.height();
      newWidth = Math.round(newHeight * imageRatio);
      // crop layer
      cropCords.height = 0;
      cropCords.width = 0;
      cropCords.x = 0;
      cropCords.y = 0;
      if (isCropLayerPortrait) {
        cropCords.width = newWidth;
        cropCords.height = Math.round((newWidth / this.projectLayerSize.width) /*multiplier*/ * this.projectLayerSize.height);
        cropCords.x = 0;

        //calculated height could be bigger than original, so check and calculate again
        if (cropCords.height > newHeight) {
          cropCords.height = newHeight;
          cropCords.width = Math.round((newHeight / this.projectLayerSize.height) * this.projectLayerSize.width);
          cropCords.x = Math.round((newWidth - cropCords.width) / 2);
        }
        cropCords.y = Math.round((newHeight - cropCords.height) / 2);
      }
      else {
        cropCords.width = newWidth;
        cropCords.height = Math.round((newWidth / this.projectLayerSize.width) /*multiplier*/ * this.projectLayerSize.height);
        cropCords.x = 0;

        //calculated height could be bigger than original, so check and calculate again
        if (cropCords.height > newHeight) {
          cropCords.height = newHeight;
          cropCords.width = Math.round((newHeight / this.projectLayerSize.height) * this.projectLayerSize.width);
          cropCords.x = Math.round((newWidth - cropCords.width) / 2);
        }

        cropCords.y = Math.round((newHeight - cropCords.height) / 2);
      }
    }
    else {
      newWidth = layer.width();
      newHeight = Math.round(newWidth / imageRatio);
      // crop layer
      cropCords.height = 0;
      cropCords.width = 0;
      cropCords.x = 0;
      cropCords.y = 0;
      if (isCropLayerPortrait || layerRatio < imageRatio) {
        cropCords.height = newHeight;
        cropCords.width = Math.round((newHeight / this.projectLayerSize.height) /*multiplier*/ * this.projectLayerSize.width);
        cropCords.x = Math.round((newWidth - cropCords.width) / 2);
        cropCords.y = 0;
      }
      else {
        if (layerRatio >= imageRatio) {
          cropCords.width = newWidth;
          cropCords.height = Math.round((newWidth / this.projectLayerSize.width) /*multiplier*/ * this.projectLayerSize.height);
        }
        cropCords.x = 0;
        cropCords.y = Math.round((newHeight - cropCords.height) / 2);
      }
    }

    result.cropCords = cropCords;
    result.height = newHeight;
    result.width = newWidth;

    return result;
  }

  handleBtnCloseClick = () => {
    this.props.closeModal();
  }

  handleBtnCropSaveClick = (e) => {
    this.saveStage();
    this.stage.destroy();
    this.stage = null;
  }

  cropSizeRangeValueCallback = (rangeValue) => {
    let cropSizeRangeData = _ImageCropSizeInfo.getCropSizeRangeData(rangeValue);
    this.setState({
      cropSizeMessage: cropSizeRangeData.cropSizeMessage,
      cropSizeMessageWrapperColorClass: cropSizeRangeData.cropSizeMessageWrapperColorClass
    });
  }

  render() {
    const { cropSizeMessage, cropSizeMessageWrapperColorClass } = this.state;

    return (
      <div className='image-crop-container'>
        <div id={this.ids.containerId}>
          <div className='loader'>Loading...</div>
          <img 
            style={{visibility: "hidden"}} 
            id={this.ids.thumbnailId}
            src={this.props.imageObj.src}
            data-src={this.props.imageSrc}
            data-initial_img={this.props.imageSrc}
            data-seq={this.props.seqNo}
            onLoad={() => {this.createCropStage();}}
          />
        </div>
        <div className={`alert ${cropSizeMessageWrapperColorClass} mt-1`} style={{ whiteSpace: 'pre-line' }}>
            { cropSizeMessage }
        </div>
        <div className='buttonContainer'>
            <button type="button" id={this.ids.modalCloseId} className="btn btn-default"
              onClick={this.handleBtnCloseClick}
            >
              Zamknij
            </button>
            <button type="button" className="btn btn-primary"
              onClick={this.handleBtnCropSaveClick}
            >
              Zapisz
          </button>
        </div>
      </div>
    );
  }
}