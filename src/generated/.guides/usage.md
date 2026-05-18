# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertUser, getUser, listBrands, listProducts } from '@firebasegen/rocio-mobile-sdk-connector';


// Operation UpsertUser:  For variables, look at type UpsertUserVars in ../index.d.ts
const { data } = await UpsertUser(dataConnect, upsertUserVars);

// Operation GetUser:  For variables, look at type GetUserVars in ../index.d.ts
const { data } = await GetUser(dataConnect, getUserVars);

// Operation ListBrands: 
const { data } = await ListBrands(dataConnect);

// Operation ListProducts: 
const { data } = await ListProducts(dataConnect);


```