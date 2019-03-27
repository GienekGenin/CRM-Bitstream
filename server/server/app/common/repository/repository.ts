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

    findById(id) {
        return this.model.findOne({_id: id});
    }

    removeById(id) {
        return this.model.deleteOne({
            _id: id
        });
    }

    update(id, obj) {
        return this.model.updateOne({
            _id: id
        }, obj);
    }
}
