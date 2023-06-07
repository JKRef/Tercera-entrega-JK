import ProductValidator from "../dao/validators/product.validator.js";

class ProductsController{
    async getAllProducts(req,res){
        try{
            const products = await ProductValidator.getProducts(req);

            res.status(200).json(products);
        }catch(err){
            res.status(500).json(err)
        }
    }

    async getProductByID(req, res){
        try{
            const product = await ProductValidator.getProductByID(req);

            res.status(200).json(product);
        }catch(err){
            res.status(500).json(err)
        }
    }

    async addProduct(req, res){
        try{
            const product = await ProductValidator.createProduct(req);

            res.status(200).json(product);
        }catch(err){
            res.status(500).json(err)
        }
    }

    async editProduct(req, res){
        try{
            const product = await ProductValidator.updateProduct(req);
            
            res.status(200).json(product);
        }catch(err){
            res.status(500).json({error: err.message})
        }
    }

    async deleteProduct(req, res){
        try{
            const product = await ProductValidator.deleteProduct(req);

            res.status(200).json(product);
        }catch(err){
            res.status(500).json({error: err.message})
        }
    }
}

export default new ProductsController();