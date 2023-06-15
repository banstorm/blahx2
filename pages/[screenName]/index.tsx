import { ServiceLayout } from "@/components/service_layout";
import { useAuth } from "@/context/auth_user.context";
import { InAuthUser } from "@/models/in_auth_user";
import { Avatar, Box, Button, Flex,FormControl,FormLabel,position,Switch,Text, Textarea, Tr, useToast, VStack } from "@chakra-ui/react";
import { TriangleDownIcon } from '@chakra-ui/icons';
import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import ResizeTextArea from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
import MessageItem from "@/components/message_item";
import { InMessage } from "@/models/message/in_message";
import { useQuery } from "react-query";

  interface Props {
    userInfo : InAuthUser | null;
  }

 async function postMessage({ 
  uid, 
  message, 
  author
 }:{
   uid : string,
   message : string,
   author?: { 
     displayName : string;
     photoUrl?: string;
   };
 }){
    if(message.length <= 0){
      return {
        result : false,
        message : '메세지를 입력해주세요.',
      };
    }
    try{
      await fetch('api/messages.add',{
        method: 'post',
        headers:{
          'content-type': 'application/Json',
        },
        body: JSON.stringify({
          uid, message, author
        })
      })
      return {
        result : true,

      }
    }catch(err){
      console.error(err);
      return {
        result : false,
        message : '메시지 등록 실패',
      }
    }
 }

 const UserHomePage : NextPage<Props> = function ({userInfo}) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState(false);
  const toast = useToast();
  const {authUser} = useAuth()

  async function fetchMessagesInfo({uid , messageId} : {uid:string, messageId:string}){

    try{
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);  
      if(resp.status === 200){
        const data : InMessage = await resp.json();
        console.log("dddddd~~~~~~~~~~~", data);
        setMessageList((prev)=>{
          const findIndex = prev.findIndex((fv) => fv.id === data.id);
            if(findIndex >= 0){
              const updateArr = [...prev];
              updateArr[findIndex] = data;
              return updateArr;
            }
            return prev;
       
        });
      }
    }catch(err){
      console.error(err);
    }
  }
  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];
  useQuery(messageListQueryKey, 
    async () => 
    await axios.get<{
      totalElements: number;
      totalPages : number;
      page : number;
      size : number;
      content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
      {
        keepPreviousData : true,
        refetchOnWindowFocus : false,
        onSuccess: (data) => {
          setTotalPages(data.data.totalPages);
          setMessageList((prev) => [...prev, ...data.data.content])
        },
      },
  );
      
 
  if(userInfo === null){
    return <p>사용자를 찾을수 없다.</p>
  }
  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  return( 

    <ServiceLayout title={'${userInfo.displayName}의 홈페이지'} minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
         <Flex p="6">
         <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="2" ></Avatar>
          <Flex direction="column" justify="center">
            <Text fontSize="md">{userInfo.displayName}</Text>
            <Text fontSize="xs">{userInfo.email}</Text>
          </Flex>
         </Flex>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex align="center" p="2">
            <Avatar size="xs" src={isAnonymous ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? 'https://bit.ly/broken-link'} mr="2" />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="What do you want to"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="xs"
              mr="2"
              as={ResizeTextArea}
              maxRows={7}
              value={message}
              onChange={(event)=>{
                if(event.currentTarget.value){
                  const l_count = event.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                  if(l_count > 7){
                    toast({
                      title:'Limited char 7!',
                      position: 'top-right'
                    
                  })
                     
                    return 
                  }
                }
                setMessage(event.currentTarget.value);
              }}
              />
              <Button
                disabled={message.length === 0}
                bgColor="#FFB86C"
                color="white"
                colorScheme="yellow"
                variant="solid"
                size="sm"
                onClick={async () =>{
                  const postData : {
                    message : string,
                    uid : string,
                    author?:{
                      displayName: string;
                      photoURL: string;
                    }
                  } = {
                    message,
                    uid : userInfo.uid
                  }
                  if(isAnonymous === false){
                    postData.author = {
                      photoURL : authUser?.photoURL ?? 'https://bit.ly/broken-link',
                      displayName : authUser?.displayName ?? 'Anonymous'
                    }
                  }
                  const messageResp = await postMessage(postData)
                  if(messageResp.result === false){
                    toast({title : '메시지 등록 실패!.', position : 'top-right' })
                  }
                  setMessage('');
                  setMessageListFetchTrigger((prev)=> !prev);
                }}
              >등록</Button>
          </Flex>
            <FormControl display="flex" alignItems="center" mt="1" mx="2" pb="2">
              <Switch
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr="1"
              isChecked={isAnonymous}
              onChange={()=>{
                if(authUser === null){
                  toast({ title: 'Need Login', position: 'top-right'});
                  return
                }
                setAnonymous((prev)=> !prev);
              }} />
              <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">anonymous</FormLabel>

            </FormControl>
        </Box>
        <VStack spacing="12px" mt="6">
          {messageList.map((messageData) => (
             <MessageItem 
             key={`messge-item-${userInfo.uid}-${messageData.id}`}
             item={messageData} 
             uid ={userInfo.uid} 
             displayName={userInfo.displayName ?? ''} 
             photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
             isOwner={isOwner} 
             onSendComplete={()=>{
              fetchMessagesInfo({uid: userInfo.uid, messageId: messageData.id});
             }}
             />
          ))}
        </VStack>
          { totalPages > page && (<Button width="full" mt="2" fontSize="sm" leftIcon={<TriangleDownIcon />} onClick={()=>{
            setPage((p) => p + 1);
          }} >
          더보기
        </Button>
          )}
      </Box>
    </ServiceLayout>
  )
 }

 //들어오면 클라이언트(브라우져)가 아닌 서버사이드에서 데이터를 가져와 Props로 넘겨준다.
 //getServerSideProps <-- 정해진 네임 

 export const getServerSideProps: GetServerSideProps<Props> = async ({query}) => {
  const { screenName } = query;
  if(screenName === undefined){
    return {
      props:{
        userInfo: null,
      }
     
    }
  }
  try{
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    //싱글 쿼터 대신 빽틱을 넣으면 내부 인자를 넣을수 있다.
    const userInfoResponse : AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/member.info/${screenName}`)
   
    return {
      props:{
        userInfo: userInfoResponse.data ?? null,
      }
    }
  }catch(error){
    console.error("에러 ---------------------------",error);
    return {
      props:{
        userInfo: null,
      }
    };
  }
  
 };

 export default UserHomePage;