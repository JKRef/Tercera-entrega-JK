import { UserService as userDao } from "../../repository/index.repository.js";
import { hashPassword, isValidPass } from '../../utils.js'

class UserValidator{
    async userLogin( email, password, req ){
        
        if( !email || !password ) {
            req.logger.warning('Email and password are required')
            throw new Error('Email and password are required')
        };

        const user = await userDao.findByEmail(email);

        if(!user) {
            req.logger.warning('User does not exist')
            throw new Error('User does not exist')
        };

        if(!isValidPass(user, password)) {
            req.logger.warning('Invalid password')
            throw new Error('Invalid password')
        };

        return user;
    }

    async registerUser(req){
        const {first_name, last_name, email, age, password} = req.body;
        req.logger.debug(`Got the following values, first_name: ${first_name}, last_name: ${last_name}, email: ${email}, age: ${age}`)

        if( !first_name || !last_name || !age || !email || !password ) {
            req.logger.warning('Missing required fields')
            throw new Error('Missing required fields')
        };

        // -- checks if there is an existing user with that email
        const user = await userDao.findByEmail(email);
        if(user) {
            req.logger.warning('Email is already in use')
            throw new Error('Email already in use')
        };

        const data = {
            first_name, 
            last_name, 
            age, 
            email, 
            password: hashPassword(password)
        };

        const newUser = await userDao.createUser(data)
        return newUser;
    }

    async changeRole(req){
        const id = req.params.uid;
        let edit;

        if( !id ) {
            req.logger.warning('User ID is required')
            throw new Error('User ID is required')
        };

        let user = await userDao.findById(id);
        if(!user) {
            req.logger.warning('User does not exist')
            throw new Error('User does not exist')
        };

        req.logger.debug(`The users current role is ${user.role}`)

        if(user.role == 'user'){
            edit = userDao.editUser(id, {role: 'premium'})
            req.logger.info(`User ${id} role was changed to premium`)
        }else if(user.role =='premium'){
            edit = userDao.editUser(id, {role: 'user'})
            req.logger.info(`User ${id} role was changed to user`)
        }
    
        return edit;
    }
}

export default new UserValidator();