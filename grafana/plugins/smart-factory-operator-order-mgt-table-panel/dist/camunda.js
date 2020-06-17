'use strict';

System.register(['./utils'], function (_export, _context) {
	"use strict";

	var utils, restructure, post, startQACheck, closeProcessControlForm;
	return {
		setters: [function (_utils) {
			utils = _utils;
		}],
		execute: function () {
			restructure = function restructure(p) {
				p.ingredient.applicators.forEach(function (app) {
					delete app.$$hashKey;
					app.materials.forEach(function (mat) {
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

				var check = {
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

			post = function post(url, param, json) {
				return new Promise(function (resolve, reject) {
					var xhr = new XMLHttpRequest();
					xhr.open('POST', url + param);
					xhr.onreadystatechange = handleResponse;
					xhr.setRequestHeader('Content-Type', 'application/json');
					xhr.onerror = function (e) {
						return reject(e);
					};
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

			_export('startQACheck', startQACheck = function startQACheck(product, line, orderId) {
				var FORM_KEY = 'ProcessControlForm';
				var PATH = 'process-definition/key/' + FORM_KEY + '/start';

				// search for process to see if the process has already been exist
				var searchPath = 'process-instance';
				var query = {
					variables: [{
						name: '_orderId',
						operator: 'eq',
						value: orderId
					}]
				};

				post(utils.camundaRestApi, searchPath, JSON.stringify(query)).then(function (res) {
					var searchResponse = JSON.parse(res);
					if (searchResponse.length > 0) {
						// exist
						utils.alert('success', 'Form already exist', 'The Process Control Form for order <' + orderId + '> is already exist');
					} else {
						// all good for creating a new form
						var p = restructure(product);
						var toSend = {
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

						post(utils.camundaRestApi, PATH, JSON.stringify(toSend)).then(function (res) {
							utils.alert('success', 'Successful', 'Process Control Form for order <' + orderId + '> has been created');
						}).catch(function (e) {
							utils.alert('error', 'Connection Error', 'Camunda QA Check Process failed to start due to ' + e + ' but you can still start it manually');
						});
					}
				}).catch(function (e) {
					utils.alert('error', 'Connection Error', 'Camunda QA Check Process failed to start due to ' + e + ' but you can still start it manually');
				});
			});

			_export('startQACheck', startQACheck);

			_export('closeProcessControlForm', closeProcessControlForm = function closeProcessControlForm(orderId, callback, onfailed) {
				var toSend = {
					messageName: 'processControlOrderEnded',
					correlationKeys: {
						_orderId: {
							value: orderId,
							type: 'String'
						}
					}
				};

				post(utils.camundaRestApi, 'message', JSON.stringify(toSend)).then(function (res) {
					utils.alert('success', 'Successful', 'The Process Control Form for this order has been closed');
					callback();
				}).catch(function (e) {
					utils.alert('error', 'Connection Error', 'Camunda Process Control Form failed to complete due to ' + e + ', please try again');
					onfailed();
				});
			});

			_export('closeProcessControlForm', closeProcessControlForm);
		}
	};
});
//# sourceMappingURL=camunda.js.map
