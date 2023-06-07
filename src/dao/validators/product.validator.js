import { ProductService as ProductsDao } from "../../repository/index.repository.js";

class ProductValidator{
    async getProducts(req){
        const sortValidValues = [-1, 1, '-1', '1']
        let query = {};
        
        const {page, limit, sort, category, status} = req.query;
        req.logger.debug(`Got the following values, these are optional \n* page: ${page}\n* limit: ${limit}\n* sort: ${sort}\n* queries: { category: ${category}, status: ${status} }`)

        if(category || status){
            query = {category} || {status}
            req.logger.debug(`Got the following query: ${query}`)
        }

        if(limit) if(isNaN(limit)) {
            req.logger.warning('Limit must be a number over 0')
            throw new Error('Limit must be a number over 0')
        };

        if(page) if(isNaN(page) || page <= 0) {
            req.logger.warning('Page must be a number over 0')
            throw new Error('Page must be a number over 0');
        }

        const options = {page: page || 1, limit: limit || 10}
        req.logger.debug(`Got the following options: \n* page: ${options.page}\n* limit: ${options.limit}`)
        
        if(sortValidValues.includes(sort)){
            req.logger.debug(`Products will be sorted, got the following input: { price: ${sort} }`)
            options.sort = { price: sort }
            return await ProductsDao.getAllProducts( query, options )
        }else{
            if(sort) {
                req.logger.warning('Sort values can only be 1 or -1')
                throw new Error('Sort values can only be 1 or -1')
            }
        }
        const products = await ProductsDao.getAllProducts( query, options );
        req.logger.info('Got the products!');
        return products;
    }

    async getProductByID(req, pid){
        const id = pid || req.params.id;
        
        if(!id) {
            req.logger.warning('Product ID is required.')
            throw new Error('Product ID is required.');
        }

        req.logger.debug(`Got the following id: ${id}`)
        
        const product = await ProductsDao.getProductByID(id)
        req.logger.info( `Found product ${id}`) 
        return product;
    }

    async createProduct(req){
        let owner;

        if(req.user.role == 'premium') {
            owner = req.user.email
        }else if(req.user.role == 'admin') owner = 'admin'

        req.logger.debug(`The owner of this product is ${owner}`)

        const {title, description, code, price, status=true, stock, category, thumbnails} = req.body;

        req.logger.debug(`Got the following values \n* title: ${title}\n* description: ${description}\n* code: ${code}\n* price:${price}\n* stock: ${stock}\n* status: ${status}\n* category: ${category}\n* thumbnails: ${thumbnails}`);

        if( !title || !description || !code || !price || typeof status != 'boolean' || !stock || !category ) {
            req.logger.warning('Missing required fields')
            throw new Error('Missing required fields')
        };

        const product = ProductsDao.createProduct({title, description, owner, code, price, stock, status, category, thumbnails});
        req.logger.info('Product added to the DB');
        return product;
    };

    async updateProduct(req){
        const id = req.params.id;
        const {title, description, code, price, stock, category, thumbnails} = req.body;
        const user = req.user;

        req.logger.debug(`Got the following id: ${id}`)

        if(!id) {
            req.logger.warning('Product ID is required')
            throw new Error('Product ID is required');
        }

        req.logger.debug(`Retrieving product ${id} information`); 
        const productInfo = await ProductsDao.getProductByID(id)

        if(user.role != 'admin') if(productInfo.owner != user.email){
            req.logger.warning('Only the admin or owner of this product can edit its information')
            throw new Error('Only the admin or owner of this product can edit its information');
        }

        const product = await ProductsDao.updateProduct(id, {title, description, code, price, stock, category, thumbnails});
        req.logger.info(`Product ${id} information updated`);
        return product;
    }

    async deleteProduct(req){
        const id = req.params.id;
        const user = req.user;

        if(!id) {
            req.logger.warning('Product ID is required.')
            throw new Error('Product ID is required');
        }

        req.logger.debug(`Retrieving product ${id} information`); 
        const productInfo = await ProductsDao.getProductByID(id)

        if(user.role != 'admin') if(productInfo.owner != user.email){
            req.logger.warning('Only the admin or owner of this product can delete it')
            throw new Error('Only the admin or owner of this product can delete it');
        }
        
        const product = await ProductsDao.deleteProduct(id);
        req.logger.info(`Product ${id} was successfully deleted`);
        return product;
    }
}

export default new ProductValidator();