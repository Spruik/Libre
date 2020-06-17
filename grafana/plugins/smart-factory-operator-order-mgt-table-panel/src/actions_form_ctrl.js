import { appEvents } from 'app/core/core';
import { get, influxHost, post, alert } from './utils';
import * as tableCtrl from './table_ctrl';
import { ConfirmCtrl } from './confirm_modal_ctrl';
import { CompleteConfirmCtrl } from './confirm_modal_complete_ctrl';
import * as postgres from './postgres';
import * as camunda from './camunda';
import * as utils from './utils';
import * as cons from './constants';
import moment from 'moment';

let rowData;
let runningRecord = {};
let orderStates = {};
let allRecords = [];

const closeForm = () => {
	$('#order-mgt-operator-action-form-dismiss-btn').trigger('click');
};

function showActionForm(productionLine, orderId, description, productId) {
	const tags = {
		productionLine: productionLine,
		orderId: orderId,
		description: description,
		productId: productId
	};

	getRowData(callback, tags);

	async function callback() {
		const result = await postgres.getOrderStates();
		if (result.ok) {
			orderStates = result.data;
		} else {
			utils.alert(
				'error',
				'Connection Error',
				`Cannot get Order States from Postgres database due to ${result.error}, please try again or contact the dev team`
			);
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
	const url = getInfluxLine(tags);
	get(url)
		.then((res) => {
			const result = formatData(res, tags);
			rowData = result;
			callback();
		})
		.catch((e) => {
			alert('error', 'Database Error', 'Database connection failed with influxdb');
			console.log(e);
		});
}

/**
 * Write line for the influxdb query
 * @param {*} tags 
 */
function getInfluxLine(tags) {
	let url = influxHost + 'query?pretty=true&db=smart_factory&q=select last(*) from OrderPerformance' + ' where ';
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
	let records = [];

	const series = res.results[0].series;

	let cols = series[0].columns;
	cols = cols.map((x) => x.substring(5, x.length));
	cols[0] = 'time';
	let rows = [];
	let resultTags = [];
	for (let i = 0; i < series.length; i++) {
		rows.push(series[i].values[0]);
		resultTags.push(series[i].tags);
	}

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		let obj = {};
		for (let k = 0; k < cols.length; k++) {
			const col = cols[k];
			obj[col] = row[k];
		}
		obj = Object.assign(obj, resultTags[i]);
		records.push(obj);
	}

	allRecords = records;
	const currents = records.filter(
		(record) =>
			record.order_id === tags.orderId &&
			record.product_id === tags.productId &&
			record.product_desc === tags.description
	);
	const current = currents[currents.length - 1];

	return current;
}

function isStateCheckOK(rowData, to) {
	let conflict = null;
	const from = rowData.order_state;
	const fromStates = orderStates.filter((x) => x.state === from.toLowerCase());
	const toStates = orderStates.filter((x) => x.state === to.toLowerCase());

	if (fromStates.length === 0) {
		utils.alert(
			'warning',
			'Warning',
			`State ${from} not found from the config table in postgresdb, please finish order state configuration first`
		);
		return false;
	} else if (toStates.length === 0) {
		utils.alert(
			'warning',
			'Warning',
			`State ${to} not found from the config table in postgresdb, please finish order state configuration first`
		);
		return false;
	}

	const toState = toStates[0];
	const fromState = fromStates[0];
	const options = fromState.state_options;
	const index = options.indexOf(to.toLowerCase());
	if (!~index) {
		utils.alert('warning', 'Warning', `You can not change state from <${from.toLowerCase()}> to <${to}>`);
		return false;
	}

	if (toState.is_unique) {
		const conflicts = allRecords.filter((x) => x.order_state.toLowerCase() === toState.state.toLowerCase());
		if (conflicts.length !== 0) {
			conflict = conflicts[0];
			conflict.toState = toState.backup_state;
		}
	}

	return [ true, conflict ];
}

/**
 * Add listener for the action selection
 * If edit clicked, go to the edit form with the current record data
 * If realease clicked, change record status to 'Ready'
 * If delete clicked, change record status to 'Deleted'
 */
function addListeners() {
	$(document).on('click', 'input[type="button"][name="order-mgt-operator-actions-radio"]', (e) => {
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
	const result = isStateCheckOK(rowData, state);
	const ok = result[0];
	const conflict = result[1];
	if (ok) {
		updateRecord(rowData, conflict, state, rate);
	}
}

function removeListeners() {
	$(document).off('click', 'input[type="button"][name="order-mgt-operator-actions-radio"]');
}

async function updateRecord(data, conflict, toState, rate) {
	const fromState = data.order_state.toLowerCase();
	const line = writeInfluxLine(data, toState, rate);
	const url = influxHost + 'write?db=smart_factory';

	if (conflict) {
		const conflictLine = writeInfluxLine(conflict, conflict.toState || fromState, 0);
		const conflictToState = conflict.toState || fromState;
		const confirm = new ConfirmCtrl({
			tableCtrl,
			data,
			conflict,
			conflictToState,
			toState,
			line,
			conflictLine,
			url,
			sendCamundaQACheck
		});
		confirm.show();
	} else {
		// no conflict
		if (toState.toLowerCase() === cons.STATE_COMPLETE.toLowerCase()) {
			// if is to complete
			const completeConfirm = new CompleteConfirmCtrl({
				tableCtrl,
				data,
				url,
				line,
				showAlerts
			});
			completeConfirm.show();
		} else {
			const result = await utils.sure(utils.post(url, line));
			showAlerts(result, data.order_id, toState);
			if (toState.toLowerCase() === cons.STATE_START.toLowerCase()) {
				sendCamundaQACheck(data);
			}
		}
	}
}

function sendCamundaQACheck(data) {
	postgres.getProductById(data.product_id, (res) => {
		if (res.length === 0) {
			utils.alert(
				'error',
				'Product Not Found',
				'Camunda QA Check process initialisation failed because this Product CANNOT be found in the database, it may be because the product definition has been changed, but you can still start it Manually in Camunda BPM'
			);
		} else {
			camunda.startQACheck(res[0], data.production_line, data.order_id);
		}
	});
}

function showAlerts(result, id, state) {
	if (result.ok) {
		alert('success', 'Success', `Order ${id} has been marked as ${state}`);
		closeForm();
		tableCtrl.refresh();
	} else {
		alert(
			'error',
			'Error',
			`An error occurred while updating the database due to ${result.error}, please try again or contact the dev team`
		);
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

	let line = 'OrderPerformance,order_id=' + data.order_id + ',product_id=' + data.product_id + ' ';

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

	if (
		status === cons.STATE_START &&
		(data.actual_start_datetime === null || data.actual_start_datetime === undefined)
	) {
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

export { showActionForm };
