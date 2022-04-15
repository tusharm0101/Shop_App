class Product {
    constructor(id, owenerId, ownerPushToken, title, imageUrl, description, price) {
        this.id = id;
        this.owenerId = owenerId;
        this.imageUrl = imageUrl;
        this.pushToken = ownerPushToken; 
        this.title = title;
        this.description = description;
        this.price = price;
    }
}

export default Product;