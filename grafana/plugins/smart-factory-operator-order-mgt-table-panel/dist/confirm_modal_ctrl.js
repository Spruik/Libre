'use strict';

System.register(['./utils', './constants'], function (_export, _context) {
	"use strict";

	var utils, cons, _createClass, ConfirmCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	return {
		setters: [function (_utils) {
			utils = _utils;
		}, function (_constants) {
			cons = _constants;
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

			_export('ConfirmCtrl', ConfirmCtrl = function () {
				/** @ngInject */
				function ConfirmCtrl(data) {
					_classCallCheck(this, ConfirmCtrl);

					this.init(data);
					this.prepare();
				}

				_createClass(ConfirmCtrl, [{
					key: 'init',
					value: function init(data) {
						this.conflict = data.conflict;
						this.current = data.data;
						this.conflict.influxLine = data.conflictLine;
						this.current.influxLine = data.line;
						this.url = data.url;
						this.tableCtrl = data.tableCtrl;
						this.current.toState = data.toState;
						this.conflict.toState = data.conflictToState;
						this.sendCamunda = data.sendCamundaQACheck;
					}
				}, {
					key: 'prepare',
					value: function prepare() {
						this.confirmMsg = 'To set order <' + this.current.order_id + '> to <' + this.current.toState + '>, the order <' + this.conflict.order_id + '> will be set to <' + this.conflict.toState + '>. Are you sure you want to make the change?';
						this.showConfirmBtn = true;
					}
				}, {
					key: 'show',
					value: function show() {
						utils.showModal('confirm_form.html', this);
					}
				}, {
					key: 'onConfirm',
					value: async function onConfirm() {
						var result = await utils.sure(utils.post(this.url, this.current.influxLine));
						var result1 = await utils.sure(utils.post(this.url, this.conflict.influxLine));
						if (result.ok && result1.ok) {
							utils.alert('success', 'Success', 'Order ' + this.current.order_id + ' has been marked as ' + this.current.toState);
							this.closeForm();
							this.tableCtrl.refresh();
							if (this.current.toState === cons.STATE_START) {
								this.sendCamunda(this.current);
							}
						} else {
							alert('error', 'Error', 'An error occurred while updating the database due to ' + (result.error || result1.error) + ', please try again or contact the dev team');
							this.closeForm();
							this.tableCtrl.refresh();
						}
					}
				}, {
					key: 'closeForm',
					value: function closeForm() {
						setTimeout(function () {
							document.querySelector('#op-mgt-confirm-modal-cancelBtn').click();
						}, 0);
					}
				}]);

				return ConfirmCtrl;
			}());

			_export('ConfirmCtrl', ConfirmCtrl);
		}
	};
});
//# sourceMappingURL=confirm_modal_ctrl.js.map
