'use strict';

System.register(['lodash', 'moment', 'app/core/utils/kbn'], function (_export, _context) {
	"use strict";

	var _, moment, kbn, _createClass, TableRenderer;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	return {
		setters: [function (_lodash) {
			_ = _lodash.default;
		}, function (_moment) {
			moment = _moment.default;
		}, function (_appCoreUtilsKbn) {
			kbn = _appCoreUtilsKbn.default;
		}],
		execute: function () {
			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			_export('TableRenderer', TableRenderer = function () {
				function TableRenderer(panel, table, isUtc, sanitize, templateSrv) {
					_classCallCheck(this, TableRenderer);

					this.panel = panel;
					this.table = table;
					this.isUtc = isUtc;
					this.sanitize = sanitize;
					this.templateSrv = templateSrv;
					this.initColumns();
				}

				_createClass(TableRenderer, [{
					key: 'setTable',
					value: function setTable(table) {
						this.table = table;
						this.initColumns();
					}
				}, {
					key: 'initColumns',
					value: function initColumns() {
						this.formatters = [];
						this.colorState = {};
						for (var colIndex = 0; colIndex < this.table.columns.length; colIndex++) {
							var column = this.table.columns[colIndex];
							column.title = column.text;

							for (var i = 0; i < this.panel.styles.length; i++) {
								var style = this.panel.styles[i];

								// const regex = stringToJsRegex(style.pattern); // for v6.3 and above
								var regex = kbn.stringToJsRegex(style.pattern); // for v6.0
								if (column.text.match(regex)) {
									column.style = style;

									if (style.alias) {
										column.title = column.text.replace(regex, style.alias);
									}

									break;
								}
							}

							this.formatters[colIndex] = this.createColumnFormatter(column);
						}
					}
				}, {
					key: 'getColorForValue',
					value: function getColorForValue(value, style) {
						if (!style.thresholds) {
							return null;
						}
						for (var i = style.thresholds.length; i > 0; i--) {
							if (value >= style.thresholds[i - 1]) {
								return style.colors[i];
							}
						}
						return _.first(style.colors);
					}
				}, {
					key: 'defaultCellFormatter',
					value: function defaultCellFormatter(v, style) {
						if (v === null || v === void 0 || v === undefined) {
							return '';
						}

						if (_.isArray(v)) {
							v = v.join(', ');
						}

						if (style && style.sanitize) {
							return this.sanitize(v);
						} else {
							return _.escape(v);
						}
					}
				}, {
					key: 'createColumnFormatter',
					value: function createColumnFormatter(column) {
						var _this = this;

						if (!column.style) {
							return this.defaultCellFormatter;
						}

						if (column.style.type === 'hidden') {
							return function (v) {
								return undefined;
							};
						}

						if (column.style.type === 'date') {
							return function (v) {
								if (v === undefined || v === null) {
									return '-';
								}

								if (_.isArray(v)) {
									v = v[0];
								}

								// if is an epoch (numeric string and len > 12)
								if (_.isString(v) && !isNaN(v) && v.length > 12) {
									v = parseInt(v, 10);
								}

								var date = moment(v);

								if (_this.isUtc) {
									date = date.utc();
								}
								return date.format(column.style.dateFormat);
							};
						}

						if (column.style.type === 'string') {
							return function (v) {
								if (_.isArray(v)) {
									v = v.join(', ');
								}

								var mappingType = column.style.mappingType || 0;

								if (mappingType === 1 && column.style.valueMaps) {
									for (var i = 0; i < column.style.valueMaps.length; i++) {
										var map = column.style.valueMaps[i];

										if (v === null) {
											if (map.value === 'null') {
												return map.text;
											}
											continue;
										}

										// Allow both numeric and string values to be mapped
										if (!_.isString(v) && Number(map.value) === Number(v) || map.value === v) {
											_this.setColorState(v, column.style);
											return _this.defaultCellFormatter(map.text, column.style);
										}
									}
								}

								if (mappingType === 2 && column.style.rangeMaps) {
									for (var _i = 0; _i < column.style.rangeMaps.length; _i++) {
										var _map = column.style.rangeMaps[_i];

										if (v === null) {
											if (_map.from === 'null' && _map.to === 'null') {
												return _map.text;
											}
											continue;
										}

										if (Number(_map.from) <= Number(v) && Number(_map.to) >= Number(v)) {
											_this.setColorState(v, column.style);
											return _this.defaultCellFormatter(_map.text, column.style);
										}
									}
								}

								if (v === null || v === void 0) {
									return '-';
								}

								_this.setColorState(v, column.style);
								return _this.defaultCellFormatter(v, column.style);
							};
						}

						if (column.style.type === 'number') {
							var valueFormatter = kbn.valueFormats[column.unit || column.style.unit];

							return function (v) {
								if (v === null || v === void 0) {
									return '-';
								}

								if (_.isString(v) || _.isArray(v)) {
									return _this.defaultCellFormatter(v, column.style);
								}

								_this.setColorState(v, column.style);
								return valueFormatter(v, column.style.decimals, null);
							};
						}

						return function (value) {
							return _this.defaultCellFormatter(value, column.style);
						};
					}
				}, {
					key: 'setColorState',
					value: function setColorState(value, style) {
						if (!style.colorMode) {
							return;
						}

						if (value === null || value === void 0 || _.isArray(value)) {
							return;
						}

						var numericValue = Number(value);
						if (isNaN(numericValue)) {
							return;
						}

						this.colorState[style.colorMode] = this.getColorForValue(numericValue, style);
					}
				}, {
					key: 'renderRowVariables',
					value: function renderRowVariables(rowIndex) {
						var scopedVars = {};
						var cellVariable = void 0;
						var row = this.table.rows[rowIndex];
						for (var i = 0; i < row.length; i++) {
							cellVariable = '__cell_' + i;
							scopedVars[cellVariable] = { value: row[i] };
						}
						return scopedVars;
					}
				}, {
					key: 'formatColumnValue',
					value: function formatColumnValue(colIndex, value) {
						return this.formatters[colIndex] ? this.formatters[colIndex](value) : value;
					}
				}, {
					key: 'renderCell',
					value: function renderCell(columnIndex, rowIndex, value) {
						var addWidthHack = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

						value = this.formatColumnValue(columnIndex, value);

						var column = this.table.columns[columnIndex];
						var cellStyle = '';
						var textStyle = '';
						var cellClasses = [];
						var cellClass = '';

						if (this.colorState.cell) {
							cellStyle = ' style="background-color:' + this.colorState.cell + '"';
							cellClasses.push('table-panel-color-cell');
							this.colorState.cell = null;
						} else if (this.colorState.value) {
							textStyle = ' style="color:' + this.colorState.value + '"';
							this.colorState.value = null;
						}
						// because of the fixed table headers css only solution
						// there is an issue if header cell is wider the cell
						// this hack adds header content to cell (not visible)
						var columnHtml = '';
						if (addWidthHack) {
							columnHtml = '<div class="table-panel-width-hack">' + this.table.columns[columnIndex].title + '</div>';
						}

						if (value === undefined) {
							cellStyle = ' style="display:none;"';
							column.hidden = true;
						} else {
							column.hidden = false;
						}

						if (column.hidden === true) {
							return '';
						}

						if (column.style && column.style.preserveFormat) {
							cellClasses.push('table-panel-cell-pre');
						}

						if (column.style && column.style.link) {
							// Render cell as link
							var scopedVars = this.renderRowVariables(rowIndex);
							scopedVars['__cell'] = { value: value };

							var cellLink = this.templateSrv.replace(column.style.linkUrl, scopedVars, encodeURIComponent);
							var cellLinkTooltip = this.templateSrv.replace(column.style.linkTooltip, scopedVars);
							var cellTarget = column.style.linkTargetBlank ? '_blank' : '';

							cellClasses.push('table-panel-cell-link');

							columnHtml += '\n        <a href="' + cellLink + '" target="' + cellTarget + '" data-link-tooltip data-original-title="' + cellLinkTooltip + '" data-placement="right"' + textStyle + '>\n          ' + value + '\n        </a>\n      ';
						} else {
							columnHtml += value;
						}

						if (column.filterable) {
							cellClasses.push('table-panel-cell-filterable');
							columnHtml += '\n        <a class="table-panel-filter-link" data-link-tooltip data-original-title="Filter out value" data-placement="bottom"\n           data-row="' + rowIndex + '" data-column="' + columnIndex + '" data-operator="!=">\n          <i class="fa fa-search-minus"></i>\n        </a>\n        <a class="table-panel-filter-link" data-link-tooltip data-original-title="Filter for value" data-placement="bottom"\n           data-row="' + rowIndex + '" data-column="' + columnIndex + '" data-operator="=">\n          <i class="fa fa-search-plus"></i>\n        </a>';
						}

						if (cellClasses.length) {
							cellClass = ' class="' + cellClasses.join(' ') + '"';
						}

						columnHtml = '<td' + cellClass + cellStyle + textStyle + '>' + columnHtml + '</td>';
						return columnHtml;
					}
				}, {
					key: 'render',
					value: function render(page) {
						var pageSize = this.panel.pageSize || 100;
						var startPos = page * pageSize;
						var endPos = Math.min(startPos + pageSize, this.table.rows.length);
						var html = '';
						var rowClasses = ['tr-affect'];
						var rowID = ' id="order-mgt-operator-table-tr"';
						var rowClass = '';
						var status = [''];

						for (var y = startPos; y < endPos; y++) {
							var row = this.table.rows[y];
							var lowerCaseRow = row.map(function (elem) {
								return typeof elem === 'string' ? elem.toLowerCase() : elem;
							});
							var cellHtml = '';
							var rowStyle = '';

							if (lowerCaseRow.indexOf('planned') > -1) {
								this.colorState.row = '#C9C9C9';
							} else if (lowerCaseRow.indexOf('next') > -1) {
								this.colorState.row = '#FFFB85';
							} else if (lowerCaseRow.indexOf('running') > -1) {
								this.colorState.row = '#91F449';
							} else if (lowerCaseRow.indexOf('paused') > -1) {
								this.colorState.row = '#E8B20C';
							} else if (lowerCaseRow.indexOf('complete') > -1) {
								this.colorState.row = '#70C6FF';
							} else if (lowerCaseRow.indexOf('closed') > -1) {
								this.colorState.row = '#FF7773';
							} else if (lowerCaseRow.indexOf('ready') > -1) {
								this.colorState.row = '#CCFFAF';
							}

							for (var i = 0; i < this.table.columns.length; i++) {
								cellHtml += this.renderCell(i, y, row[i], y === startPos);
							}

							if (this.colorState.row) {
								rowStyle = ' style="background-color:' + this.colorState.row + ';color: black;"';
								rowClasses.push('table-panel-color-row');
								this.colorState.row = 'white';
							}

							if (rowClasses.length) {
								rowClass = ' class="' + rowClasses.join(' ') + '"';
							}

							html += '<tr ' + rowClass + rowStyle + rowID + '>' + cellHtml + '</tr>';
						}

						return html;
					}
				}, {
					key: 'render_values',
					value: function render_values() {
						var rows = [];

						for (var y = 0; y < this.table.rows.length; y++) {
							var row = this.table.rows[y];
							var newRow = [];
							for (var i = 0; i < this.table.columns.length; i++) {
								newRow.push(this.formatColumnValue(i, row[i]));
							}
							rows.push(newRow);
						}
						return {
							columns: this.table.columns,
							rows: rows
						};
					}
				}]);

				return TableRenderer;
			}());

			_export('TableRenderer', TableRenderer);
		}
	};
});
//# sourceMappingURL=renderer.js.map
