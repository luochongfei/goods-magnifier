;(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.goodsMagnifier = factory();
    }
}(this, function () {

    // 获取元素绝对位置
    function getPosition(obj) {
        var l = 0;
        var t = 0;
        while (obj) {
            l += obj.offsetLeft-obj.scrollLeft+obj.clientLeft;
            t += obj.offsetTop-obj.scrollTop+obj.clientTop;
            obj = obj.offsetParent;
        }
        return { left: l, top: t };
    }

    // 覆盖填充对象
    function extend(oldObj,newObj){
        for(var i in newObj){
            oldObj[i]=newObj[i];
        }
        return oldObj;
    }

    // 商品放大镜
    var GoodsMagnifier=function(img,options){
        this.img = img;
        var setting = {
            // 遮罩层 层级
            maskZIndex: 1000,

            // 遮罩层背景
            maskBackground: '#aae4ff',

            // 遮罩层透明度 0~1
            maskOpacity: 0.5
        };
        this.opt = extend(setting, options);
        console.log('fasfasdf',this.opt)
        this.bindEvent();
    };

    // 绑定事件
    GoodsMagnifier.prototype.bindEvent = function () {
        var _this=this;

        this.img.onmouseover = overFn;

        // 鼠标经过
        function overFn() {
            _this.imgLeft = getPosition(this).left;//元素左边距
            _this.imgTop = getPosition(this).top;//元素顶边距
            _this.imgW = this.offsetWidth;//图片宽度
            _this.imgH = this.offsetHeight;//图片高度

            _this.showMask();
            _this.showPreview();

            document.onmousemove = moveFn;
        }

        // 鼠标移动
        function moveFn(event){
            _this.cX = event.clientX;
            _this.cY = event.clientY;

            // 鼠标离开主图区
            if (_this.isLeave()) {
                document.onmousemove = null;
                _this.mask.style.display = _this.preview.style.display='none';
                return;
            }

            // 原图与主图的比例
            _this.propX = (_this.originImg.offsetWidth / _this.imgW);
            _this.propY = (_this.originImg.offsetHeight / _this.imgH);

            // 设定遮罩与预览
            _this.setMask();
            _this.setPreview();
        }
    };

    // 是否离开主图区
    GoodsMagnifier.prototype.isLeave = function(){
        return (
            this.cX < this.imgLeft ||
            this.cX > this.imgLeft + this.imgW ||
            this.cY < this.imgTop ||
            this.cY > this.imgTop + this.imgH
        );
    };
    
    // 显示遮罩层
    GoodsMagnifier.prototype.showMask=function(){
        var maskId = '_goods_magnifier_mask',
            oMask = document.getElementById(maskId);
        if (!oMask) {
            oMask = document.createElement('div');
            oMask.style.position = 'absolute';
            oMask.style.zIndex = this.opt.maskZIndex;
            oMask.style.background = this.opt.maskBackground;
            oMask.style.opacity = this.opt.maskOpacity ;
            oMask.style.filter = 'alpha(opacity='+(this.opt.maskOpacity*100)+')';
            oMask.setAttribute('id', maskId);
            document.body.appendChild(oMask);
        } else {
            oMask.style.display = 'block';
        }
        this.mask=oMask;
    };

    // 显示预览层
    GoodsMagnifier.prototype.showPreview = function () {
        var originImgId = '_goods_magnifier_origin';
        var oPreview = document.getElementById('preview');

        var originImg = document.getElementById(originImgId);
        if (!originImg) {
            originImg = new Image();
            originImg.setAttribute('id', originImgId);
            oPreview.appendChild(originImg);
        }

        // 设置原图
        originImg.src = this.img.getAttribute("rel");

        // 显示预览框
        oPreview.style.display = 'block';
        this.originImg=originImg;
        this.preview = oPreview;
    };

    // 设置遮罩
    GoodsMagnifier.prototype.setMask = function () {

        this.mask.style.width = this.preview.offsetWidth / this.propX+'px';
        this.mask.style.height = this.preview.offsetWidth / this.propY+'px';
        this.mask.style.visibility = 'visible';

        var mX = this.cX - this.mask.offsetWidth / 2,
            mY = this.cY - this.mask.offsetHeight / 2,
            maskW = this.mask.offsetWidth,
            maskH = this.mask.offsetHeight;

        // 横方向区域限制
        if (this.cX - maskW / 2 < this.imgLeft) {
            mX = this.imgLeft;
        } else {
            if (this.cX + maskW / 2 > this.imgW + this.imgLeft) {
                mX = (this.imgW + this.imgLeft - maskW);
            }
        }

        // 纵方向区域限制
        if (this.cY - maskH / 2 < this.imgTop) {
            mY = this.imgTop;
        } else {
            if (this.cY + maskH / 2 > this.imgH + this.imgTop) {
                mY = (this.imgH + this.imgTop - maskH);
            }
        }

        // 设置遮罩层位置
        this.mask.style.left = mX +'px';
        this.mask.style.top = mY +'px';

    };

    // 设置遮罩
    GoodsMagnifier.prototype.setPreview = function () {
        // 设置预览框内图片位置
        this.preview.scrollLeft = (this.cX-this.mask.offsetWidth/2-this.imgLeft) * this.propX;
        this.preview.scrollTop = (this.cY-this.mask.offsetHeight/2-this.imgTop) * this.propY;
    };

    return function (img, options){
        new GoodsMagnifier(img, options);
    };
}));