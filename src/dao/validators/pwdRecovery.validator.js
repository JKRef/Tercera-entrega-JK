import { PasswordRecoveryService, PasswordRecoveryService as PwdRecoveryDao, UserService, UserService as userDao } from "../../repository/index.repository.js";
import { hashPassword, isValidPass } from '../../utils.js'
import { passwordRecoveryEmail } from "../../config/mailing.config.js";

class PasswordRecoveryValidator{
    async generateLink(req){
        const email = req.body.email;
        req.logger.debug(`Got the following email ${email}`)
        if(!email) {
            req.logger.warning('Email is required')
            throw new Error('Email is required')
        };

        req.logger.debug(`Checking if the user exists`)
        const user = await UserService.findByEmail(email);
        if(!user){
            req.logger.warning('User does not exist')
            throw new Error('User does not exist')
        }

        req.logger.debug(`User exists, generating link`)
        const request = await PasswordRecoveryService.createLink({user: email});
        req.logger.debug(`Created a password recovery link`)

        const sendEmail = passwordRecoveryEmail(email, request.id)
        req.logger.debug(`Sent an email to ${email}`)

        return {message: 'Email sent!'}
    }

    async linkValidation(req){
        const id = req.params.id;
        req.logger.debug(`The request link is ${id}`)

        const request = await PwdRecoveryDao.findPasswordRequest(id);

        return request;
    }

    async validatePassword(req){
        const { email, password } = req.body;
        req.logger.debug(`Got the following email ${email}`)

        const user = await UserService.findByEmail(email);

        req.logger.debug(`Checking if the new password the user used is their current password`)
        if(isValidPass(user, password)) {
            req.logger.warning('You cannot use your current password!')
            throw new Error('Password is already in use by the user')
        };

        req.logger.debug(`Updating their password`)
        const update = await UserService.editUser(user.id, {password: hashPassword(password)})

        return {message: 'Password change successful!'}
    }
}

export default new PasswordRecoveryValidator();