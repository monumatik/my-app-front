export default class _ImageCropSizeInfo {

    static RANGES = {
        IMAGE_SIZE_OK: 1,
        IMAGE_SIZE_COULD_BE_BETTER: 1.5,
        IMAGE_SIZE_IS_TOO_SMALL: 2
    };
    
    static getRange = (width, minWidth) => {
        let range = undefined;
        Object.keys(this.RANGES).forEach((value) => {
            if(width >= minWidth){
                range = this.RANGES.IMAGE_SIZE_OK;
            }else if(width <= minWidth / this.RANGES[value]){
                range = this.RANGES[value];
            }
        });
        return range;
    }

    static getCropSizeRangeData(cropSizeRangeValue){
        let cropSizeMessageWrapperColorClass;
        let cropSizeMessage;

        Object.keys(_ImageCropSizeInfo.RANGES).forEach((key) => {
            if(cropSizeRangeValue == _ImageCropSizeInfo.RANGES[`${key}`]){
              if(cropSizeRangeValue == _ImageCropSizeInfo.RANGES.IMAGE_SIZE_OK){
                cropSizeMessageWrapperColorClass = "alert-success"
                cropSizeMessage = `Wgrałeś zdjęcie o odpowiedniej wielkości.`;
              }else if(cropSizeRangeValue == _ImageCropSizeInfo.RANGES.IMAGE_SIZE_COULD_BE_BETTER){
                cropSizeMessageWrapperColorClass = "alert-success"
                cropSizeMessage = `Twoje zdjęcie ma dostateczną jakość do druku.
                Jeżeli to możliwe wybierz zdjęcie lepszej jakości.`;
              }else if(cropSizeRangeValue == _ImageCropSizeInfo.RANGES.IMAGE_SIZE_IS_TOO_SMALL){
                cropSizeMessageWrapperColorClass = "alert-warning"
                cropSizeMessage = `Twoje zdjęcie po wydruku może być bardzo słabej jakości.
                Zalecamy wybrać zdjęcie lepszej jakości.`;
              }
            }
        });

        return {
            cropSizeMessageWrapperColorClass: cropSizeMessageWrapperColorClass,
            cropSizeMessage: cropSizeMessage
        };
    }
};