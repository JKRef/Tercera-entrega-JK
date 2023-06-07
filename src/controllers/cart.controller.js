import CartValidator from "../dao/validators/cart.validator.js";

class CartController{
    async createCart(req, res){
        try{
            const cart = await CartValidator.createCart();
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    }

    async getCartById(req, res){
        try{
            const cart = await CartValidator.getCartByID(req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    }

    async addProductToCart(req, res){
        try{
            const cart = await CartValidator.addProductToCart(req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    }

    async addProductQuantityToCart(req, res){
        try{
            const { id, pid } = req.params;
            const quantity = req.body.quantity;

            const cart = await CartValidator.addQuantity(id, pid, quantity, req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    }

    async deleteProductFromCart(req, res){
        try{
            const cart = await CartValidator.deleteProductFromCart(req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }
    }

    async deleteAllProductsFromCart(req, res){
        try{
            const cart = await CartValidator.deleteAllProductsFromCart(req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }        
    }

    async completePurchase(req, res){
        try{
            const cart = await CartValidator.completePurchase(req);
            res.status(200).json(cart);
        } catch (err) {
            res.status(500).json({error: err.message})
        }        
    }
}

export default new CartController();