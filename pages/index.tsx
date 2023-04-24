import { GoogleLoginButton } from '@/components/google_login_button';
import { ServiceLayout } from '@/components/service_layout';
import { useAuth, userAuth } from '@/context/auth_user.context';
import FirebaseClient from '@/models/firebase_client';
import { Box, Center, Flex, Heading } from '@chakra-ui/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { NextPage } from 'next';



const IndexPage: NextPage = function (){

  const { signInWithGoogle} = useAuth();
return <ServiceLayout title='test' minH="100vt" backgroundColor="gray.50">
  <Box maxW="md" mx="auto" pt="10" >
    <img src ="/main_logo.svg" alt="메인 로고" />
    <Flex justify="center">
        <Heading>#chacha</Heading>
    </Flex>
    
  </Box>
  <Center mt="30">
    <GoogleLoginButton 
    onClick={signInWithGoogle } />
  </Center>

</ServiceLayout>;
} 
export default IndexPage;
