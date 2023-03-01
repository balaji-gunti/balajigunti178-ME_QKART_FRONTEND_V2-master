import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom, getTotalCartValue } from "./Cart";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]); // apidata
  const [filteredProducts, setfilteredProducts] = useState([]); // api data for search
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  // const [debounceTimer, setDebounceTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const productsClone = [...products];
  const [cartData, setCartData] = useState([]);
  const [items, setItems] = useState([]);

  // RUNS FOR FIRST PAGE LOAD

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
   const performAPICall = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.endpoint}/products`);
      // console.log(response.data)
      setLoading(false);
      const productsReceived = response.data;
      setProducts(productsReceived);
      console.log(products)
      setfilteredProducts(productsReceived);
    } catch (e) {
      setLoading(false);
      enqueueSnackbar("product not found", { variant: "error" });
    }
  };
  // RUNS EVERY TIME WHEN THE SEARCHTEXT CHANGES IN THE SEARCH BAR
  // useEffect(() => {
  //   performSearch(searchText);
  // }, [searchText])

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
   const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      const productsReceived = response.data;
      setProducts(productsReceived);
      // setfilteredProducts(productsReceived);
    } catch (e) {
      // console.log(e.response.status)
      // enqueueSnackbar("No products found", { variant: "error" })
      if (e.response) {
        if (e.response.status === 404) {
          setProducts([]);
        }
        if (e.response.status === 500) {
          enqueueSnackbar(e.response.message, { variant: "error" });
          setProducts(products);
        }
      } else {
        enqueueSnackbar("Backend isnt running", { variant: "error" });
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
   const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(async () => {
      await performSearch(value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  useEffect(() => {
   const load = async()  => {
    performAPICall();
    const cartItems = await fetchCart(token);
    // generateCartItemsFrom(cartData, products);

    await updateCartItems(cartItems, products);
   }
    
   load();
  }, []);

  // useEffect(() => {
  //   generateCartItemsFrom(cartData, products);

  // }, [cartData])

  // useEffect(() => {
  //   if(token) {
  //     fetchCart(token)
  //     .then((cartData) => {
  //       return generateCartItemsFrom(cartData, products);
  //     })
  //     .then((res) => {
  //       setItems(res);
  //     })
  //   }
  // }, [cartData])
  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response);
      setItems(response.data);
      setCartData(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  const updateCartItems = (cartData, products) => {
    const cartItems = generateCartItemsFrom(cartData, products);
    // console.log(cartItems);
    setItems(cartItems);
    setCartData(cartItems);
    // console.log(cartItems)
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    // return items.find((item) => item._id === productId);
    for(let i = 0; i<items.length; i++) {
      if(productId === items[i].productId){
        return true;
      }
    }
    return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token && options.preventDuplicate) {
      enqueueSnackbar("Login to add an item to the cart", {
        variant: "warning",
      });
      return;
    }

    if (isItemInCart(items, productId) && options.preventDuplicate) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId: productId, qty: qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateCartItems(response.data, products);
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  const handleQuantity = async (token, items, products, productId, qty) => {
    // console.log('entered')
    if (token) {
      // console.log('entered if')
      try {
        // console.log('entered try')
        const response = await axios.post(
          `${config.endpoint}/cart`,
          { productId: productId, qty: qty },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log('made post call')

        let data = response.data;
        // console.log(data);
        // let fullDetails = generateCartItemsFrom(data, products);
        setItems(data);
        // getTotalCartValue(data);
        updateCartItems(response.data, products);
      } catch (e) {
        if (e.response && e.response.status === 400) {
          enqueueSnackbar(e.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar(
            "Could not post data in the cart. Check that the backend is running, reachable and returns valid JSON",
            { variant: "error" }
          );
        }
      }
    }
  };

  return (
    <div>
      <Header children>
      <TextField
        fullWidth
        className="search-desktop"
        size="small"
        InputProps={{
          className: "search",
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
       }}
        />
      </Header>

      {/* Search view for mobiles */}

      <TextField
        fullWidth
        className="search-mobile"
        size="small"
        InputProps={{
          // className: "search",
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
        }}
      />

      {/* PRODUCTS HERO PIC  */}
      <Stack direction={{ md: "row", xs: "column" }} spacing={1}>
        <Grid container spacing={2} mb={2}>
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          {loading ? (
            <Box className="loading">
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <CircularProgress size={25} color="primary" />
                <b>Loading Products...</b>
              </Stack>
            </Box>
          ) : (
            <>
               {products.length ? (
                products.map((product) => {
                  return (
                    <Grid item md={3} xs={6}>
                      <ProductCard
                        product={product}
                        key={product._id}
                        handleAddToCart={() => {
                          addToCart(
                            token,
                            // cartData,
                            items,
                            products,
                            product._id,
                            1,
                            { preventDuplicate: true }
                          );
                        }}
                      />
                    </Grid>
                  );
                })
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4 style={{ color: "#636363 " }}>No products found</h4>
                </Box>
              )}
            </>
          )}
        </Grid>
        {username ? (
          <div style={{ backgroundColor: "#E9F5E1" }}>
            
            <Cart
              products={filteredProducts}
              items={items}
              handleQuantity={handleQuantity}
            />
          </div>
        ) : (
          <></>
        )}
      </Stack>
      <Footer />
    </div>

  );
};

export default Products;
