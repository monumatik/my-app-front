export default class Helper {
    static loadImage(imageSrc, onload, onerror) {
        let htmlImageObject = new Image();
        htmlImageObject.onload = onload;
        htmlImageObject.onerror = onerror;
        htmlImageObject.crossOrigin = 'Anonymous';

        let src = `${imageSrc}`;
        if (imageSrc !== undefined && !imageSrc.startsWith('blob') && !imageSrc.startsWith('data')){
            src = src;
        }
        htmlImageObject.src = src;
        return htmlImageObject;
    }

    static hexToRgb(hex) {
        if (hex == "#000" || hex == "#00000" || !hex)
            hex = "#000000";

        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let ret = {}
        if (result) {
            ret.r = parseInt(result[1], 16);
            ret.g = parseInt(result[2], 16);
            ret.b = parseInt(result[3], 16);
        } else {
            ret.r = 0;
            ret.g = 0;
            ret.b = 0;
        }
        return ret;
    }

    static getChildByType(node, nodeType) {
        let result = null;
        if (node.hasChildren()) {
            node.getChildren().forEach(child => {
                let tmp = Helper.getChildByType(child, nodeType);
                if (tmp !== undefined){
                    result = tmp;
                    return result;                
                }
            })
        }
        else {
            if (node instanceof nodeType) {
                return node;
            }
        }
        if (result != null) {
            return result;
        }
    }

    static downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    static getClientInputHeight(text){
        let lines = text.split(/\r?\n/).length;
        if(lines == 0)
            lines = 3;

        return parseInt(lines) * 22 + 11;
    }

    static getLinesCount(text){
        let lines = text.split(/\r?\n/).length;
        if(lines == 0)
            lines = 3;

        return lines;
    }

    static extend(a, b){
        for(var key in b)
            if(b.hasOwnProperty(key))
                a[key] = b[key];
        return a;
    }

    static isEmployee(){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get("employee");
        if(c && c !== "")
            return true;
        else
            return false;
    }
    
    static isFulledit(){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get("fulledit");
        if(c && c !== "")
            return true;
        else
            return false;
    }
    
    static isTestmode(){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get("test_mode");
        if(c && c !== "")
            return true;
        else
            return false;
    }

}