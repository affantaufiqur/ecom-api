# Getting started
### installing

1. Clone the repo
2. Run `npm install`
3. Create .env file, take a look at the `env.example` for the content
4. Run `npm run prepare` and then `npm run build`
5. Create a new database, you can name it whatever you want
6. Modify the database information on `drizzle.config.ts`
```ts
  // drizzle.config.ts
  export default {
  // change code below to match your database config
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "root",
    database: "ecom-api",
    port: 3306,
  },
} satisfies Config;
```
if you change the database config,  you also need to change the database confing on `./src/db/migrate.ts` and `./src/config/db/ts`

  
7. Run the migration or generate a new migration by running
```bash
npm run db:generate // to generate a new migration
npm run db:migration // to migrate
```
8. Run `npm run dev` to start the development server

---
## Seeding

1. To seed user into database run `npx tsx ./src/seed/auth.seed.ts`
2. To seed products into database run `npx tsx ./src/seed/products.seed.ts`
3. To seed category into database run `npx tsx ./src/seed/categories.seed.ts`

---

## API Documentation

**All routes below are protected, expect on login, register and GET /products (/products/:id also), you need to have bearer token in the authorization header**.
**You can use either the access token, or refresh token that you will get, after register or login**.

### Register

Endpoint: `POST /api/auth/register`

#### Description
This endpoint allows users to register with the system by providing their email, password, and role.

#### Request Parameters
- `email` (string, required): The email address of the user.
- `password` (string, required, min 6): The password for the user's account.
- `role` ("regular_user" | "seller", required): The role of the user.

#### Example Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "seller"
}
```

#### Example Response
```ts
{
 "user": {
    "id": "string"
    "email": "string",
    "role": "regular_user" | "seller",
    "role_level": 1 | 2
  },
"access_token": "string",
"refresh_token": "string"
}
```

### Login

Endpoint: `POST /api/auth/login`

#### Description
This endpoint allows users to log in to the system using their email and password.

#### Request Parameters
- `email` (string, required): The email address of the user.
- `password` (string, required): The password for the user's account.

#### Example Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Example Response
```ts
{
  "user": {
    "id": "string"
    "email": "string",
    "role": "regular_user" | "seller",
    "role_level": 1 | 2
  },
"access_token": "string",
"refresh_token": "string"
}
```

### Get Current User

Endpoint: `GET /api/auth/current-user`

#### Description
This endpoint allows users to retrieve information about the currently logged-in user.

#### Authentication
Bearer Token: Users must include a valid JWT token in the Authorization header.

#### Example Response
```ts
{
  "user": {
    "id": "string"
    "email": "string",
    "role": "regular_user" | "seller",
    "role_level": 1 | 2
  },
"access_token": "string",
"refresh_token": "string"
}
```

Here's the documentation template for the additional endpoints:

---

### Get Products

Endpoint: `GET /products`

#### Description
This endpoint retrieves a list of products. Users can include optional query parameters to filter the products.

#### Query Parameters
- `page` (integer): Specifies the page number for pagination.
- `q` (string): Searches for products containing the specified keyword.
- `category` (string): Filters products by category.
- `description` (string): Searches for products with descriptions containing the specified keyword.

#### Example Request
```
GET /products?page=1&q=towel&category=home&description=hand%20towel
```

#### Example Response
```ts
{
data: [
        {
          "id": 1,
          "name": "Hand Towel",
          "category": "Home",
          "quantity": 10,
          "price": 9.99,
          "description": "Soft and absorbent hand towel for your home."
        },
        {
          "id": 2,
          "name": "Bath Towel",
          "category": "Home",
          "quantity": 5,
          "price": 14.99,
          "description": "Luxurious bath towel for your bathroom."
        }
    ],
meta: {
  total_item: 999,
  current_page: 15,
  next_page: 16,
  total_page: 250
  }
}
```

### Add Product

Endpoint: `POST /products`

#### Description
This endpoint allows users to add a new product to the system.

#### Request Parameters
- `name` (string, required): The name of the product.
- `category_id` (integer, required): The ID of the category to which the product belongs.
- `quantity` (integer, required): The quantity of the product available.
- `price` (number, required): The price of the product.
- `description` (string, required): A description of the product.

#### Example Request
```json
{
  "name": "Hand Towel",
  "category_id": 1,
  "quantity": 10,
  "price": 999,
  "description": "Soft and absorbent hand towel for your home."
}
```

#### Example Response
```json
{
  "message": "Product added successfully"
}
```

### Get Product by ID

Endpoint: `GET /products/:id`

#### Description
This endpoint retrieves information about a specific product identified by its ID.

#### Example Request
```
GET /products/01HPY54P1DDNFQ7B08143XD7BM
```

#### Example Response
```ts
{
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    description: string;
    price: number;
    quantity: number;
    category_id: number | null;
    seller_id: string | null;
}
```

### Delete Product

Endpoint: `DELETE /products/:id`

#### Description
This endpoint sets the quantity of the specified product to 0, effectively marking it as unavailable.

#### Example Request
```
DELETE /products/01HPY54P1DDNFQ7B08143XD7BM
```

#### Example Response
```json
{
  "message": "Product quantity set to 0"
}
```

### Update Product

Endpoint: `PUT /products/:id`

#### Description
This endpoint allows users to update information about a specific product identified by its ID. All fields are optional.

#### Request Parameters
- `name` (string): The updated name of the product.
- `category_id` (integer): The updated ID of the category to which the product belongs.
- `quantity` (integer): The updated quantity of the product available.
- `price` (float): The updated price of the product.
- `description` (string): The updated description of the product.

#### Example Request
```json
{
  "name": "New Hand Towel Name",
  "price": 12.99
}
```

#### Example Response
```json
{
  "message": "Product updated successfully"
}
```

---

### Get Cart

Endpoint: `GET /cart`

#### Description
This endpoint retrieves the contents of the user's shopping cart based on their JWT token.

#### Authentication
Bearer Token: Users must include a valid JWT token in the Authorization header.

#### Example Response
```ts
{
  data:  [
      {
        "product_id": 1,
        "name": "Hand Towel",
        "quantity": 2,
        "price": 9.99
      },
      {
        "product_id": 2,
        "name": "Bath Towel",
        "quantity": 1,
        "price": 14.99
      }
    ],
  total_price: string,
  total_quantity: number,
  message: string
}
```

### Add Item to Cart

Endpoint: `POST /cart`

#### Description
This endpoint allows users to add a product to their shopping cart.

#### Request Parameters
- `product_id` (string, required): The ID of the product to add to the cart.
- `quantity` (integer, required): The quantity of the product to add to the cart.

#### Example Request
```json
{
  "product_id": "01HPY3MYYB9SD28GXMZWJD0A78",
  "quantity": 2
}
```

#### Example Response
```ts
{
  "message": "New product added to cart" | "Product quantity updated"
}
```

### Update Item Quantity in Cart

Endpoint: `PATCH /cart/:id`

#### Description
This endpoint allows users to update the quantity of a product in their shopping cart.

#### Request Parameters
- `quantity` (integer, required): The updated quantity of the product in the cart.

#### Example Request
```json
{
  "quantity": 3
}
```

#### Example Response
```json
{
  "message": "Product quantity updated"
}
```

### Remove Item from Cart

Endpoint: `DELETE /cart/:id`

#### Description
This endpoint allows users to remove a product from their shopping cart.


#### Example Request
```
DELETE /cart/01HPY3MYYB9SD28GXMZWJD0A78 -> product_id
```

#### Example Response
```json
{
  "message": "Product in cart deleted successfully"
}
```
Here's the documentation for the new endpoints:

---

### Get All User Orders

Endpoint: `GET /orders`

#### Description
This endpoint retrieves all orders placed by the authenticated user, based on their JWT token.

#### Authentication
Bearer Token: Users must include a valid JWT token in the Authorization header.

#### Example Response
```json
[
  {
    "order_id": 1,
    "cart_id": 456,
    "is_paid": "false",
    "total_price": 39.97,
    "quantity": 22
    "date_ordered": "2024-02-18T12:30:45Z"
  },
  {
    "order_id": 2,
    "cart_id": 789,
    "is_paid": "true",
    "total_price": 24.98,
    "quantity": 1
    "date_ordered": "2024-02-17T10:15:20Z"
  }
]
```

### Get User Orders by ID

Endpoint: `GET /orders/:id`

#### Description
This endpoint retrieves details of a specific order placed by the authenticated user, based on the order ID.

#### Authentication
Bearer Token: Users must include a valid JWT token in the Authorization header.

#### Example Request
```
GET /orders/1
```

#### Example Response
```json
{
  "order_id": 1,
  "user_id": 123,
  "cart_id": 456,
  "is_paid": "true",
  "total_price": 39.97,
}
```

### Create Order

Endpoint: `POST /orders`

#### Description
This endpoint allows users to create an order by specifying the cart ID.

#### Request Parameters
- `cart_id` (string, required): The ID of the cart to create an order from.

#### Example Request
```json
{
  "cart_id": "01HPY3MYYB9SD28GXMZWJD0A78"
}
```

#### Example Response
```json
{
  "message": "Order placed successfully"
}
```

Here's the documentation for the new endpoint:

---

### Pay

Endpoint: `POST /pay`

#### Description
This endpoint allows users to make a payment by providing invoice information and card details.

#### Request Parameters
- `invoice` (string, required): The invoice information for the payment.
- `card_info` (object, required): An object containing the card details.
  - `cardNumber` (string, required): The credit/debit card number.
  - `cvv` (number, required): The card verification value (CVV).
  - `expiryMonth` (string, required): The expiration month of the card.
  - `expiryYear` (string, required): The expiration year of the card.

#### Example Request
```json
{
  "invoice": "INV/123456",
  "card_info": {
    "cardNumber": "1234567890123456",
    "cvv": 123,
    "expiryMonth": "12",
    "expiryYear": "2024"
  }
}
```

#### Example Response
```json
{
  "message": "Payment successful",
  "data": {
    "transcationId": "2166699451095975",
    "amount": 100,
    "date": "2024-02-07T09:12:11.268Z"
}
}
```

