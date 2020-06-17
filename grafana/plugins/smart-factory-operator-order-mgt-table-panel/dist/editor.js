'use strict';

System.register(['lodash', './transformers'], function (_export, _context) {
	"use strict";

	var _, transformers, _createClass, TablePanelEditorCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	/** @ngInject */
	function tablePanelEditor($q, uiSegmentSrv) {
		'use strict';

		return {
			restrict: 'E',
			scope: true,
			templateUrl: 'public/plugins/smart-factory-operator-order-mgt-table-panel/partials/editor.html',
			controller: TablePanelEditorCtrl
		};
	}

	_export('tablePanelEditor', tablePanelEditor);

	return {
		setters: [function (_lodash) {
			_ = _lodash.default;
		}, function (_transformers) {
			transformers = _transformers.transformers;
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

			_export('TablePanelEditorCtrl', TablePanelEditorCtrl = function () {
				/** @ngInject */
				function TablePanelEditorCtrl($scope, $q, uiSegmentSrv) {
					_classCallCheck(this, TablePanelEditorCtrl);

					$scope.editor = this;
					this.panelCtrl = $scope.ctrl;
					this.panel = this.panelCtrl.panel;
					this.transformers = transformers;
					this.fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%', '150%', '160%', '180%', '200%', '220%', '250%'];
					this.addColumnSegment = uiSegmentSrv.newPlusButton();
					this.updateTransformHints();
				}

				_createClass(TablePanelEditorCtrl, [{
					key: 'updateTransformHints',
					value: function updateTransformHints() {
						this.canSetColumns = false;
						this.columnsHelpMessage = '';

						switch (this.panel.transform) {
							case 'timeseries_aggregations':
								{
									this.canSetColumns = true;
									break;
								}
							case 'json':
								{
									this.canSetColumns = true;
									break;
								}
							case 'table':
								{
									this.columnsHelpMessage = 'Columns and their order are determined by the data query';
								}
						}
					}
				}, {
					key: 'getColumnOptions',
					value: function getColumnOptions() {
						var _this = this;

						if (!this.panelCtrl.dataRaw) {
							return this.$q.when([]);
						}
						var columns = this.transformers[this.panel.transform].getColumns(this.panelCtrl.dataRaw);
						var segments = _.map(columns, function (c) {
							return _this.uiSegmentSrv.newSegment({ value: c.text });
						});
						return this.$q.when(segments);
					}
				}, {
					key: 'addColumn',
					value: function addColumn() {
						var columns = transformers[this.panel.transform].getColumns(this.panelCtrl.dataRaw);
						var column = _.find(columns, { text: this.addColumnSegment.value });

						if (column) {
							this.panel.columns.push(column);
							this.render();
						}

						var plusButton = this.uiSegmentSrv.newPlusButton();
						this.addColumnSegment.html = plusButton.html;
						this.addColumnSegment.value = plusButton.value;
					}
				}, {
					key: 'transformChanged',
					value: function transformChanged() {
						this.panel.columns = [];
						if (this.panel.transform === 'timeseries_aggregations') {
							this.panel.columns.push({ text: 'Avg', value: 'avg' });
						}

						this.updateTransformHints();
						this.render();
					}
				}, {
					key: 'render',
					value: function render() {
						this.panelCtrl.render();
					}
				}, {
					key: 'removeColumn',
					value: function removeColumn(column) {
						this.panel.columns = _.without(this.panel.columns, column);
						this.panelCtrl.render();
					}
				}]);

				return TablePanelEditorCtrl;
			}());

			_export('TablePanelEditorCtrl', TablePanelEditorCtrl);
		}
	};
});
//# sourceMappingURL=editor.js.map
