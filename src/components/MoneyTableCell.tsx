import React from "react";
import { Typography, Box } from "@mui/material";

export default function MoneyTableCell({ num }: { num: number }): JSX.Element {
  return (
    <Box display='flex'>
      <Typography className='roboto-font'>{num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</Typography>
      <Typography className='roboto-font fractional-part'>
        ,{num.toString().split('.')[1]}
      </Typography>
    </Box>
  );
}
