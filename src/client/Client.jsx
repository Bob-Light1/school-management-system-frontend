import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './utility-components/navbar/Navbar'
import { Box } from '@mui/material'
import Footer from './utility-components/footer/Footer'

const Client = () => {
  return (
    <>
      <Navbar />
      <Box 
        sx={
          {
            minHeight:'100vh', 
            paddingTop: "70px", 
          }
        } 
        component={'div'}>
        <Outlet/>
      </Box>
      <Footer />
    </>
  )
}

export default Client
