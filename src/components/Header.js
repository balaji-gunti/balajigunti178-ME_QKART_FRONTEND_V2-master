import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import "./Header.css";



  
  
  const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const handleLogin = () => {
    history.push("/login");
  };
  const handleRegister = () => {
    history.push("/register");
  };
  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };


    // return (
    //   <Box className="header">
    //     <Box className="header-title">
    //         <img src="logo_light.svg" alt="QKart-icon"></img>
    //     </Box>
    //     {hasHiddenAuthButtons ?  children
    //           : <Button
    //           className="explore-button"
    //           startIcon={<ArrowBackIcon />}
    //           variant="text"
    //           onClick={() =>{history.push("/")}}
    //         >
    //           Back to explore
    //         </Button>
    //   }
        
    //   </Box>
    // );

    
    

    if (hasHiddenAuthButtons) {
      return (
        <Box className="header">
          <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
          </Box>
          <div>{children}</div>
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={() =>{history.push("/")}}
          >
            Back to explore
          </Button>
        </Box>
      );
    }

    return (
      <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      <div>{children}</div>
      {!localStorage.getItem("username") ? (
        <Stack direction="row" spacing={2}>
          <Button variant="text" role="button" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="contained" role="button" onClick={handleRegister}>
            Register
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Avatar alt={localStorage.getItem("username")} src="avatar.png" />
          <Button variant="text" role="button">
            {localStorage.getItem("username")}
          </Button>
          <Button variant="text" role="button" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      )}
    </Box>
    )
};

export default Header;
