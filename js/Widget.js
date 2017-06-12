function Widget(options) {
    this.container = options.container;
    this.regions = options.regions;

    this.ambit = this.getAmbit();
    this.showAllRegions();

    this.dragRegion = null;
    this.shiftX = null;
    this.shiftY = null;

    this.newRegion = null;
    this.startPointX = null;
    this.startPointY = null;

    this.container.addEventListener('mousedown', this.contOnMouseDown.bind(this));
    document.addEventListener('mousemove', this.documentOnMouseMove.bind(this));
    document.addEventListener('mouseup', this.documentOnMouseUp.bind(this));
    this.container.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });
}

Widget.prototype.contOnMouseDown = function (e) {
    e.preventDefault();
    if (e.target.classList.contains('region')) {
        this.startDrag(e);
    } else if (e.target.tagName === 'IMG') {
        this.createNewRegion(e);
    }

};

Widget.prototype.documentOnMouseMove = function (e) {
    if (this.dragRegion) {
        this.moveDrag(e);
    } else if (this.newRegion) {
        this.resizeNewRegion(e);
    }

};

Widget.prototype.documentOnMouseUp = function () {
    if (this.dragRegion) {
        this.stopDrag();
    } else if (this.newRegion) {
        this.stopResize();
    }
};


Widget.prototype.createNewRegion = function (e) {
    this.newRegion = document.createElement('div');
    this.newRegion.classList.add('region');
    this.container.appendChild(this.newRegion);

    this.startPointX = e.clientX - this.ambit.left;
    this.startPointY = e.clientY - this.ambit.top;
};

Widget.prototype.resizeNewRegion = function (e) {
    var currentX = e.clientX - this.ambit.left;
    var currentY = e.clientY - this.ambit.top;
    var left, top, width, height;

    currentX = (currentX < 0) ? 0 : currentX;
    currentX = (currentX > this.container.clientWidth) ? this.container.clientWidth : currentX;
    currentY = (currentY < 0) ? 0 : currentY;
    currentY = (currentY > this.container.clientHeight) ? this.container.clientHeight : currentY;

    if (this.startPointX > currentX) {
        left = currentX;
        width = this.startPointX - currentX;
    } else if (this.startPointX < currentX) {
        left = this.startPointX;
        width = currentX - this.startPointX;
    }

    if (this.startPointY > currentY) {
        top = currentY;
        height = this.startPointY - currentY;
    } else if (this.startPointY < currentY) {
        top = this.startPointY;
        height = currentY - this.startPointY;
    }

    this.newRegion.style.left = left + 'px';
    this.newRegion.style.top = top + 'px';
    this.newRegion.style.width = width + 'px';
    this.newRegion.style.height = height + 'px';
};

Widget.prototype.stopResize = function () {
    var style = getComputedStyle(this.newRegion);
    var width = parseInt(style.width);
    var height = parseInt(style.height);

    if (width < 3 || height < 3) {
        this.container.removeChild(this.newRegion);
    } else {
        this.newRegion.innerHTML = this.randID();
        this.regions.push(this.newRegion);
    }

    this.newRegion = null;
    this.startPointX = null;
    this.startPointY = null;
};


Widget.prototype.startDrag = function (e) {
    this.dragRegion = e.target;
    
    var coords = this.dragRegion.getBoundingClientRect();
    this.shiftX = e.clientX - coords.left;
    this.shiftY = e.clientY - coords.top;
};

Widget.prototype.moveDrag = function (e) {
    var left = e.clientX - this.shiftX - this.ambit.left;
    var top = e.clientY - this.shiftY - this.ambit.top;

    var rightEdge = this.container.clientWidth - this.dragRegion.offsetWidth;
    var bottomEdge = this.container.clientHeight - this.dragRegion.offsetHeight;

    left = (left < 0) ? 0 : left;
    left = (left > rightEdge) ? rightEdge : left;
    top = (top < 0) ? 0 : top;
    top = (top > bottomEdge) ? bottomEdge : top;

    this.dragRegion.style.left = left + 'px';
    this.dragRegion.style.top = top + 'px';
};

Widget.prototype.stopDrag = function () {
    this.dragRegion = null;
    this.shiftX = null;
    this.shiftY = null;
};


Widget.prototype.showRegion = function (region) {
    var div = document.createElement('div');
    div.classList.add('region');

    region.left = (region.left < 0) ? 0 : region.left;
    region.top = (region.top < 0) ? 0 : region.top;
    region.width = (region.width < 5) ? 5 : region.width;
    region.height = (region.height < 5) ? 5 : region.height;

    div.style.left = region.left + 'px';
    div.style.top = region.top + 'px';
    div.style.width = region.width + 'px';
    div.style.height = region.height + 'px';
    div.innerHTML = region.id;

    this.container.appendChild(div);
    
    var result = this.checkProportions(div);
    if (Object.keys(result).length === 0) {
        return;
    } else {
        if (result.ban) {
            this.container.removeChild(div);
            return;
        } else if (result.width) {
            div.style.width = result.width + 'px';
        } else if (result.height) {
            div.style.height = result.height + 'px';
        }
    }
};

Widget.prototype.showAllRegions = function () {
    this.regions.forEach(function (region) {
        this.showRegion(region);
    }.bind(this));
};


Widget.prototype.getAmbit = function () {
    var style = getComputedStyle(this.container);
    var borders = {
        top: parseInt(style.borderTopWidth),
        bottom: parseInt(style.borderBottomWidth),
        left: parseInt(style.borderLeftWidth),
        right: parseInt(style.borderRightWidth)
    };
    var coords = this.container.getBoundingClientRect();

    return {
        left: coords.left + borders.left,
        right: coords.right - borders.right,
        top: coords.top + borders.top,
        bottom: coords.bottom - borders.bottom
    }
};

Widget.prototype.checkProportions = function (region) {
    var coords = region.getBoundingClientRect();
    var result = {};
    var difference;
    
    if (coords.right > this.ambit.right) {
        difference = this.ambit.right - coords.left;
        if (difference < 5) {
            result.ban = true;
        } else {
            result.width = difference;
        }
    }

    if (coords.bottom > this.ambit.bottom) {
        difference = this.ambit.bottom - coords.top;
        if (difference < 5) {
            result.ban = true;
        } else {
            result.height = difference;
        }
    }

    return result;
};

Widget.prototype.randID = function () {
    return Math.random().toString(36).slice(8).slice(0, 4);
};

