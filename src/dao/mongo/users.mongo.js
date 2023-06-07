import { userModel } from "./models/user.model.js";

class UserDao{
    create({first_name, last_name, email, age, password}){
        return userModel.create({first_name: first_name, last_name: last_name, email: email, age: age, password: password});
    }

    find(email){
        return userModel.findOne({email});
    }

    findById(id){
        return userModel.findById(id);
    }

    update(id, data){
        return userModel.findByIdAndUpdate(id, data, {new: true});
    }
}

export default new UserDao();