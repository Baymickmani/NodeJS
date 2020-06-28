const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb; 

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongoDb.ObjectId(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        let dbOp;
        console.log(this._id);
        if(this._id) {
            // Update the product
            dbOp = db.collection('products')
                     .updateOne({_id: this._id}, {$set: this})

        } else {
            dbOp = db
            .collection('products')
            .insertOne(this)
        }
        return dbOp.then(result=>{
              console.log(result);
          })
          .catch(err => console.log(err));
    }

    static findById(prodId) {
        const db = getDb();
        return db.collection('products')
                 .find({_id: mongoDb.ObjectId(prodId)})
                 .next()
                 .then(product => {
                     console.log(product);
                     return product;
                 })
                 .catch(err => console.log(err))
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
                 .find()
                 .toArray()
                 .then(products => {
                     return products;
                 })
                 .catch(err => console.log(err));
    }

    static deleteById(prodId) {
        const db=getDb();
        console.log(prodId);
        return db.collection('products')
          .deleteOne({_id: new mongoDb.ObjectId(prodId)})
    }
}

module.exports = Product;