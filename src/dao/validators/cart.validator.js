import { Carts as cartsDao } from "../factory.js";
import ProductValidator from "./product.validator.js";
import TicketValidator from "./ticket.validator.js";

class CartValidator{
    async createCart(){
        const cart = await cartsDao.create();
        return cart;
    }

    async getCartByID(req){
        const id = req.params.id;
        req.logger.debug(`Got the following id: ${id}`)

        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };
        
        const cart = await cartsDao.getByID(id);
        req.logger.info( `Found cart ${id}`) 
        return cart;
    }

    async addProductToCart(req){
        const id = req.params.id;
        const data = req.body;
        const user = req.user.email;

        req.logger.debug(`Got the following id: ${id}`)

        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };

        data.forEach( async (data) => {
            let {product, quantity} = data;

            req.logger.debug(`Processing the following product: \n* id: ${product}\n* quantity: ${quantity} (this field is optional)`)

            req.logger.debug(`Retrieving product ${product} information`); 
            const productInfo = await ProductValidator.getProductByID(req, product);

            req.logger.debug(`Owner: ${productInfo.owner}, User: ${user}`); 
            
            if(productInfo.owner == user){
                req.logger.warning('The owner of a product cannot buy its own product');
                throw new Error('The owner of a product cannot buy its own product');
            }

            if(!product) {
                req.logger.warning('Product ID is required');
                throw new Error('Product ID is required');
            }

            if(quantity && isNaN(quantity)) {
                req.logger.warning('Quantity must be a number')
                throw new Error('Quantity must be a number')
            }

            // -- checks if the product is already in the cart, to not accidentally add twice.
            req.logger.debug(`Checking if the product ${product} is already in the cart`)
            const productInCart = await cartsDao.findProduct(id, product);
            if(productInCart){
                await cartsDao.addQuantity(id, product, quantity || 1, req);
                req.logger.debug(`Product was already in the cart, quantity has been updated`)
            }else{
                await cartsDao.addProduct(id, product, quantity || 1);
                req.logger.debug(`Product was added to the cart`)
            }
        })
        req.logger.info('Product(s) have been successfully added to the cart')
        return await cartsDao.getByID(id);
    }

    async addQuantity(id, product, quantity, req){
        req.logger.debug(`Got the following values: \n* Cart: ${id}\n* product: ${product}\n* quantity: ${quantity}`)

        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };
        
        if(!product) {
                req.logger.warning('Product ID is required')
                throw new Error('Product ID is required');
        };
            
        if(!quantity) {
            req.logger.warning('Quantity is required');
            throw new Error('Quantity is required');
        }

        if(isNaN(quantity)){
            req.logger.warning('Quantity must be a number')
            throw new Error('Quantity must be a number')
        }

        req.logger.debug(`Checking if the product is in the cart`)
        const productInCart = await cartsDao.findProduct(id, product);

        if(!productInCart) {
            req.logger.warning('Product not in cart')
            throw new Error('Product not in cart')
        }else{
            const cart = await cartsDao.addQuantity(id, product, quantity);
            req.logger.info('Product quantity was updated')
            return cart;
        }
    }

    async deleteProductFromCart(req){
        const {id, pid} = req.params;

        req.logger.debug(`Got the following values: \n* Cart: ${id}\n* product: ${pid}`)

        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };
        
        if(!pid) {
                req.logger.warning('Product ID is required')
                throw new Error('Product ID is required');
        };
        
        const cart = await cartsDao.deleteProduct(id, pid);
        req.logger.info(`Product ${pid} was deleted from the cart ${id}`)
        return cart;
    }

    async deleteAllProductsFromCart(req){
        const id = req.params.id;

        req.logger.debug(`Got the following values: \n* Cart: ${id}`)

        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };

        const cart = await cartsDao.deleteAllProducts(id);
        req.logger.info(`All products were successfully deleted of cart ${id}`)
        return cart;
    }

    async completePurchase(req){
        const id = req.params.id;
        const user = req.user;

        req.logger.debug(`Got the following values: \n* Cart: ${id}`)
        if(!id) {
            req.logger.warning('Cart ID is required')
            throw new Error('Cart ID is required')
        };

        const purchaser = user.email;
        req.logger.debug(`The purchaser email is ${purchaser}`)

        let cart = await cartsDao.getByID(id);
        if(!cart.products.length) {
            req.logger.warning('Cart is empty')
            throw new Error('Cart is empty')
        };

        const notProcessed = []
        let total = 0;

        req.logger.debug(`Processing the cart products`)
        cart.products.forEach( async item => {
            req.logger.debug(`Checking if we have stock of product ${item.product.id}`)
            if(item.quantity <= item.product.stock){
                req.logger.debug(`There is enough in stock.`)
                let updatedStock = item.product.stock - item.quantity;
                ProductValidator.updateProduct(item.product.id, {stock: updatedStock})
                req.logger.debug(`Updated the product stock in the page`)

                total += item.quantity*item.product.price;
                req.logger.debug(`Added the price to the total`)
                
                await cartsDao.deleteProduct(id, item.product.id);
                req.logger.debug(`Deleted the product ${item.product.id} from the cart ${id}`)
            }else{
                req.logger.debug(`We don't have enough stock of the product ${item.product.id} to complete the sale`)
                notProcessed.push(item.product.id)
            };
        })

        req.logger.debug(`The purchase total is ${total}`)
        if( total == 0 ){
            req.logger.info(`The purchase for ${id} couldn't be completed due to having not enough stock to complete the request`)
            return notProcessed;
        }

        let ticket = TicketValidator.createTicket({total, purchaser});
        req.logger.info(`Successfully created a ticket for the purchase`)

        // No supe resolver para mandar ambas cosas
        // si hago { ticket, notProcessed } o [ticket, not Processed ], no me muestra el ticket en mi end
        // esta solucion tampoco: ticket.not_processed = notProcessed;
        return ticket;
    }
}

export default new CartValidator();