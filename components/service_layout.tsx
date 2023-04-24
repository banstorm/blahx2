
import { Box, BoxProps } from "@chakra-ui/react";
import GNB from "./GNB";

interface Props {
  title : string;
  children: React.ReactNode;
}

export const ServiceLayout: React.FC<Props & BoxProps>= function ({title = 'cha-front', children, ...boxProps}){
  return (
  <Box {...boxProps}>
    <head>
      <title>{title}</title>
    </head>
    <GNB />
    {children}
  </Box>)
}