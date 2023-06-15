import { InMessage } from "@/models/message/in_message";
import ResizeTextArea from 'react-textarea-autosize';
import convertDateToString from "@/utils/convert_data_to_string";
import { Avatar, Box, Button, Divider, Flex,Text, Textarea} from "@chakra-ui/react";
import { useState } from "react";

interface Props{
  uid : string;
  displayName : string;
  photoURL : string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: ()  => void;
}

const MessageItem = function({uid, displayName,photoURL,isOwner,  item, onSendComplete }:Props){
  const [reply, setReply] = useState('');

  async function postReply(){
    const respo = await fetch('/api/messages.add.reply', {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({
        uid,
        messageId : item.id,
        reply,

      }),
    });
    if(respo.status < 300){
      onSendComplete();
    }
  } 

  const haveReply = item.reply !== undefined;
  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex pl="2" pt="2" alignItems="center">
          <Avatar size="xs" src={item.author ? item.author.photoUrl ??  'https://bit.ly/broken-link': 'https://bit.ly/broken-link'} />
          <Text fontSize="xx-small" ml="1">
            {item.author ? item.author.displayName : 'anonymus'}
            </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.500" ml ="1">
            {convertDateToString(item.createAt)}
          </Text>
        </Flex>
      </Box>
      <Box p="2">
        <Box borderRadius="md" borderWidth="1px" p="2">
          <Text whiteSpace="pre-line" fontSize="sm">
             {item.message}
          </Text>
        </Box>
        { haveReply && (
      
           <Box pt="2">
             <Divider />
               <Box display="flex" mt="2" >
                 
                   <Box pt="2">
                       <Avatar size="xs" src={photoURL } mr="2"></Avatar>
                   </Box>
     
                   <Box borderRadius="md" p="2" width="full" bg="gray.100">
                       <Flex alignItems="center">
                         <Text fontSize="xs">{displayName}</Text>
                         <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                           {convertDateToString(item.replyAt!)}
                         </Text>
                       </Flex>
                       <Text whiteSpace="pre-line" fontSize="xs">
                         {item.reply}
                       </Text>
                   </Box>
     
               </Box>
               
           </Box>
        )}
        {haveReply === false && isOwner && (
        
          <Box pt="2">
            <Divider />
            <Box display="flex" mt="2">
                   <Box pt="1">
                       <Avatar size="xs" src={photoURL } mr="2"></Avatar>
                   </Box>
                   <Box borderRadius="md" width="full" bg="green.100" mr="2">
                    <Textarea
                      border="none"
                      boxShadow="none !important"
                      resize="none"
                      minH="unset"
                      overflow="hidden"
                      fontSize="xs"
                      as={ResizeTextArea}
                      placeholder="댓글을 입력해주세요"
                      value={reply}
                      onChange={(e)=>{
                        setReply(e.currentTarget.value);
                      }}
                      />
                   </Box>
                   <Button
                    disabled={reply.length === 0} 
                    colorScheme="pink" 
                    bgColor="#ff75B5" 
                    variant="solid" 
                    size="sm" 
                    onClick={()=>{
                      postReply();
                   }}>등록</Button>


            </Box>
          </Box>
          
          )}
      </Box>

    </Box>
  )
};

export default MessageItem;