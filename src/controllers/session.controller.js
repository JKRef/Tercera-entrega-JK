import UserValidator from "../dao/validators/user.validator.js";
import PasswordRecoveryValidator from "../dao/validators/pwdRecovery.validator.js";
import { admin } from '../utils.js';
import UserDTO from '../dao/dto/user.dto.js';
import jwt from 'jsonwebtoken';

class SessionController{
    async login(req, res){
        try{
            const { email, password } = req.body;
            let user = {};
            
            if(email == admin.user && password == admin.password){
                req.logger.debug('User is admin')    
                user = {...admin}
            }else{
                user = await UserValidator.userLogin(email, password, req);  
            }          

            const token = jwt.sign({email, first_name: user.first_name, last_name: user.last_name, role: user.role }, 'pageSecret', { expiresIn: '10m' });
            res.status(200).cookie('secretToken', token, {maxAge: 50000, httpOnly: true})
            
            req.logger.info('Login successful') 
            req.logger.debug('Redirecting to /products')
            res.redirect('/products');
        }catch(err){
            return res.status(400).json({error: err.message});
        }
    } 

    async register(req, res){
        try{
            const user = await UserValidator.registerUser(req);

            req.logger.info('User registration successful')
            req.logger.debug('Redirecting to /login')
            return res.status(201).redirect('/login');
        }catch(err){
            res.status(400).json({error: err.message})
        }
    }

    async changeRole(req, res){
        try{
            const user = await UserValidator.changeRole(req);

            return res.status(201).send(`User ${req.params.uid} role was changed to ${user.role}`)
        }catch(err){
            res.status(400).json({error: err.message})
        }
    }

    async current(req, res){
        const user = new UserDTO(req.user)
        req.logger.debug('Obtained current user information')
        res.send(user);
    }

    async handleLogout(req, res){
        req.logger.debug('Logging out! Redirecting to login page.')
        res.clearCookie('secretToken');
        res.redirect('/login');
    }

    async passwordRecoveryRequest(req, res){
        try{
            const request = await PasswordRecoveryValidator.generateLink(req);
            return res.status(201).send(request)
        }catch(err){
            res.status(400).json({error: err.message})
        }
    }

    async validateNewPassword(req, res){
        try{
            const request = await PasswordRecoveryValidator.validatePassword(req);
            return res.status(201).send(request)
        }catch(err){
            res.status(400).json({error: err.message})
        }
    }
}

export default new SessionController();