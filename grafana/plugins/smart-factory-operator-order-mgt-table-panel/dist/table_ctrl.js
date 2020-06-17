'use strict';

System.register(['lodash', 'jquery', 'moment', 'app/plugins/sdk', './transformers', './editor', './column_options', './renderer', './actions_form_ctrl', './utils', './css/style.css!', './css/instant-serach.css!'], function (_export, _context) {
	"use strict";

	var _, $, moment, MetricsPanelCtrl, transformDataToTable, tablePanelEditor, columnOptionsTab, TableRenderer, showActionForm, utils, _slicedToArray, _createClass, _get, panelDefaults, _ctrl, TableCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	function refresh() {
		_ctrl.refresh();
	}

	_export('refresh', refresh);

	function refreshDashboard() {
		_ctrl.timeSrv.refreshDashboard();
	}

	_export('refreshDashboard', refreshDashboard);

	return {
		setters: [function (_lodash) {
			_ = _lodash.default;
		}, function (_jquery) {
			$ = _jquery.default;
		}, function (_moment) {
			moment = _moment.default;
		}, function (_appPluginsSdk) {
			MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
		}, function (_transformers) {
			transformDataToTable = _transformers.transformDataToTable;
		}, function (_editor) {
			tablePanelEditor = _editor.tablePanelEditor;
		}, function (_column_options) {
			columnOptionsTab = _column_options.columnOptionsTab;
		}, function (_renderer) {
			TableRenderer = _renderer.TableRenderer;
		}, function (_actions_form_ctrl) {
			showActionForm = _actions_form_ctrl.showActionForm;
		}, function (_utils) {
			utils = _utils;
		}, function (_cssStyleCss) {}, function (_cssInstantSerachCss) {}],
		execute: function () {
			_slicedToArray = function () {
				function sliceIterator(arr, i) {
					var _arr = [];
					var _n = true;
					var _d = false;
					var _e = undefined;

					try {
						for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
							_arr.push(_s.value);

							if (i && _arr.length === i) break;
						}
					} catch (err) {
						_d = true;
						_e = err;
					} finally {
						try {
							if (!_n && _i["return"]) _i["return"]();
						} finally {
							if (_d) throw _e;
						}
					}

					return _arr;
				}

				return function (arr, i) {
					if (Array.isArray(arr)) {
						return arr;
					} else if (Symbol.iterator in Object(arr)) {
						return sliceIterator(arr, i);
					} else {
						throw new TypeError("Invalid attempt to destructure non-iterable instance");
					}
				};
			}();

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

			_get = function get(object, property, receiver) {
				if (object === null) object = Function.prototype;
				var desc = Object.getOwnPropertyDescriptor(object, property);

				if (desc === undefined) {
					var parent = Object.getPrototypeOf(object);

					if (parent === null) {
						return undefined;
					} else {
						return get(parent, property, receiver);
					}
				} else if ("value" in desc) {
					return desc.value;
				} else {
					var getter = desc.get;

					if (getter === undefined) {
						return undefined;
					}

					return getter.call(receiver);
				}
			};

			panelDefaults = {
				targets: [{}],
				transform: 'timeseries_to_columns',
				pageSize: null,
				showHeader: true,
				styles: [{
					type: 'date',
					pattern: 'Time',
					alias: 'Time',
					dateFormat: 'YYYY-MM-DD HH:mm:ss',
					headerColor: 'rgba(51, 181, 229, 1)'
				}, {
					unit: 'short',
					type: 'number',
					alias: '',
					decimals: 2,
					headerColor: 'rgba(51, 181, 229, 1)',
					colors: ['rgba(245, 54, 54, 0.9)', 'rgba(237, 129, 40, 0.89)', 'rgba(50, 172, 45, 0.97)'],
					colorMode: null,
					pattern: '/.*/',
					thresholds: []
				}],
				columns: [],
				scroll: true,
				fontSize: '100%',
				sort: { col: 0, desc: true }
			};
			_ctrl = void 0;

			_export('TableCtrl', TableCtrl = function (_MetricsPanelCtrl) {
				_inherits(TableCtrl, _MetricsPanelCtrl);

				function TableCtrl($scope, $injector, templateSrv, annotationsSrv, $sanitize, variableSrv) {
					_classCallCheck(this, TableCtrl);

					var _this = _possibleConstructorReturn(this, (TableCtrl.__proto__ || Object.getPrototypeOf(TableCtrl)).call(this, $scope, $injector));

					_this.pageIndex = 0;

					if (_this.panel.styles === void 0) {
						_this.panel.styles = _this.panel.columns;
						_this.panel.columns = _this.panel.fields;
						delete _this.panel.columns;
						delete _this.panel.fields;
					}

					_.defaults(_this.panel, panelDefaults);

					_this.events.on('data-received', _this.onDataReceived.bind(_this));
					_this.events.on('data-error', _this.onDataError.bind(_this));
					_this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
					_this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
					_this.events.on('init-panel-actions', _this.onInitPanelActions.bind(_this));

					//Remove listeners before add it
					$(document).off('click', 'tr.tr-affect#order-mgt-operator-table-tr');
					//Show form if a row is clicked
					$(document).on('click', 'tr.tr-affect#order-mgt-operator-table-tr', function (e) {
						var rowData = $('td', this).map(function (index, td) {
							if (td.childNodes.length === 2) {
								return td.childNodes[1].nodeValue;
							} else if (td.childNodes.length === 1) {
								return $(td).text();
							} else {
								return '';
							}
						});

						var prodLineIndex = $scope.ctrl.colDimensions.indexOf('production_line');
						var orderIdIndex = $scope.ctrl.colDimensions.indexOf('order_id');
						var prodDescIndex = $scope.ctrl.colDimensions.indexOf('product_desc');
						var prodIdIndex = $scope.ctrl.colDimensions.indexOf('product_id');
						if (!~prodLineIndex || !~orderIdIndex || !~prodDescIndex || !~prodIdIndex) {
							utils.alert('error', 'Error', 'Get not get this order from the database, please contact the dev team');
							return;
						} else {
							showActionForm(rowData[prodLineIndex], rowData[orderIdIndex], rowData[prodDescIndex], rowData[prodIdIndex]);
						}
					});
					return _this;
				}

				_createClass(TableCtrl, [{
					key: 'onInitEditMode',
					value: function onInitEditMode() {
						this.addEditorTab('Options', tablePanelEditor, 2);
						this.addEditorTab('Column Styles', columnOptionsTab, 3);
					}
				}, {
					key: 'onInitPanelActions',
					value: function onInitPanelActions(actions) {
						actions.push({ text: 'Export CSV', click: 'ctrl.exportCsv()' });
					}
				}, {
					key: 'issueQueries',
					value: function issueQueries(datasource) {
						this.pageIndex = 0;

						if (this.panel.transform === 'annotations') {
							this.setTimeQueryStart();
							return this.annotationsSrv.getAnnotations({
								dashboard: this.dashboard,
								panel: this.panel,
								range: this.range
							}).then(function (annotations) {
								return { data: annotations };
							});
						}

						return _get(TableCtrl.prototype.__proto__ || Object.getPrototypeOf(TableCtrl.prototype), 'issueQueries', this).call(this, datasource);
					}
				}, {
					key: 'onDataError',
					value: function onDataError(err) {
						this.dataRaw = [];
						this.render();
					}
				}, {
					key: 'onDataReceived',
					value: function onDataReceived(dataList) {
						dataList = this.reorderData(dataList);
						dataList = this.filter(dataList);
						dataList = this.sort(dataList, 'scheduled_start_datetime'); // sort rows so that all rows are sort/order by scheduled_start_time

						this.dataRaw = dataList;
						this.pageIndex = 0;
						// automatically correct transform mode based on data
						if (this.dataRaw && this.dataRaw.length) {
							if (this.dataRaw[0].type === 'table') {
								this.panel.transform = 'table';
							} else {
								if (this.dataRaw[0].type === 'docs') {
									this.panel.transform = 'json';
								} else {
									if (this.panel.transform === 'table' || this.panel.transform === 'json') {
										this.panel.transform = 'timeseries_to_rows';
									}
								}
							}
						}

						this.render();
					}
				}, {
					key: 'reorderData',
					value: function reorderData(dataList) {
						if (dataList.length === 0) {
							return dataList;
						}

						if (dataList[0].columns) {
							var index = dataList[0].columns.findIndex(function (col) {
								return col.text.toLowerCase() === 'production_line';
							});
							if (index !== -1) {
								//store data
								var pro_line_col = dataList[0].columns[index];
								//remove data from original position
								dataList[0].columns.splice(index, 1);
								//insert data to index 1 with the stored obj
								dataList[0].columns.splice(1, 0, pro_line_col);

								//reorder for each row data
								for (var i = 0; i < dataList[0].rows.length; i++) {
									var row = dataList[0].rows[i];
									var pro_line_row = row[index];
									row.splice(index, 1);
									row.splice(1, 0, pro_line_row);
								}
							}
						}
						return dataList;
					}
				}, {
					key: 'filter',
					value: function filter(dataList) {
						if (dataList.length === 0) {
							return dataList;
						}

						var rows = dataList[0].rows;
						rows = rows.filter(function (row) {
							var lowerCaseRow = row.map(function (elem) {
								return typeof elem === 'string' ? elem.toLowerCase() : elem;
							});
							if (lowerCaseRow.indexOf('replaced') === -1 && lowerCaseRow.indexOf('deleted') === -1) {
								return row;
							}
						});
						dataList[0].rows = rows;

						return dataList;
					}
				}, {
					key: 'sort',
					value: function sort(dataList, key) {
						if (dataList.length === 0) {
							return dataList;
						}
						var cols = dataList[0].columns;
						var index = this.find(key, cols);
						dataList[0].rows.sort(function (a, b) {
							return a[index] - b[index];
						});
						return dataList;
					}
				}, {
					key: 'find',
					value: function find(key, cols) {
						var index = 0;
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = cols.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var _step$value = _slicedToArray(_step.value, 2),
								    i = _step$value[0],
								    col = _step$value[1];

								if (col.text === key) {
									index = i;
									break;
								}
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator.return) {
									_iterator.return();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}

						return index;
					}
				}, {
					key: 'render',
					value: function render() {
						this.table = transformDataToTable(this.dataRaw, this.panel);
						// this.table.sort(this.panel.sort);
						this.renderer = new TableRenderer(this.panel, this.table, this.dashboard.isTimezoneUtc(), this.$sanitize, this.templateSrv, this.col);

						return _get(TableCtrl.prototype.__proto__ || Object.getPrototypeOf(TableCtrl.prototype), 'render', this).call(this, this.table);
					}
				}, {
					key: 'toggleColumnSort',
					value: function toggleColumnSort(col, colIndex) {
						// remove sort flag from current column
						if (this.table.columns[this.panel.sort.col]) {
							this.table.columns[this.panel.sort.col].sort = false;
						}

						if (this.panel.sort.col === colIndex) {
							if (this.panel.sort.desc) {
								this.panel.sort.desc = false;
							} else {
								this.panel.sort.col = null;
							}
						} else {
							this.panel.sort.col = colIndex;
							this.panel.sort.desc = true;
						}
						this.render();
					}
				}, {
					key: 'exportCsv',
					value: function exportCsv() {
						var scope = this.$scope.$new(true);
						scope.tableData = this.renderer.render_values();
						scope.panel = 'table';
						this.publishAppEvent('show-modal', {
							templateHtml: '<export-data-modal panel="panel" data="tableData"></export-data-modal>',
							scope: scope,
							modalClass: 'modal--narrow'
						});
					}
				}, {
					key: 'link',
					value: function link(scope, elem, attrs, ctrl) {
						var data = void 0;
						var panel = ctrl.panel;
						var pageCount = 0;
						_ctrl = ctrl;

						function getTableHeight() {
							var panelHeight = ctrl.height;

							if (pageCount > 1) {
								panelHeight -= 26;
							}

							return panelHeight - 31 + 'px';
						}

						function appendTableRows(tbodyElem) {
							ctrl.renderer.setTable(data);
							tbodyElem.empty();
							tbodyElem.html(ctrl.renderer.render(ctrl.pageIndex));
						}

						function switchPage(e) {
							var el = $(e.currentTarget);
							ctrl.pageIndex = parseInt(el.text(), 10) - 1;
							renderPanel();
						}

						function appendPaginationControls(footerElem) {
							footerElem.empty();

							var pageSize = panel.pageSize || 100;
							pageCount = Math.ceil(data.rows.length / pageSize);
							if (pageCount === 1) {
								return;
							}

							var startPage = Math.max(ctrl.pageIndex - 3, 0);
							var endPage = Math.min(pageCount, startPage + 9);

							var paginationList = $('<ul></ul>');

							for (var i = startPage; i < endPage; i++) {
								var activeClass = i === ctrl.pageIndex ? 'active' : '';
								var pageLinkElem = $('<li><a class="table-panel-page-link pointer ' + activeClass + '">' + (i + 1) + '</a></li>');
								paginationList.append(pageLinkElem);
							}

							footerElem.append(paginationList);
						}

						function renderPanel() {
							var panelElem = elem.parents('.panel-content');
							var rootElem = elem.find('.table-panel-scroll');
							var tbodyElem = elem.find('tbody');
							var footerElem = elem.find('.table-panel-footer');

							elem.css({ 'font-size': panel.fontSize });
							panelElem.addClass('table-panel-content');

							appendTableRows(tbodyElem);
							appendPaginationControls(footerElem);

							rootElem.css({ 'max-height': panel.scroll ? getTableHeight() : '' });

							// get current table column dimensions
							if (ctrl.table.columns) {
								ctrl.colDimensions = ctrl.table.columns.filter(function (x) {
									return !x.hidden;
								}).map(function (x) {
									return x.text;
								});
							}
						}

						// hook up link tooltips
						elem.tooltip({
							selector: '[data-link-tooltip]'
						});

						function addFilterClicked(e) {
							var filterData = $(e.currentTarget).data();
							var options = {
								datasource: panel.datasource,
								key: data.columns[filterData.column].text,
								value: data.rows[filterData.row][filterData.column],
								operator: filterData.operator
							};

							ctrl.variableSrv.setAdhocFilter(options);
						}

						elem.on('click', '.table-panel-page-link', switchPage);
						elem.on('click', '.table-panel-filter-link', addFilterClicked);

						var unbindDestroy = scope.$on('$destroy', function () {
							elem.off('click', '.table-panel-page-link');
							elem.off('click', '.table-panel-filter-link');
							unbindDestroy();
						});

						ctrl.events.on('render', function (renderData) {
							data = renderData || data;
							if (data) {
								renderPanel();
							}
							ctrl.renderingCompleted();
						});
					}
				}]);

				return TableCtrl;
			}(MetricsPanelCtrl));

			_export('TableCtrl', TableCtrl);

			TableCtrl.templateUrl = './partials/module.html';
		}
	};
});
//# sourceMappingURL=table_ctrl.js.map
