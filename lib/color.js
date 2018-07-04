(function () {
    function bringIntoRangeFactory(min, max, float) {
        return Function('v', `
        if (v < ${min}) {
            v = ${min};
        } else if (v > ${max}) {
            v = ${max};
        } else {
            return ${float ? 'parseFloat' : 'parseInt'}(v || 0);
        }`);
    }

    const f0t255 = bringIntoRangeFactory(0, 255, true);
    const f0t1 = bringIntoRangeFactory(0, 1, true);


    /**
     * Color is an class meant to represent a four component Color, constisting of red, green, blue and opacity
     * @class
     * @param {Number} r - red (0 - 255)
     * @param {Number} g - green (0 - 255)
     * @param {Number} b - blue (0 - 255)
     * @param {Number} a - alpha (0 - 1)
     */
    function Color(r, g, b, a) {
        let _r, _g, _b, _a = 1;

        let redo = {
            hex: true,
            rgb: true,
            rgba: true
        }

        let hex, rgb, rgba;

        Object.defineProperties(this, {
            /**
             * The red component, a number between 0 - 255
             * @member {number} Color#r - the red component
             */
            r: {
                get: function () {
                    return _r
                },
                set: function (v) {
                    v = f0t255(v);

                    if (v != _r)
                        redo.hex = redo.rgb = redo.rgba = true;

                    _r = v;
                }
            },
            /**
             * The green component, a number between 0 - 255
             * @member {number} Color#g - the green component
             */
            g: {
                get: function () {
                    return _g
                },
                set: function (v) {
                    v = f0t255(v);

                    if (v != _g)
                        redo.hex = redo.rgb = redo.rgba = true;

                    _g = v;
                }
            },
            /**
             * The blue component, a number between 0 - 255
             * @member {number} Color#b - the blue component
             */
            b: {
                get: function () {
                    return _b
                },
                set: function (v) {
                    v = f0t255(v);

                    if (v != _b)
                        redo.hex = redo.rgb = redo.rgba = true;

                    _b = v;
                }
            },
            /**
             * The opacity component, a number between 0 - 1
             * @member {number} Color#o - the opacity component
             */
            o: {
                get: function () {
                    return _a;
                },
                set: function (v) {
                    v = f0t1(v);

                    if (v != _a)
                        redo.rgba = true;

                    _a = v;
                }
            },

            /**
             * this functions constructs a rgb string of this color 'rgb(r,g,b)'
             * @method Color#rgbString
             * @returns {string} - the rgb string
             */
            rgbString: {
                get: function () {
                    if (redo.rgb)
                        rgb = 'rgb(' + _r + ',' + _g + ',' + _b + ')';

                    return rgb;
                }
            },

            /**
             * this functions constructs a rgba string of this color 'rgb(r,g,b,o)'
             * @method Color#rgbaString
             * @returns {string} - the rgba string
             */
            rgbaString: {
                get: function () {
                    if (redo.rgba)
                        rgba = 'rgb(' + _r + ',' + _g + ',' + _b + ',' + _a + ')';

                    return rgba;
                }
            },
            /**
             * this functions constructs a hex string of this color '#RRGGBB'
             * @method Color#hexString
             * @returns {string} - the hex string
             */
            hexString: {
                get: function () {
                    if (redo.hex) {
                        let r = Math.round(this.r),
                            g = Math.round(this.g),
                            b = Math.round(this.b);

                        hex = '#' +
                            (r < 16 ? '0' : '') + r.toString(16) +
                            (g < 16 ? '0' : '') + g.toString(16) +
                            (b < 16 ? '0' : '') + b.toString(16);
                    }

                    return hex;
                }
            }
        });


        this.r = r;
        this.g = g;
        this.b = b;
        this.o = a;
    }

    /**
     * rounds the r g b component to the nearest integer value
     */
    Color.prototype.round = function round() {
        this.r = Math.round(this.r);
        this.g = Math.round(this.g);
        this.b = Math.round(this.b);
    }

    /**
     * constructs a console readable string of this color like: 'Color{r: r, g: g, b: b, o: o}'
     * @returns {string} 
     */
    Color.prototype.toString = function toString() {
        return 'Color{r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', o: ' + this.o + '}';
    }

    /**
     * creates a copy of this color
     * @returns {Color}
     */
    Color.prototype.copy = function copy() {
        return new Color(this.r, this.g, this.b, this.o);
    }


    /* statics */


    {
        const regex = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$|^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;

        /**
         * parses 'fF2a01', '#123222', '12a', '#FfF' ...
         * @param {string} str the string
         * @return {Color?} the parsed color
         */
        Color.parseHEX = function parseHEX(str) {
            let match = str.match(regex)

            if (match[1] && match[2] && match[3])
                return new Color(parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 1)

            if (match[4] && match[5] && match[6])
                return new Color(parseInt(match[4], 16), parseInt(match[5], 16), parseInt(match[6], 16), 1)
        }
    }

    {
        const regex = /(\d+)\D*,\D*(\d+)\D*,\D*(\d+)(?:\D*,\D*(\d?(?:\.\d+)?))?/

        /**
         * parses 'rgb(1,2,3)', 'rgba(2,31,23,0.3)' or 'rgba(2,31,23,.3) with or without rgba() / rgb()
         * @param {string} str the string
         * @return {Color?} the parsed color
         */
        Color.parseRGB = function parseRGB(str) {
            let match = str.match(regex)

            if (match[1] && match[2] && match[3])
                return new Color(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), match[3] ? parseFloat(match[3]) : 1)
        }
    }

    /**
     * Parses an color string {@link Color#parseHEX} and {@link Color#parseRGB} for more detail
     * @param {string} str the string to parse
     * @returns {Color?}
     */
    Color.parse = function parse(str) {
        if (str instanceof Color)
            return str.copy()
        else
            return Color.parseHEX(str) || Color.parseRGB(str)
    }


    /**
     * shades a given color with a percent value [-1,1] where 1 means white and -1 black
     * @param {Color} color
     * @param {number} perc -1 to 1
     * @return {Color} the new color
     */
    Color.shade = function shade(color, perc) {
        if (!(color instanceof Color) || perc > 1 || perc < -1)
            return;

        if (perc == 0)
            return color;

        if (perc > 0) {
            return new Color(
                color.r + (255 - color.r) * perc,
                color.g + (255 - color.g) * perc,
                color.b + (255 - color.b) * perc
            );
        } else {
            perc = 1 + perc;
            return new Color(
                color.r * perc,
                color.g * perc,
                color.b * perc
            );
        }
    }

    /**
     * mixes two colors, 1 means only colorA and 0 means only colorB
     * @param {Color} colorA
     * @param {Color} colorB
     * @param {Number} perc
     * @return {Color} the new color
     */
    Color.mix = function mix(colorA, colorB, perc) {
        if (!(colorA instanceof Color) || !(colorB instanceof Color) || perc > 1 || perc < 0)
            return;

        var _perc = 1 - perc
        return new Color(
            colorA.r * perc + colorB.r * _perc,
            colorA.g * perc + colorB.g * _perc,
            colorA.b * perc + colorB.b * _perc
        );
    }

    /**
     * this function produces a mix paletton with the {@link Color#mix} methode, starting with 100% colorA and ending with 100% colorB
     * @param {Color} colorA 
     * @param {Color} colorB 
     * @param {number} size 
     */
    Color.produceMixPalletton = function produceMixPalletton(colorA, colorB, size) {
        if (!(colorA instanceof Color) || !(colorB instanceof Color) || size < 0)
            return;

        if (size == 0)
            return [];

        var ret = [];
        size--;
        var c;
        for (var mix = size; mix >= 0; mix--) {
            c = mix(colorA, colorB, mix / size)
            c.round();
            ret[ret.length] = c;
        }
        return ret;
    }

    /**
     * checks wether two colors are identical
     * @param {Color} colorA 
     * @param {Color} colorB 
     */
    Color.equal = function equal(colorA, colorB) {
        return colorA.a == colorB.a && colorA.b == colorB.b && colorA.c == colorB.c && colorA.o == colorB.o;
    }

    module.exports = Color;
})();