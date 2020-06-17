import * as utils from './utils';

export const getProductById = (id, success) => {
	const url = `${utils.postgRestHost}product?id=eq.${id}`;
	utils
		.get(url)
		.then((res) => {
			success(res);
		})
		.catch((e) => {
			utils.alert(
				'error',
				'Connection Error',
				`Camunda QA Check Process failed to start due to ${e} but you can still start it manually`
			);
		});
};

export const getOrderStates = async () => {
	const url = `${utils.postgRestHost}order_state`;
	return await utils.sure(utils.get(url));
};
