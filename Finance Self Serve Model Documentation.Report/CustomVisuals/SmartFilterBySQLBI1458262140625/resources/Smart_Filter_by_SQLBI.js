/*
 *  Smart Filter By SQLBI
 *  v1.0.4
 *
 *  Change log:
 *   - Display title by default
 *   - Fixed an issue with invalid chars in the records
 *
 *  SQLBI Module
 *  v1.3.0
 *
 *  Contact mailto:support@okviz.com
 *  Support URL http://okviz.com/smart-filter/
 *
 *  Copyright (c) SQLBI.  All rights reserved. OkViz is a trademark of SQLBI Corp.
 *
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 *  Based on Tokenize v2.6 by David Zeller
 *
 *  Copyright (c) 2005-2012, David Zeller
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without modification,
 *  are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 *     * Neither the name of David Zeller nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 *  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/////<reference path="../_references.ts" />
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var SmartFilterBySQLBI1458262140625;
        (function (SmartFilterBySQLBI1458262140625) {
            var SelectionManager = visuals.utility.SelectionManager;
            /* SQLBI Helper */
            var sqlbi;
            (function (sqlbi) {
                var thisVisual = (function () {
                    function thisVisual() {
                    }
                    /* End Configuration */
                    thisVisual.capabilities = function () {
                        var vc = thisVisual._dataCapabilities;
                        for (var i = 0; i < thisVisual._propsCapabilities.length; i++) {
                            var group = thisVisual._propsCapabilities[i];
                            var props = {};
                            for (var ii = 0; ii < group.caps.length; ii++) {
                                var cap = group.caps[ii];
                                if (cap.type === 9 /* filter */) {
                                    props[thisVisual.normalize(cap.name)] = {
                                        type: { filter: {} },
                                        rule: cap.custom
                                    };
                                }
                                else {
                                    var t;
                                    if (cap.type === 0 /* text */)
                                        t = { text: true };
                                    else if (cap.type === 2 /* boolean */)
                                        t = { bool: true };
                                    else if (cap.type === 1 /* number */)
                                        t = { numeric: true };
                                    else if (cap.type === 3 /* color */)
                                        t = { fill: { solid: { color: true } } };
                                    else if (cap.type === 5 /* unit */)
                                        t = { formatting: { labelDisplayUnits: true } };
                                    else if (cap.type === 6 /* fontSize */)
                                        t = { formatting: { fontSize: true } };
                                    else if (cap.type === 7 /* labelStyle */)
                                        t = { enumeration: visuals.labelStyle.type };
                                    else if (cap.type === 8 /* legendPosition */)
                                        t = { enumeration: visuals.legendPosition.type };
                                    else
                                        t = cap.custom;
                                    props[thisVisual.normalize(cap.name)] = {
                                        displayName: cap.displayName || cap.name,
                                        placeHolderText: (cap.autoDefault ? 'Auto' : ''),
                                        type: t
                                    };
                                }
                            }
                            vc.objects[thisVisual.normalize(group.name)] = {
                                displayName: group.displayName || group.name,
                                properties: props
                            };
                        }
                        return vc;
                    };
                    thisVisual.enumerateSettings = function (options, settings) {
                        for (var i = 0; i < thisVisual._propsCapabilities.length; i++) {
                            var group = thisVisual._propsCapabilities[i];
                            var groupName = thisVisual.normalize(group.name);
                            if (options.objectName === groupName) {
                                var props = {};
                                for (var ii = 0; ii < group.caps.length; ii++) {
                                    var cap = group.caps[ii];
                                    if (!cap.hidden) {
                                        var capName = thisVisual.normalize(cap.name);
                                        props[capName] = settings[groupName][capName];
                                    }
                                }
                                return [{
                                    objectName: groupName,
                                    selector: null,
                                    properties: props,
                                }];
                            }
                        }
                    };
                    thisVisual.normalize = function (name) {
                        return name.replace(/ /g, '');
                        /*
                        var returnName: string = '';
                        var arr = name.split(' ');
                        for (var i = 0; i < arr.length; i++) {
                            if (i == 0)
                                returnName = arr[0].toLowerCase();
                            else
                                returnName += arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
                        }
                        return returnName;
                        */
                    };
                    thisVisual.defaultSettings = function () {
                        var settings = {};
                        for (var i = 0; i < thisVisual._propsCapabilities.length; i++) {
                            var group = thisVisual._propsCapabilities[i];
                            var groupName = thisVisual.normalize(group.name);
                            settings[groupName] = {};
                            for (var ii = 0; ii < group.caps.length; ii++) {
                                var cap = group.caps[ii];
                                var capName = thisVisual.normalize(cap.name);
                                settings[groupName][capName] = cap.defaultValue || null;
                            }
                        }
                        return settings;
                    };
                    thisVisual.getSettings = function (objects, settings) {
                        for (var i = 0; i < thisVisual._propsCapabilities.length; i++) {
                            var group = thisVisual._propsCapabilities[i];
                            var groupName = thisVisual.normalize(group.name);
                            for (var ii = 0; ii < group.caps.length; ii++) {
                                var cap = group.caps[ii];
                                var capName = thisVisual.normalize(cap.name);
                                var obj = { objectName: groupName, propertyName: capName };
                                if (cap.type == 3 /* color */)
                                    settings[groupName][capName] = powerbi.DataViewObjects.getFillColor(objects, obj, settings[groupName][capName]);
                                else
                                    settings[groupName][capName] = powerbi.DataViewObjects.getValue(objects, obj, settings[groupName][capName]);
                            }
                        }
                        return settings;
                    };
                    thisVisual.persistHiddenSetting = function (host, name, value) {
                        var properties = {};
                        properties[name] = value;
                        host.persistProperties({
                            merge: [{
                                objectName: 'hidden',
                                selector: null,
                                properties: properties,
                            }]
                        });
                    };
                    thisVisual.getHiddenSetting = function (objects, name) {
                        var obj = { objectName: 'hidden', propertyName: name };
                        return powerbi.DataViewObjects.getValue(objects, obj);
                    };
                    thisVisual.equals = function (obj1, obj2) {
                        var _equals = function (obj1, obj2) {
                            var clone = $.extend(true, {}, obj1), cloneStr = JSON.stringify(clone);
                            return cloneStr === JSON.stringify($.extend(true, clone, obj2));
                        };
                        return _equals(obj1, obj2) && _equals(obj2, obj1);
                    };
                    thisVisual.autoTextColor = function (backColor) {
                        //Thanks to http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
                        var shadeBlend = function (p, c0, c1) {
                            var n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
                            if (c0.length > 7) {
                                var f = c0.split(","), t = (c1 ? c1 : p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","), R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
                                return "rgb(" + (u((w(t[0].slice(4)) - R) * n) + R) + "," + (u((w(t[1]) - G) * n) + G) + "," + (u((w(t[2]) - B) * n) + B) + ")";
                            }
                            else {
                                var f1 = w(c0.slice(1), 16), t1 = w((c1 ? c1 : p < 0 ? "#000000" : "#FFFFFF").slice(1), 16), R1 = f1 >> 16, G1 = f1 >> 8 & 0x00FF, B1 = f1 & 0x0000FF;
                                return "#" + (0x1000000 + (u(((t1 >> 16) - R1) * n) + R1) * 0x10000 + (u(((t1 >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (u(((t1 & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1);
                            }
                        };
                        return shadeBlend(-0.6, backColor, null);
                    };
                    thisVisual.debug = function (objLabel, obj) {
                        if (sqlbi.thisVisual.debugMode === false)
                            return;
                        function stringifyReplacer(key, value) {
                            if (typeof value === "function") {
                                return undefined;
                            }
                            return value;
                        }
                        if (document.location.href.substr(0, 4) == 'http') {
                            //debugger;
                            console.log(objLabel);
                            if (obj)
                                console.log(obj);
                        }
                        else {
                            var element = $('.' + sqlbi.thisVisual.className);
                            if ($('.debug', element).length == 0) {
                                var $debug = $('<div class="debug"></div>').css({
                                    'font-size': '11px',
                                    'color': '#999',
                                    'margin': '10px',
                                    'background': '#f2f2f2',
                                    'padding': '5px'
                                }).appendTo(element);
                                $('<a href="#" class="clear-debug">CLEAR CONSOLE</a>').css({
                                    'color': 'blue',
                                }).on('click', function (e) {
                                    e.preventDefault();
                                    $('.debug .content', element).html('');
                                }).appendTo($debug);
                                $('<div class="content"></div>').css({
                                    'overflow-y': 'scroll',
                                    'height': '200px'
                                }).appendTo($debug);
                            }
                            var now = (new Date()).toUTCString();
                            $('.debug .content', element).append('<div class="node"><strong>' + now + ':</strong> ' + objLabel + ' <pre>' + JSON.stringify(obj, stringifyReplacer, 4) + '</pre></div>');
                        }
                    };
                    /* Configuration */
                    thisVisual.className = 'SmartFilterBySQLBI';
                    thisVisual.debugMode = false; //If you set to false no debug messages will be shown
                    thisVisual._propsCapabilities = [
                        {
                            name: 'general',
                            displayName: 'General',
                            caps: [
                                { name: 'formatString', type: 10 /* custom */, hidden: true, custom: { formatting: { formatString: true } } },
                                { name: 'selected', type: 2 /* boolean */, hidden: true, defaultValue: false },
                                { name: 'filter', type: 9 /* filter */, hidden: true, custom: { output: { property: 'selected', selector: ['Values'] } } },
                            ]
                        },
                        {
                            name: 'filterBox',
                            displayName: 'Search box',
                            caps: [
                                { name: 'sandbox', displayName: 'Keep in boundaries', type: 2 /* boolean */, hidden: true, defaultValue: true },
                                { name: 'dropdownRows', displayName: 'Max dropdown rows', type: 1 /* number */, defaultValue: 10 },
                                { name: 'limit', displayName: 'Max selectable items', type: 1 /* number */, autoDefault: true },
                                { name: 'textSize', displayName: 'Text size', type: 6 /* fontSize */, defaultValue: 10 },
                                { name: 'tokenBackColor', displayName: 'Tokens background color', type: 3 /* color */, defaultValue: '#F2C811' },
                                { name: 'tokenColor', displayName: 'Tokens color', type: 3 /* color */, autoDefault: true },
                                { name: 'border', displayName: 'Border', type: 2 /* boolean */, defaultValue: true },
                                { name: 'observer', displayName: 'Observer mode', type: 2 /* boolean */, defaultValue: false },
                            ]
                        },
                        {
                            name: 'label',
                            displayName: 'Label',
                            caps: [
                                { name: 'show', displayName: 'Show', type: 2 /* boolean */, defaultValue: false },
                                { name: 'text', displayName: 'Text', type: 0 /* text */ },
                                { name: 'textSize', displayName: 'Text size', type: 6 /* fontSize */, defaultValue: 12 },
                                { name: 'fill', displayName: 'Color', type: 3 /* color */, defaultValue: '#333' }
                            ]
                        },
                    ];
                    thisVisual._dataCapabilities = {
                        //Follow API specifications for this section
                        dataRoles: [
                            {
                                name: 'Values',
                                displayName: 'Field',
                                kind: powerbi.VisualDataRoleKind.Grouping,
                            }
                        ],
                        dataViewMappings: [{
                            conditions: [
                                { 'Values': { max: 1 } }
                            ],
                            categorical: {
                                categories: {
                                    for: { in: 'Values' },
                                    dataReductionAlgorithm: { top: { count: 1000000 } }
                                },
                                includeEmptyGroups: true,
                            },
                        }],
                        suppressDefaultTitle: false,
                        //supportsHighlight: true,
                        objects: {}
                    };
                    return thisVisual;
                })();
                sqlbi.thisVisual = thisVisual;
                var thisVisualBehavior = (function () {
                    function thisVisualBehavior() {
                    }
                    thisVisualBehavior.prototype.bindEvents = function (behaviorOptions, selectionHandler) {
                        this.options = behaviorOptions;
                        //Specific code here
                        var filterPropertyId = { objectName: 'general', propertyName: 'filter' };
                        var tokenizer = behaviorOptions.tokenizer;
                        var comboBox = behaviorOptions.comboBox;
                        var selHandler = function (value) {
                            comboBox.find('option').each(function (i, el) {
                                if ($(this).val() === value) {
                                    selectionHandler.handleSelection($(this).data('datapoint'), true);
                                    selectionHandler.persistSelectionFilter(filterPropertyId);
                                    return false; //Break each
                                }
                            });
                        };
                        tokenizer.onAddToken = function (value, text, e) {
                            selHandler(value);
                        };
                        tokenizer.onRemoveToken = function (value, e) {
                            selHandler(value);
                        };
                        tokenizer.onClear = function (e) {
                            selectionHandler.handleClearSelection();
                            selectionHandler.persistSelectionFilter(filterPropertyId);
                        };
                    };
                    thisVisualBehavior.prototype.renderSelection = function (hasSelection) {
                        //Specific code here
                        sqlbi.thisVisual.debug('Render selection event of interactive behavior', 'Has selection? ' + hasSelection);
                    };
                    return thisVisualBehavior;
                })();
                sqlbi.thisVisualBehavior = thisVisualBehavior;
                (function (capType) {
                    capType[capType["text"] = 0] = "text";
                    capType[capType["number"] = 1] = "number";
                    capType[capType["boolean"] = 2] = "boolean";
                    capType[capType["color"] = 3] = "color";
                    capType[capType["enum"] = 4] = "enum";
                    capType[capType["unit"] = 5] = "unit";
                    capType[capType["fontSize"] = 6] = "fontSize";
                    capType[capType["labelStyle"] = 7] = "labelStyle";
                    capType[capType["legendPosition"] = 8] = "legendPosition";
                    capType[capType["filter"] = 9] = "filter";
                    capType[capType["custom"] = 10] = "custom";
                })(sqlbi.capType || (sqlbi.capType = {}));
                var capType = sqlbi.capType;
            })(sqlbi || (sqlbi = {}));
            /* End SQLBI Helper */
            var SmartFilterBySQLBI = (function () {
                function SmartFilterBySQLBI() {
                }
                //Init
                SmartFilterBySQLBI.prototype.init = function (options) {
                    this.element = options.element;
                    //this.svg = d3.select(this.element.get(0)).append('svg');
                    //this.svg.attr('class', sqlbi.thisVisual.className);
                    //this.clearCatcher = appendClearCatcher(this.svg);
                    //this.graphicsContext = this.svg.append('g');
                    this.hostServices = options.host;
                    this.hostServices.canSelect = SmartFilterBySQLBI.canSelect;
                    this.selectionManager = new SelectionManager({ hostServices: options.host });
                    this.interactivityService = visuals.createInteractivityService(options.host);
                    //this.legend = createLegend(this.element, true, this.interactivityService, true, LegendPosition.Bottom);
                    this.behavior = new sqlbi.thisVisualBehavior();
                    this.colors = options.style.colorPalette.dataColors;
                    this.inEditMode = true;
                    this.settings = sqlbi.thisVisual.defaultSettings();
                    this.data = { dataPoints: [], legendData: { dataPoints: [] } };
                    //Specific code here
                    var div = $('<div class="' + sqlbi.thisVisual.className + '" drag-resize-disabled="true"></div>').appendTo(this.element); //drag-resize-disabled is fundamental to allow input editing to users
                    this.label = $('<div class="tokenLabel"><p></p></div>').appendTo(div).toggle(this.settings.label.show === true);
                    this.comboBox = $('<select class="tokenCombo"></select>').appendTo(div);
                    this.tokenizer = new Tokenizer(this.comboBox);
                    var self = this;
                    this.tokenizer.onDropdownShow = function (e) {
                        self.element.closest('.visualContainer').css('z-index', '999999');
                    };
                    this.updateViewport(options.viewport);
                };
                //Override host select - Bug in April/May 2016 - Power BI Desktop
                SmartFilterBySQLBI.canSelect = function (args) {
                    var selectors = args.data;
                    // We can't have multiple selections if any include more than one identity
                    if (selectors && selectors.length > 1) {
                        if (selectors.some(function (value) { return value && value.data && value.data.length > 1; })) {
                            return false;
                        }
                    }
                    // Todo: check for cases of trying to select a category and a series (not the intersection)
                    return true;
                };
                //Enumerate Properties
                SmartFilterBySQLBI.prototype.enumerateObjectInstances = function (options) {
                    return sqlbi.thisVisual.enumerateSettings(options, this.settings);
                };
                //Detect view mode (works in Power BI Service only)
                SmartFilterBySQLBI.prototype.onViewModeChanged = function (viewMode) {
                    this.inEditMode = (viewMode === 1);
                };
                //Detect clear selection
                SmartFilterBySQLBI.prototype.onClearSelection = function () {
                    if (this.interactivityService)
                        this.interactivityService.clearSelection();
                    //Specific code here
                    if (this.tokenizer)
                        this.tokenizer.clear();
                };
                //Update ViewPort
                SmartFilterBySQLBI.prototype.updateViewport = function (viewport) {
                    if (viewport)
                        this.viewPort = viewport;
                    //Specific code here
                    if (this.settings && this.settings.filterBox.sandbox) {
                        $('.TokensContainer', this.element).css('height', '');
                        $('ul.Dropdown', this.element).css('max-height', (this.viewPort.height - $('.TokensContainer', this.element).height() - 10) + 'px');
                    }
                    else {
                        $('.TokensContainer', this.element).height(this.viewPort.height - 10);
                    }
                    this.label.height($('.TokensContainer', this.element).height());
                    if (this.tokenizer) {
                        this.tokenizer.container.width(this.viewPort.width - (this.settings.label.show === true ? this.label.width() + 20 : 0));
                    }
                };
                //Update
                SmartFilterBySQLBI.prototype.update = function (options) {
                    this.updateViewport(options.viewport);
                    this.inEditMode = (options.viewMode === 1);
                    sqlbi.thisVisual.debug('Update event', options);
                    var previousObserverSetting = this.settings.filterBox.observer;
                    var defaultSettings = sqlbi.thisVisual.defaultSettings();
                    this.settings = sqlbi.thisVisual.defaultSettings();
                    var dataView = options.dataViews[0];
                    if (dataView && dataView.metadata && dataView.metadata.objects)
                        this.settings = sqlbi.thisVisual.getSettings(dataView.metadata.objects, this.settings);
                    //Back-compatibility: if older reports update the visual the sandbox mode is not changed
                    /*if (dataView && this.settings.filterBox.sandbox === null) {
                        this.settings.filterBox.sandbox = !sqlbi.thisVisual.equals(defaultSettings, this.settings);
        
                        var properties: any = {};
                        properties.sandbox = this.settings.filterBox.sandbox;
                        this.hostServices.persistProperties({
                            merge: [{
                                objectName: 'filterBox',
                                selector: null,
                                properties: properties,
                            }]
                        });
                    }*/
                    //Specific code here
                    if (this.settings.filterBox.sandbox)
                        this.element.closest('.vcBody').css('overflow', '');
                    else
                        this.element.closest('.vcBody').css('overflow', 'visible'); //Make sure that the autocomplete combo is visible
                    if (this.tokenizer) {
                        this.tokenizer.maxElements = this.settings.filterBox.limit || Infinity;
                        this.tokenizer.toggleDropdownArrow();
                        this.tokenizer.toggleResetter(this.settings.filterBox.observer !== true);
                        this.tokenizer.elementsFontSize = parseInt(jsCommon.PixelConverter.fromPoint(this.settings.filterBox.textSize));
                        this.tokenizer.elementsBackColor = this.settings.filterBox.tokenBackColor;
                        this.tokenizer.elementsColor = (this.settings.filterBox.tokenColor ? this.settings.filterBox.tokenColor : sqlbi.thisVisual.autoTextColor(this.settings.filterBox.tokenBackColor));
                        var dropdownProps = visuals.dataLabelUtils.LabelTextProperties;
                        dropdownProps.fontSize = this.tokenizer.elementsFontSize;
                        dropdownProps.text = 'OK';
                        var dropdownItemHeight = powerbi.TextMeasurementService.measureSvgTextHeight(dropdownProps);
                        this.tokenizer.maxDropdownHeight = (this.settings.filterBox.sandbox ? 0 : Math.abs((dropdownItemHeight + 20) * this.settings.filterBox.dropdownRows) + 5);
                        $('li.Token', this.element).css({
                            'font-size': this.tokenizer.elementsFontSize + 'px',
                            'background-color': this.tokenizer.elementsBackColor,
                            'color': this.tokenizer.elementsColor
                        });
                        $('li.Token a.Close', this.element).css({
                            'background-color': this.tokenizer.elementsBackColor,
                            'color': this.tokenizer.elementsColor
                        });
                        $('.TokensContainer', this.element).css('border-width', (this.settings.filterBox.border === true ? '1px' : '0'));
                        if (dataView && dataView.categorical && dataView.categorical.categories) {
                            var filteredValues = [];
                            if (dataView.metadata && dataView.metadata.objects && dataView.metadata.objects.general && dataView.metadata.objects.general.filter && dataView.metadata.objects.general.filter.whereItems && dataView.metadata.objects.general.filter.whereItems[0] && dataView.metadata.objects.general.filter.whereItems && dataView.metadata.objects.general.filter.whereItems[0].condition) {
                                filteredValues = dataView.metadata.objects.general.filter.whereItems[0].condition.values;
                            }
                            var hasSelection = false;
                            var dataPoints = [];
                            for (var i = 0; i < dataView.categorical.categories.length; i++) {
                                var category = dataView.categorical.categories[i];
                                if (category.source.roles['Values'] && category.values) {
                                    if (this.settings.label.text === null)
                                        this.settings.label.text = category.source.displayName;
                                    for (var ii = 0; ii < category.values.length; ii++) {
                                        var selected = false;
                                        if (filteredValues.length > 0) {
                                            for (var iii = 0; iii < filteredValues.length; iii++) {
                                                var filteredDataPoint = filteredValues[iii][0];
                                                if (filteredDataPoint.value === category.values[ii]) {
                                                    selected = true;
                                                    break;
                                                }
                                            }
                                        }
                                        else if (this.settings.filterBox.observer === true) {
                                            selected = true;
                                        }
                                        if (selected)
                                            hasSelection = true;
                                        var identity = visuals.SelectionIdBuilder.builder().withCategory(category, ii).createSelectionId();
                                        dataPoints.push({
                                            identity: identity,
                                            value: category.values[ii],
                                            text: category.values[ii],
                                            selected: selected
                                        });
                                    }
                                }
                            }
                            //Check if something changed in the dataset
                            var remap = false;
                            if (this.settings.filterBox.observer === true || this.settings.filterBox.observer !== previousObserverSetting) {
                                remap = true;
                            }
                            else if (!this.data.dataPoints || this.data.dataPoints.length !== dataPoints.length) {
                                remap = true;
                            }
                            else {
                                for (var i = 0; i < dataPoints.length; i++) {
                                    var dataPoint = dataPoints[i];
                                    if (dataPoint.selected)
                                        continue;
                                    var found = false;
                                    for (var ii = 0; ii < this.data.dataPoints.length; ii++) {
                                        var previousDataPoint = this.data.dataPoints[ii];
                                        if (previousDataPoint.value === dataPoint.value) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        remap = true;
                                        break;
                                    }
                                }
                            }
                            this.data.dataPoints = dataPoints;
                            //this.interactivityService.applySelectionStateToData(this.data.dataPoints);
                            if (remap) {
                                this.comboBox.find('option').remove();
                                for (var i = 0; i < this.data.dataPoints.length; i++) {
                                    var dataPoint = this.data.dataPoints[i];
                                    var option = $('<option value="' + dataPoint.value + '">' + dataPoint.text + '</option>').appendTo(this.comboBox);
                                    option.data('datapoint', dataPoint);
                                    if (dataPoint.selected)
                                        option.attr('selected', 'selected');
                                }
                                this.tokenizer.remap();
                            }
                            this.interactivityService.bind(this.data.dataPoints, this.behavior, { hasHighlights: false, tokenizer: this.tokenizer, comboBox: this.comboBox }, { overrideSelectionFromData: true, hasSelectionOverride: hasSelection });
                        }
                    }
                    var labelFontSize = parseInt(jsCommon.PixelConverter.fromPoint(this.settings.label.textSize));
                    $('p', this.label).text(this.settings.label.text).css({
                        'font-size': labelFontSize + 'px',
                        'color': this.settings.label.fill
                    });
                    this.label.toggle(this.settings.label.show === true);
                    this.updateViewport(options.viewport);
                };
                //Capabilities
                SmartFilterBySQLBI.capabilities = sqlbi.thisVisual.capabilities();
                return SmartFilterBySQLBI;
            })();
            SmartFilterBySQLBI1458262140625.SmartFilterBySQLBI = SmartFilterBySQLBI;
            var Tokenizer = (function () {
                function Tokenizer(input) {
                    //Events
                    this.onAddToken = function (value, text, e) {
                    };
                    this.onRemoveToken = function (value, e) {
                    };
                    this.onClear = function (e) {
                    };
                    this.onDropdownAddItem = function (value, text, e) {
                    };
                    this.onDropdownShow = function (e) {
                    };
                    this.onDuplicateToken = function (value, text, e) {
                    };
                    var $this = this;
                    this.readonly = false;
                    this.select = input.attr('multiple', 'multiple').css({ margin: 0, padding: 0, border: 0 }).hide();
                    this.container = $('<div />').attr('class', this.select.attr('class')).addClass('Tokenize');
                    this.dropdown = $('<ul />').addClass('Dropdown');
                    this.dropdownArrow = $('<i class="arrow" title="Show all entries" />').on('click', function (e) {
                        e.stopImmediatePropagation();
                        if ($this.dropdown.is(':hidden'))
                            $this.search();
                        else
                            $this.dropdown.hide();
                    });
                    this.dropdownResetter = $('<span class="slicerHeader"><span class="clear" title= "Clear selections"> </span></span>').on('click', function (e) {
                        e.stopImmediatePropagation();
                        $this.select.find('option:selected').removeAttr('selected').prop('selected', false);
                        $this.searchInput.text('');
                        $this.clear(false);
                    });
                    this.tokensContainer = $('<ul />').addClass('TokensContainer');
                    this.searchToken = $('<li />').addClass('TokenSearch').appendTo(this.tokensContainer);
                    this.searchInput = $('<input />').appendTo(this.searchToken);
                    if (this.select.prop('disabled')) {
                        this.disable();
                    }
                    this.container.append(this.tokensContainer).append(this.dropdown).append(this.dropdownArrow).append(this.dropdownResetter).insertAfter(this.select);
                    this.tokensContainer.on('click', function (e) {
                        e.stopImmediatePropagation();
                        $this.searchInput.get(0).focus();
                        if ($this.dropdown.is(':hidden') && $this.searchInput.val() != '') {
                            $this.search();
                        }
                    });
                    this.searchInput.on('blur', function () {
                        $this.tokensContainer.removeClass('Focused');
                    });
                    this.searchInput.on('focus click', function () {
                        $this.tokensContainer.addClass('Focused');
                    });
                    this.searchInput.on('keydown', function (e) {
                        $this.resizeSearchInput();
                        $this.keydown(e);
                    });
                    this.searchInput.on('keyup', function (e) {
                        $this.keyup(e);
                    });
                    this.searchInput.on('paste', function () {
                        setTimeout(function () {
                            $this.resizeSearchInput();
                        }, 10);
                        setTimeout(function () {
                            var paste_elements = $this.searchInput.val().split(',');
                            if (paste_elements.length > 1) {
                                $.each(paste_elements, function (_, value) {
                                    $this.tokenAdd(value.trim(), '');
                                });
                            }
                        }, 20);
                    });
                    $(document).on('click', function () {
                        $this.dropdownHide();
                        if ($this.maxElements == 1) {
                            if ($this.searchInput.val()) {
                                $this.tokenAdd($this.searchInput.val(), '');
                            }
                        }
                    });
                    this.resizeSearchInput();
                    this.remap();
                }
                Tokenizer.prototype.toggleReadonly = function (isReadonly) {
                    this.readonly = isReadonly;
                    this.container.toggleClass('readonly', isReadonly);
                    this.resetPendingTokens();
                };
                Tokenizer.prototype.dropdownUpdateColors = function () {
                    $('li', this.dropdown).css({
                        'background': 'none',
                        'color': '#fff'
                    });
                    $('li.Hover', this.dropdown).css({
                        'background': this.elementsBackColor,
                        'color': this.elementsColor
                    });
                };
                Tokenizer.prototype.dropdownShow = function () {
                    if (this.maxDropdownHeight > 0)
                        this.dropdown.css('max-height', this.maxDropdownHeight + 'px');
                    this.onDropdownShow(this);
                    $('ul.Dropdown').hide();
                    this.dropdown.show();
                };
                Tokenizer.prototype.dropdownPrev = function () {
                    if ($('li.Hover', this.dropdown).length > 0) {
                        if (!$('li.Hover', this.dropdown).is('li:first-child')) {
                            $('li.Hover', this.dropdown).removeClass('Hover').prev().addClass('Hover');
                        }
                        else {
                            $('li.Hover', this.dropdown).removeClass('Hover');
                            $('li:last-child', this.dropdown).addClass('Hover');
                        }
                    }
                    else {
                        $('li:first', this.dropdown).addClass('Hover');
                    }
                    this.dropdownUpdateColors();
                };
                Tokenizer.prototype.dropdownNext = function () {
                    if ($('li.Hover', this.dropdown).length > 0) {
                        if (!$('li.Hover', this.dropdown).is('li:last-child')) {
                            $('li.Hover', this.dropdown).removeClass('Hover').next().addClass('Hover');
                        }
                        else {
                            $('li.Hover', this.dropdown).removeClass('Hover');
                            $('li:first-child', this.dropdown).addClass('Hover');
                        }
                    }
                    else {
                        $('li:first', this.dropdown).addClass('Hover');
                    }
                    this.dropdownUpdateColors();
                };
                Tokenizer.prototype.dropdownAddItem = function (value, text) {
                    if (!$('li[data-value="' + value + '"]', this.tokensContainer).length) {
                        var $this = this;
                        var item = $('<li />').attr('data-value', value).attr('data-text', text).css('font-size', this.elementsFontSize + 'px').html(this.escape(text)).on('click', function (e) {
                            e.stopImmediatePropagation();
                            $this.tokenAdd($(this).attr('data-value'), $(this).attr('data-text'));
                        }).on('mouseover', function () {
                            $(this).addClass('Hover');
                            $this.dropdownUpdateColors();
                        }).on('mouseout', function () {
                            $('li', $this.dropdown).removeClass('Hover');
                            $this.dropdownUpdateColors();
                        });
                        this.dropdown.append(item);
                        this.onDropdownAddItem(value, text, this);
                    }
                    return this;
                };
                Tokenizer.prototype.dropdownHide = function () {
                    this.toggleDropdownArrow();
                    this.dropdownReset();
                    this.dropdown.hide();
                };
                Tokenizer.prototype.dropdownReset = function () {
                    this.dropdown.html('');
                };
                Tokenizer.prototype.toggleDropdownArrow = function () {
                    var allOptions = $("option", this.select);
                    var selOptions = $("option:selected", this.select);
                    this.dropdownArrow.toggleClass('disabled', allOptions.length < 1 || allOptions.length === selOptions.length || selOptions.length === this.maxElements);
                };
                Tokenizer.prototype.toggleResetter = function (show) {
                    this.dropdownResetter.toggle(show);
                };
                Tokenizer.prototype.resizeSearchInput = function () {
                    this.searchInput.attr('size', Number(this.searchInput.val().length) + 5);
                };
                Tokenizer.prototype.resetSearchInput = function () {
                    this.searchInput.val("");
                    this.resizeSearchInput();
                };
                Tokenizer.prototype.resetPendingTokens = function () {
                    $('li.PendingDelete', this.tokensContainer).removeClass('PendingDelete');
                };
                Tokenizer.prototype.keydown = function (e) {
                    switch (e.keyCode) {
                        case Tokenizer.KEYS.BACKSPACE:
                            if (this.searchInput.val().length == 0 && !this.readonly) {
                                e.preventDefault();
                                if ($('li.Token.PendingDelete', this.tokensContainer).length) {
                                    this.tokenRemove($('li.Token.PendingDelete').attr('data-value'));
                                }
                                else {
                                    $('li.Token:last', this.tokensContainer).addClass('PendingDelete');
                                }
                                this.dropdownHide();
                            }
                            break;
                        case Tokenizer.KEYS.TAB:
                        case Tokenizer.KEYS.ENTER:
                            if ($('li.Hover', this.dropdown).length) {
                                var element = $('li.Hover', this.dropdown);
                                e.preventDefault();
                                this.tokenAdd(element.attr('data-value'), element.attr('data-text'));
                            }
                            else {
                                if (this.searchInput.val()) {
                                    e.preventDefault();
                                    this.tokenAdd(this.searchInput.val(), '');
                                }
                            }
                            this.resetPendingTokens();
                            break;
                        case Tokenizer.KEYS.ESCAPE:
                            this.resetSearchInput();
                            this.dropdownHide();
                            this.resetPendingTokens();
                            break;
                        case Tokenizer.KEYS.ARROW_UP:
                            e.preventDefault();
                            this.dropdownPrev();
                            break;
                        case Tokenizer.KEYS.ARROW_DOWN:
                            e.preventDefault();
                            this.dropdownNext();
                            break;
                        default:
                            this.resetPendingTokens();
                            break;
                    }
                };
                Tokenizer.prototype.keyup = function (e) {
                    switch (e.keyCode) {
                        case Tokenizer.KEYS.TAB:
                        case Tokenizer.KEYS.ENTER:
                        case Tokenizer.KEYS.ESCAPE:
                        case Tokenizer.KEYS.ARROW_UP:
                        case Tokenizer.KEYS.ARROW_DOWN:
                            break;
                        case Tokenizer.KEYS.BACKSPACE:
                            if (this.searchInput.val()) {
                                this.search();
                            }
                            else {
                                this.dropdownHide();
                            }
                            break;
                        default:
                            if (this.searchInput.val()) {
                                this.search();
                            }
                            break;
                    }
                };
                Tokenizer.prototype.search = function () {
                    var $this = this;
                    var count = 1;
                    if ((this.maxElements > 0 && $('li.Token', this.tokensContainer).length >= this.maxElements)) {
                        return false;
                    }
                    var found = false, regexp = new RegExp(this.searchInput.val().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
                    this.dropdownReset();
                    $('option', this.select).not(':selected, :disabled').each(function () {
                        //if (count <= 10) {
                        if (regexp.test($(this).html())) {
                            $this.dropdownAddItem($(this).attr('value'), $(this).html());
                            found = true;
                            count++;
                        }
                        /*} else {
                            return false;
                        }*/
                    });
                    if (found) {
                        $('li:first', this.dropdown).addClass('Hover');
                        this.dropdownUpdateColors();
                        this.dropdownShow();
                    }
                    else {
                        this.dropdownHide();
                    }
                };
                Tokenizer.prototype.tokenAdd = function (value, text, first) {
                    value = value.replace(/["]/g, ''); //.trim();
                    if (value == undefined || value == '') {
                        return this;
                    }
                    text = text || value;
                    first = first || false;
                    if (!this.readonly && this.maxElements > 0 && $('li.Token', this.tokensContainer).length >= this.maxElements) {
                        this.resetSearchInput();
                        return this;
                    }
                    var $this = this;
                    var close_btn = (this.readonly ? '' : $('<a />').addClass('Close').css({
                        'background-color': this.elementsBackColor,
                        'color': this.elementsColor
                    }).html("&#215;").on('click', function (e) {
                        e.stopImmediatePropagation();
                        $this.tokenRemove(value);
                    }));
                    if ($('option[value="' + value + '"]', this.select).length > 0) {
                        if (!first && ($('option[value="' + value + '"]', this.select).attr('selected') === true || $('option[value="' + value + '"]', this.select).prop('selected') === true)) {
                            this.onDuplicateToken(value, text, this);
                        }
                        $('option[value="' + value + '"]', this.select).attr('selected', true).prop('selected', true);
                    }
                    else if ($('li[data-value="' + value + '"]', this.dropdown).length > 0) {
                        var option = $('<option />').attr('selected', true).attr('value', value).attr('data-type', 'custom').prop('selected', true).text(text);
                        this.select.append(option);
                    }
                    else {
                        this.resetSearchInput();
                        return this;
                    }
                    if ($('li.Token[data-value="' + value + '"]', this.tokensContainer).length > 0) {
                        return this;
                    }
                    $('<li />').addClass('Token').attr('data-value', value).append('<span>' + text + '</span>').css({
                        'font-size': this.elementsFontSize + 'px',
                        'background-color': this.elementsBackColor,
                        'color': this.elementsColor
                    }).prepend(close_btn).insertBefore(this.searchToken);
                    if (!first)
                        this.onAddToken(value, text, this);
                    this.resetSearchInput();
                    this.dropdownHide();
                    return this;
                };
                Tokenizer.prototype.tokenRemove = function (value, first) {
                    var option = $('option[value="' + value + '"]', this.select);
                    if (option.attr('data-type') == 'custom') {
                        option.remove();
                    }
                    else {
                        option.removeAttr('selected').prop('selected', false);
                    }
                    $('li.Token[data-value="' + value + '"]', this.tokensContainer).remove();
                    first = first || false;
                    if (!first)
                        this.onRemoveToken(value, this);
                    this.resizeSearchInput();
                    this.dropdownHide();
                    return this;
                };
                Tokenizer.prototype.clear = function (first) {
                    var $this = this;
                    first = first || false;
                    $('li.Token', this.tokensContainer).each(function () {
                        $this.tokenRemove($(this).attr('data-value'), true);
                    });
                    if (!first)
                        this.onClear(this);
                    this.dropdownHide();
                    return this;
                };
                Tokenizer.prototype.disable = function () {
                    this.select.prop('disabled', true);
                    this.searchInput.prop('disabled', true);
                    this.container.addClass('Disabled');
                    return this;
                };
                Tokenizer.prototype.enable = function () {
                    this.select.prop('disabled', false);
                    this.searchInput.prop('disabled', false);
                    this.container.removeClass('Disabled');
                    return this;
                };
                Tokenizer.prototype.remap = function () {
                    var $this = this;
                    var tmp = $("option:selected", this.select);
                    this.clear(true);
                    tmp.each(function () {
                        $this.tokenAdd($(this).val(), $(this).html(), true);
                    });
                    return this;
                };
                Tokenizer.prototype.toArray = function () {
                    var output = [];
                    $("option:selected", this.select).each(function () {
                        output.push($(this).val());
                    });
                    return output;
                };
                Tokenizer.prototype.escape = function (html) {
                    return String(html).replace(/[<>]/g, function (s) {
                        var map = {
                            "<": "&lt;",
                            ">": "&gt;"
                        };
                        return map[s];
                    });
                };
                Tokenizer.KEYS = {
                    BACKSPACE: 8,
                    TAB: 9,
                    ENTER: 13,
                    ESCAPE: 27,
                    ARROW_UP: 38,
                    ARROW_DOWN: 40
                };
                return Tokenizer;
            })();
            SmartFilterBySQLBI1458262140625.Tokenizer = Tokenizer;
        })(SmartFilterBySQLBI1458262140625 = visuals.SmartFilterBySQLBI1458262140625 || (visuals.SmartFilterBySQLBI1458262140625 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.SmartFilterBySQLBI1458262140625 = {
                name: 'SmartFilterBySQLBI1458262140625',
                class: 'SmartFilterBySQLBI1458262140625',
                capabilities: powerbi.visuals.SmartFilterBySQLBI1458262140625.SmartFilterBySQLBI.capabilities,
                custom: true,
                create: function (options) { return new powerbi.visuals.SmartFilterBySQLBI1458262140625.SmartFilterBySQLBI(options); },
                apiVersion: null
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
