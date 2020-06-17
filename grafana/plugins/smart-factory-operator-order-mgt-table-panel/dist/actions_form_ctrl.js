'use strict';

System.register(['app/core/core', './utils', './table_ctrl', './confirm_modal_ctrl', './confirm_modal_complete_ctrl', './postgres', './camunda', './constants', 'moment'], function (_export, _context) {
	"use strict";

	var appEvents, get, influxHost, post, alert, tableCtrl, ConfirmCtrl, CompleteConfirmCtrl, postgres, camunda, utils, cons, moment, rowData, runningRecord, orderStates, allRecords, closeForm;


	function showActionForm(productionLine, orderId, description, productId) {
		var tags = {
			productionLine: productionLine,
			orderId: orderId,
			description: description,
			productId: productId
		};

		getRowData(callback, tags);

		async function callback() {
			var result = await postgres.getOrderStates();
			if (result.ok) {
				orderStates = result.data;
			} else {
				utils.alert('error', 'Connection Error', 'Cannot get Order States from Postgres database due to ' + result.error + ', please try again or contact the dev team');
				return;
			}
			if (rowData.order_state) {
				if (rowData.order_state.toLowerCase() === cons.STATE_PLAN.toLowerCase()) {
					alert('warning', 'Warning', 'This order has NOT been released');
					return;
				}
				if (rowData.order_state.toLowerCase() === cons.STATE_CLOSE.toLowerCase()) {
					alert('warning', 'Warning', 'This order has been closed');
					return;
				}
			}

			appEvents.emit('show-modal', {
				src: 'public/plugins/smart-factory-operator-order-mgt-table-panel/partials/actions_form.html',
				modalClass: 'confirm-modal',
				model: { orderId: tags.orderId }
			});

			removeListeners();
			addListeners();
		}
	}

	/**
  * Get the record data with the tag values passed in
  * Call the callback function once it is finished
  * Stop and prompt error when it fails
  * @param {*} callback 
  * @param {*} tags 
  */
	function getRowData(callback, tags) {
		var url = getInfluxLine(tags);
		get(url).then(function (res) {
			var result = formatData(res, tags);
			rowData = result;
			callback();
		}).catch(function (e) {
			alert('error', 'Database Error', 'Database connection failed with influxdb');
			console.log(e);
		});
	}

	/**
  * Write line for the influxdb query
  * @param {*} tags 
  */
	function getInfluxLine(tags) {
		var url = influxHost + 'query?pretty=true&db=smart_factory&q=select last(*) from OrderPerformance' + ' where ';
		url += 'production_line=' + "'" + tags.productionLine + "'" + ' group by ' + '"product_id", "order_id"';

		// console.log(url)

		return url;
	}

	/**
  * The params may contain more than one row record
  * This is to fomrat the http response into a better structure
  * And also filter out the latest record
  * @param {*} res 
  */
	function formatData(res, tags) {
		var records = [];

		var series = res.results[0].series;

		var cols = series[0].columns;
		cols = cols.map(function (x) {
			return x.substring(5, x.length);
		});
		cols[0] = 'time';
		var rows = [];
		var resultTags = [];
		for (var i = 0; i < series.length; i++) {
			rows.push(series[i].values[0]);
			resultTags.push(series[i].tags);
		}

		for (var _i = 0; _i < rows.length; _i++) {
			var row = rows[_i];
			var obj = {};
			for (var k = 0; k < cols.length; k++) {
				var col = cols[k];
				obj[col] = row[k];
			}
			obj = Object.assign(obj, resultTags[_i]);
			records.push(obj);
		}

		allRecords = records;
		var currents = records.filter(function (record) {
			return record.order_id === tags.orderId && record.product_id === tags.productId && record.product_desc === tags.description;
		});
		var current = currents[currents.length - 1];

		return current;
	}

	function isStateCheckOK(rowData, to) {
		var conflict = null;
		var from = rowData.order_state;
		var fromStates = orderStates.filter(function (x) {
			return x.state === from.toLowerCase();
		});
		var toStates = orderStates.filter(function (x) {
			return x.state === to.toLowerCase();
		});

		if (fromStates.length === 0) {
			utils.alert('warning', 'Warning', 'State ' + from + ' not found from the config table in postgresdb, please finish order state configuration first');
			return false;
		} else if (toStates.length === 0) {
			utils.alert('warning', 'Warning', 'State ' + to + ' not found from the config table in postgresdb, please finish order state configuration first');
			return false;
		}

		var toState = toStates[0];
		var fromState = fromStates[0];
		var options = fromState.state_options;
		var index = options.indexOf(to.toLowerCase());
		if (!~index) {
			utils.alert('warning', 'Warning', 'You can not change state from <' + from.toLowerCase() + '> to <' + to + '>');
			return false;
		}

		if (toState.is_unique) {
			var conflicts = allRecords.filter(function (x) {
				return x.order_state.toLowerCase() === toState.state.toLowerCase();
			});
			if (conflicts.length !== 0) {
				conflict = conflicts[0];
				conflict.toState = toState.backup_state;
			}
		}

		return [true, conflict];
	}

	/**
  * Add listener for the action selection
  * If edit clicked, go to the edit form with the current record data
  * If realease clicked, change record status to 'Ready'
  * If delete clicked, change record status to 'Deleted'
  */
	function addListeners() {
		$(document).on('click', 'input[type="button"][name="order-mgt-operator-actions-radio"]', function (e) {
			if (e.target.id === 'flag') {
				prepareUpdate(cons.STATE_FLAG, 0);
			} else if (e.target.id === 'start') {
				prepareUpdate(cons.STATE_START, rowData.planned_rate);
			} else if (e.target.id === 'pause') {
				prepareUpdate(cons.STATE_PAUSE, 0);
			} else if (e.target.id === 'complete') {
				prepareUpdate(cons.STATE_COMPLETE, 0);
			} else if (e.target.id === 'close') {
				prepareUpdate(cons.STATE_CLOSE, 0);
			}
		});
	}

	function prepareUpdate(state, rate) {
		var result = isStateCheckOK(rowData, state);
		var ok = result[0];
		var conflict = result[1];
		if (ok) {
			updateRecord(rowData, conflict, state, rate);
		}
	}

	function removeListeners() {
		$(document).off('click', 'input[type="button"][name="order-mgt-operator-actions-radio"]');
	}

	async function updateRecord(data, conflict, toState, rate) {
		var fromState = data.order_state.toLowerCase();
		var line = writeInfluxLine(data, toState, rate);
		var url = influxHost + 'write?db=smart_factory';

		if (conflict) {
			var conflictLine = writeInfluxLine(conflict, conflict.toState || fromState, 0);
			var conflictToState = conflict.toState || fromState;
			var confirm = new ConfirmCtrl({
				tableCtrl: tableCtrl,
				data: data,
				conflict: conflict,
				conflictToState: conflictToState,
				toState: toState,
				line: line,
				conflictLine: conflictLine,
				url: url,
				sendCamundaQACheck: sendCamundaQACheck
			});
			confirm.show();
		} else {
			// no conflict
			if (toState.toLowerCase() === cons.STATE_COMPLETE.toLowerCase()) {
				// if is to complete
				var completeConfirm = new CompleteConfirmCtrl({
					tableCtrl: tableCtrl,
					data: data,
					url: url,
					line: line,
					showAlerts: showAlerts
				});
				completeConfirm.show();
			} else {
				var result = await utils.sure(utils.post(url, line));
				showAlerts(result, data.order_id, toState);
				if (toState.toLowerCase() === cons.STATE_START.toLowerCase()) {
					sendCamundaQACheck(data);
				}
			}
		}
	}

	function sendCamundaQACheck(data) {
		postgres.getProductById(data.product_id, function (res) {
			if (res.length === 0) {
				utils.alert('error', 'Product Not Found', 'Camunda QA Check process initialisation failed because this Product CANNOT be found in the database, it may be because the product definition has been changed, but you can still start it Manually in Camunda BPM');
			} else {
				camunda.startQACheck(res[0], data.production_line, data.order_id);
			}
		});
	}

	function showAlerts(result, id, state) {
		if (result.ok) {
			alert('success', 'Success', 'Order ' + id + ' has been marked as ' + state);
			closeForm();
			tableCtrl.refresh();
		} else {
			alert('error', 'Error', 'An error occurred while updating the database due to ' + result.error + ', please try again or contact the dev team');
			closeForm();
			console.log(result.error);
		}
	}

	/**
  * Expect the status string (Normally are: 'Ready' or 'Deleted')
  * Then changed the status in the line with anything else unchanged
  * @param {*} status 
  */
	function writeInfluxLine(data, status, rate) {
		//For influxdb tag keys, must add a forward slash \ before each space
		// let product_desc = data.product_desc.split(' ').join('\\ ')

		var line = 'OrderPerformance,order_id=' + data.order_id + ',product_id=' + data.product_id + ' ';

		if (data.compl_qty !== null && data.compl_qty !== undefined) {
			line += 'compl_qty=' + data.compl_qty + ',';
		}
		if (data.machine_state !== null && data.machine_state !== undefined) {
			line += 'machine_state="' + getRid(data.machine_state) + '"' + ',';
		}
		if (data.scrap_qty !== null && data.scrap_qty !== undefined) {
			line += 'scrap_qty=' + data.scrap_qty + ',';
		}
		if (data.actual_start_datetime !== null && data.actual_start_datetime !== undefined) {
			line += 'actual_start_datetime=' + data.actual_start_datetime + ',';
		}
		if (data.actual_end_datetime !== null && data.actual_end_datetime !== undefined) {
			line += 'actual_end_datetime=' + data.actual_end_datetime + ',';
		}

		if (status === cons.STATE_START && (data.actual_start_datetime === null || data.actual_start_datetime === undefined)) {
			//set actual start time = now if there is no actual
			//but do nothing if there is acutal start time, meaning that it was paused and start again
			line += 'actual_start_datetime=' + moment.now() + ',';
		} else if (status === cons.STATE_COMPLETE) {
			//set actual end time = now
			line += 'actual_end_datetime=' + moment.now() + ',';
		}

		line += 'order_state="' + getRid(status) + '"' + ',';
		line += 'product_desc="' + getRid(data.product_desc) + '"' + ',';
		line += 'order_date="' + data.order_date + '"' + ',';
		line += 'production_line="' + getRid(data.production_line) + '"' + ',';
		line += 'order_qty=' + data.order_qty + ',';
		line += 'scheduled_end_datetime=' + data.scheduled_end_datetime + ',';
		line += 'scheduled_start_datetime=' + data.scheduled_start_datetime + ',';
		line += 'planned_changeover_time="' + data.planned_changeover_time + '"' + ',';
		line += 'setpoint_rate=' + rate + ',';
		line += 'planned_rate=' + data.planned_rate;

		// console.log(line);
		return line;
	}

	function getRid(x) {
		return x.split('"').join('\\"');
	}

	return {
		setters: [function (_appCoreCore) {
			appEvents = _appCoreCore.appEvents;
		}, function (_utils) {
			get = _utils.get;
			influxHost = _utils.influxHost;
			post = _utils.post;
			alert = _utils.alert;
			utils = _utils;
		}, function (_table_ctrl) {
			tableCtrl = _table_ctrl;
		}, function (_confirm_modal_ctrl) {
			ConfirmCtrl = _confirm_modal_ctrl.ConfirmCtrl;
		}, function (_confirm_modal_complete_ctrl) {
			CompleteConfirmCtrl = _confirm_modal_complete_ctrl.CompleteConfirmCtrl;
		}, function (_postgres) {
			postgres = _postgres;
		}, function (_camunda) {
			camunda = _camunda;
		}, function (_constants) {
			cons = _constants;
		}, function (_moment) {
			moment = _moment.default;
		}],
		execute: function () {
			rowData = void 0;
			runningRecord = {};
			orderStates = {};
			allRecords = [];

			closeForm = function closeForm() {
				$('#order-mgt-operator-action-form-dismiss-btn').trigger('click');
			};

			_export('showActionForm', showActionForm);
		}
	};
});
//# sourceMappingURL=actions_form_ctrl.js.map
