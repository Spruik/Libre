import * as utils from './utils';

/**
 * This function restructures the product object into a check object for better manipulations in camunda qa check
 * @param {Object} p Product Object
 * @return {Object} restructured product object
 */
const restructure = (p) => {
	p.ingredient.applicators.forEach((app) => {
		delete app.$$hashKey;
		app.materials.forEach((mat) => {
			delete mat.$$hashKey;
			delete mat.gramsTotal;
			delete mat.materialId;
			delete mat.oz;
			delete mat.seriseId;
			mat.formulaWt = mat.gramsOnScale;
			delete mat.gramsOnScale;
			mat.actualAvg = null;
			mat.actualDiff = null;
			mat.actualWt = null;
		});
	});

	const check = {
		productId: p.id,
		productDescription: p.product_desc,
		ingredient: {
			applicators: p.ingredient.applicators
		},
		meta: {
			isManual: false,
			checkCount: 1,
			isLastCheck: false,
			rangeMetrix: {}
		}
	};

	return check;
};

const post = (url, param, json) => {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url + param);
		xhr.onreadystatechange = handleResponse;
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onerror = (e) => reject(e);
		xhr.send(json);

		function handleResponse() {
			if (xhr.readyState === 4) {
				if (xhr.status < 300 && xhr.status >= 200) {
					resolve(xhr.responseText);
				} else {
					reject(xhr.responseText);
				}
			}
		}
	});
};

export const startQACheck = (product, line, orderId) => {
	const FORM_KEY = 'ProcessControlForm';
	const PATH = `process-definition/key/${FORM_KEY}/start`;

	// search for process to see if the process has already been exist
	const searchPath = 'process-instance';
	const query = {
		variables: [
			{
				name: '_orderId',
				operator: 'eq',
				value: orderId
			}
		]
	};

	post(utils.camundaRestApi, searchPath, JSON.stringify(query))
		.then((res) => {
			const searchResponse = JSON.parse(res);
			if (searchResponse.length > 0) {
				// exist
				utils.alert(
					'success',
					'Form already exist',
					`The Process Control Form for order <${orderId}> is already exist`
				);
			} else {
				// all good for creating a new form
				const p = restructure(product);
				const toSend = {
					variables: {
						_currentLine: { value: line, type: 'String' },
						_checkForLineLead: { value: JSON.stringify(p), type: 'json' },
						_checkForQA: { value: JSON.stringify(p), type: 'json' },
						_allChecksForQA: { value: '[]', type: 'json' },
						_allChecksForLineLead: { value: '[]', type: 'json' },
						_orderId: { value: orderId, type: 'String' },
						_productId: { value: product.id, type: 'String' },
						_productDesc: { value: product.product_desc, type: 'String' },
						_orderStartDateTime: { value: new Date().toISOString(), type: 'String' }
					},
					businessKey: null
				};
				utils.alert('success', 'Starting...', 'Creating Process Control Form, notification email sending...');

				post(utils.camundaRestApi, PATH, JSON.stringify(toSend))
					.then((res) => {
						utils.alert(
							'success',
							'Successful',
							`Process Control Form for order <${orderId}> has been created`
						);
					})
					.catch((e) => {
						utils.alert(
							'error',
							'Connection Error',
							`Camunda QA Check Process failed to start due to ${e} but you can still start it manually`
						);
					});
			}
		})
		.catch((e) => {
			utils.alert(
				'error',
				'Connection Error',
				`Camunda QA Check Process failed to start due to ${e} but you can still start it manually`
			);
		});
};

export const closeProcessControlForm = (orderId, callback, onfailed) => {
	const toSend = {
		messageName: 'processControlOrderEnded',
		correlationKeys: {
			_orderId: {
				value: orderId,
				type: 'String'
			}
		}
	};

	post(utils.camundaRestApi, 'message', JSON.stringify(toSend))
		.then((res) => {
			utils.alert('success', 'Successful', 'The Process Control Form for this order has been closed');
			callback();
		})
		.catch((e) => {
			utils.alert(
				'error',
				'Connection Error',
				`Camunda Process Control Form failed to complete due to ${e}, please try again`
			);
			onfailed();
		});
};
