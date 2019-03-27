import {Model} from 'mongoose';

export class Repository {

	protected model: Model<any>;

	constructor(model) {
		this.model = model;
	}

	getAll() {
		return this.model.find();
	}

	save(obj) {
		return this.model.create(obj);
	}

	getById(id) {
		return this.model.find({where:{_id: id}});
	}

	removeById(id) {
		return this.model.deleteOne({
			where: {
				_id: id
			}
		});
	}

	update(id, obj) {
		return this.model.updateOne({where: {
				_id: id
			}}, obj);
	}
}
