import { appEvents } from 'app/core/core';

const hostname = window.location.hostname;
const http = 'http://';
export const postgRestHost = http + hostname + ':5436/';
export const influxHost = http + hostname + ':8086/';

let tasklistHostName = hostname;
if (tasklistHostName === 'localhost') {
	tasklistHostName = '127.0.0.1';
}
export const camundaHost = http + tasklistHostName + ':8080/camunda/app/tasklist';
export const camundaRestApi = http + hostname + ':8080/engine-rest/';

export const post = (url, line) => {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.onreadystatechange = handleResponse;
		xhr.onerror = (e) => reject(e);
		xhr.send(line);

		function handleResponse() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					// console.log('200');
					var res = JSON.parse(xhr.responseText);
					resolve(res);
				} else if (xhr.status === 204) {
					// console.log('204');
					res = xhr.responseText;
					resolve(res);
				} else {
					reject(this.statusText);
				}
			}
		}
	});
};

export const get = (url) => {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onreadystatechange = handleResponse;
		xhr.onerror = (e) => reject(e);
		xhr.send();

		function handleResponse() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var res = JSON.parse(xhr.responseText);
					resolve(res);
				} else {
					reject(this.statusText);
				}
			}
		}
	});
};

export const alert = (type, title, msg) => {
	appEvents.emit(`alert-${type}`, [ title, msg ]);
};

export const showModal = (html, data, mClass) => {
	appEvents.emit('show-modal', {
		src: 'public/plugins/smart-factory-operator-order-mgt-table-panel/partials/' + html,
		modalClass: mClass || 'confirm-modal',
		model: data
	});
};

export const sure = (promise) =>
	promise.then((data) => ({ ok: true, data })).catch((error) => Promise.resolve({ ok: false, error }));
