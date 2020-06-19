import { Client } from "https://deno.land/x/postgres/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

import { Product } from "../types.ts";
import { dbCreds } from "../config.ts";

const client = new Client(dbCreds);

// @desc GET all products
// @route GET /api/v1/products
const getProducts = async ({ response }: { response: any }) => {
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM products;");

    const products = new Array();

    result.rows.map((p) => {
      let obj: any = new Object();

      result.rowDescription.columns.map((element, index) => {
        obj[element.name] = p[index];
      });

      products.push(obj);
    });

    response.status = 200;
    response.body = {
      success: true,
      data: products,
    };
  } catch (err) {
    console.log(err);
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }
};

// @desc GET single products
// @route GET /api/v1/products/:id
const getProduct = async (
  { params, response }: { params: { id: string }; response: any },
) => {
  try {
    await client.connect();

    const result = await client.query(
      "SELECT * FROM products WHERE id=$1;",
      params.id,
    );

    if (result.rows.toString() === "") {
      response.status = 404;
      response.body = {
        success: false,
        msg: `No product with id: ${params.id}`,
      };
      return;
    } else {
      const product: any = new Object();

      result.rows.map((p) => {
        result.rowDescription.columns.map((element, index) => {
          product[element.name] = p[index];
        });
      });
      response.status = 200;
      response.body = {
        success: true,
        data: product,
      };
    }
  } catch (err) {
    console.log(err);
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }
};

// @desc add product
// @route POST /api/v1/products
const addProduct = async (
  { request, response }: { request: any; response: any },
) => {
  const body = await request.body();
  const product = body.value;

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No Data",
    };
  } else {
    try {
      await client.connect();

      const result = await client.query(
        "INSERT INTO products(name, description, price) VALUES($1, $2, $3);",
        product.name,
        product.description,
        product.price,
      );

      response.status = 200;
      response.body = {
        success: true,
        data: product,
      };
    } catch (err) {
      console.log(err);
      response.status = 500;
      response.body = {
        success: false,
        data: product,
      };
    } finally {
      await client.end();
    }
  }
};

// @desc Update single products
// @route PUT /api/v1/products/:id
const updateProduct = async (
  { params, request, response }: {
    params: { id: string };
    request: any;
    response: any;
  },
) => {
  await getProduct({ params: { "id": params.id }, response });

  if (response.status === 404) {
    response.status = 404;
    response.body = {
      success: false,
      msg: `No product with id: ${params.id}`,
    };
    return;
  } else {
    const body = await request.body();
    const product = body.value;

    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No Data",
      };
    } else {
      try {
        await client.connect();

        const result = await client.query(
          "UPDATE products SET name=$1, description=$2, price=$3 WHERE id=$4;",
          product.name,
          product.description,
          product.price,
          params.id,
        );

        response.status = 200;
        response.body = {
          success: true,
          data: product,
        };
      } catch (err) {
        console.log(err);
        response.status = 500;
        response.body = {
          success: false,
          data: product,
        };
      } finally {
        await client.end();
      }
    }
  }
};

// @desc DELETE single products
// @route DELETE /api/v1/products/:id
const deleteProduct = async (
  { params, response }: { params: { id: string }; response: any },
) => {
  await getProduct({ params: { "id": params.id }, response });

  if (response.status === 404) {
    response.status = 404;
    response.body = {
      success: false,
      msg: `No product with id: ${params.id}`,
    };
    return;
  } else {
    try {
      await client.connect();

      const result = client.query(
        "DELETE FROM products WHERE id=$1",
        params.id,
      );

      response.status = 204;
      response.body = {
        success: true,
        msg: `Product with id: ${params.id} deleted`,
      };
    } catch (err) {
      console.log(err);
      response.status = 500;
      response.body = {
        success: false,
        msg: err.toString(),
      };
    }
  }
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
