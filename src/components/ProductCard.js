import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import { useSnackbar } from "notistack";
import "./ProductCard.css";
import axios from "axios";



const ProductCard = ({ product, handleAddToCart }) => {
  
  const {enqueueSnackBar} = useSnackbar();
  const username = localStorage.getItem('username');

  
  // const handleOnClick = (e) => {
  //   if(!username) {
  //     enqueueSnackBar("Login to add an item to the Cart", { variant: "error" });
  //   }
  //   else {
     
  //   }
  // }

  return (
    <Card className="card">
      <CardMedia 
          component="img"
          alt="product"
          // height="250"
          // weidth="250"
          image={product.image}
          />
          <CardContent>
              <Typography gutterBottom variant="h5" component="legend">
                  {/* Tan Leatherette Weekender Duffle */}
                  {product.name}
              </Typography>
              <Typography gutterBottom variant="h5" component="div">
                  <b>${product.cost}</b>
              </Typography>
              
              <Rating name="read-only" value={product.rating} readOnly />
          </CardContent>

          <CardActions className="card-actions">
              <Button fullWidth className="card-button" variant="contained" onClick={handleAddToCart}><AddShoppingCartOutlined />ADD TO CART</Button>
           </CardActions>
    </Card>
  );
};

export default ProductCard;
