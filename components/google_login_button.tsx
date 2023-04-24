import { Box, Button, Center } from "@chakra-ui/react"

interface Props {
    onClick: () => void
}

export const GoogleLoginButton = function({onClick}:Props) {
  return (<Box>

    <Button size="lg"
     width="full" 
     maxW="md" 
     borderRadius="full" 
     bgColor="#4285f4" 
     color="white"
     leftIcon={<img src="/google.svg" alt="Google 로고" style={{backgroundColor:"white", padding: '8px'}}></img>}
     onClick={onClick}
     >
      구글계정으로시작
      </Button>
å
   
  </Box>)
}