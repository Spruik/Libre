import * as utils from './utils';
import * as cons from './constants';

export class ConfirmCtrl {
	/** @ngInject */
	constructor(data) {
		this.init(data);
		this.prepare();
	}

	init(data) {
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

	prepare() {
		this.confirmMsg = `To set order <${this.current.order_id}> to <${this.current.toState}>, the order <${this
			.conflict.order_id}> will be set to <${this.conflict.toState}>. Are you sure you want to make the change?`;
		this.showConfirmBtn = true;
	}

	show() {
		utils.showModal('confirm_form.html', this);
	}

	async onConfirm() {
		const result = await utils.sure(utils.post(this.url, this.current.influxLine));
		const result1 = await utils.sure(utils.post(this.url, this.conflict.influxLine));
		if (result.ok && result1.ok) {
			utils.alert(
				'success',
				'Success',
				`Order ${this.current.order_id} has been marked as ${this.current.toState}`
			);
			this.closeForm();
			this.tableCtrl.refresh();
			if (this.current.toState === cons.STATE_START) {
				this.sendCamunda(this.current);
			}
		} else {
			alert(
				'error',
				'Error',
				`An error occurred while updating the database due to ${result.error ||
					result1.error}, please try again or contact the dev team`
			);
			this.closeForm();
			this.tableCtrl.refresh();
		}
	}

	closeForm() {
		setTimeout(() => {
			document.querySelector('#op-mgt-confirm-modal-cancelBtn').click();
		}, 0);
	}
}
