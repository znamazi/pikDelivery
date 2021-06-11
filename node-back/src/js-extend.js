if (!Array.prototype.last) {
    Array.prototype.last = function (n) {
        if (n === undefined)
            return this[this.length - 1];
        else {
            let start = this.length - n;
            return this.slice(start, start + n);
        }
    };
}

if (!Promise.prototype.chain) {
    Promise.prototype.chain = function (arr) {
        let i = -1;
        const onItemFulFilled = () => {
            i++;
            if (i < arr.length)
                return arr[i];
        }
        Promise.resolve().then(onItemFulFilled)
    }
}

if(!global.parseBoolean){
    global.parseBoolean = function (val) {
        return val === 'true' || val === true || val == 1
    }
}
