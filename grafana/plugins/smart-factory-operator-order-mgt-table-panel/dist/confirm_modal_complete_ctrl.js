'use strict';

System.register(['./utils', './postgres', './camunda'], function (_export, _context) {
	"use strict";

	var utils, postgres, camunda, _createClass, CompleteConfirmCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	return {
		setters: [function (_utils) {
			utils = _utils;
		}, function (_postgres) {
			postgres = _postgres;
		}, function (_camunda) {
			camunda = _camunda;
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

			_export('CompleteConfirmCtrl', CompleteConfirmCtrl = function () {
				/** @ngInject */
				function CompleteConfirmCtrl(_ref) {
					var data = _ref.data,
					    tableCtrl = _ref.tableCtrl,
					    url = _ref.url,
					    line = _ref.line,
					    showAlerts = _ref.showAlerts;

					_classCallCheck(this, CompleteConfirmCtrl);

					this.init(data, tableCtrl, url, line, showAlerts);
					this.prepare();
				}

				_createClass(CompleteConfirmCtrl, [{
					key: 'init',
					value: function init(data, tableCtrl, url, line, showAlerts) {
						this.data = data;
						this.tableCtrl = tableCtrl;
						this.url = url;
						this.line = line;
						this.showAlerts = showAlerts;
					}
				}, {
					key: 'prepare',
					value: function prepare() {
						this.showConfirmBtn = true;
						this.modalTitle = 'Confirm Required';
						this.confirmMsg = 'Are you sure you want to set this order to \'Complete\'? \n    Setting this to \'Complete\' will also CLOSE the Process Control Form related to this order';
					}
				}, {
					key: 'show',
					value: function show() {
						utils.showModal('confirm_form.html', this);
					}
				}, {
					key: 'closeProcessControlForm',
					value: function closeProcessControlForm(data) {
						var _this = this;

						postgres.getProductById(data.product_id, function (res) {
							if (res.length === 0) {
								utils.alert('error', 'Product Not Found', 'Camunda QA Check process initialisation failed because this Product CANNOT be found in the database, it may be because the product definition has been changed, but you can still start it Manually in Camunda BPM');
							} else {
								_this.closeForm();
								_this.showLoading();
								camunda.closeProcessControlForm(data.order_id, async function () {
									var result = await utils.sure(utils.post(_this.url, _this.line));
									_this.showAlerts(result, _this.data.order_id, 'Complete');
									_this.closeLoading();
									_this.tableCtrl.refresh();
								}, function () {
									_this.closeLoading();
								});
							}
						});
					}
				}, {
					key: 'showLoading',
					value: function showLoading() {
						this.modalTitle = 'Closing Process Control Form';
						this.confirmMsg = 'The process control form is now being closed, please wait ...';
						this.showConfirmBtn = false;
						utils.showModal('confirm_form.html', this);
					}
				}, {
					key: 'closeLoading',
					value: function closeLoading() {
						setTimeout(function () {
							document.querySelector('#op-mgt-confirm-modal-cancelBtn').click();
						}, 0);
					}
				}, {
					key: 'onConfirm',
					value: function onConfirm() {
						this.closeProcessControlForm(this.data);
					}
				}, {
					key: 'closeForm',
					value: function closeForm() {
						setTimeout(function () {
							document.querySelector('#op-mgt-confirm-modal-cancelBtn').click();
						}, 0);
					}
				}]);

				return CompleteConfirmCtrl;
			}());

			_export('CompleteConfirmCtrl', CompleteConfirmCtrl);
		}
	};
});
//# sourceMappingURL=confirm_modal_complete_ctrl.js.map
