import CustomServerError from "@/controllers/error/custom_server_error";
import { firestore } from "firebase-admin";
import FirebaseAdmin from "../firebase_admin";
import { InMessage, InMessageServer } from "./in_message";
import { InAuthUser } from "../in_auth_user";

const MEMBER_COL = 'members';
const MSG_COL = 'message';
const SCR_NAME_COL = 'screen_name';

const FireStore=FirebaseAdmin.getInstance().FireStore;

async function post({
  uid, message, author
}:{
  uid : string,
  message : string,
  author?: { 
    displayName : string;
    photoUrl?: string;
  },
}){
  const memberRef = FireStore.collection(MEMBER_COL).doc(uid);
  await FireStore.runTransaction(async (transaction) => {

    let messageCount = 1;//최초 설정
    const memberDoc = await transaction.get(memberRef);

    if(memberDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 사용자!'});
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?:number}; 
    if(memberInfo.messageCount !== undefined){
      messageCount = memberInfo.messageCount;// 미리 저장되있엇다면 업데이트
    }
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    const newMessgaeBody:{
      message : string;
      createAt : firestore.FieldValue;
      author?: {
        displayName : string;
        photoUrl?: string;
      };
    } = {
      message,
      messageNo : messageCount,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if(author !== undefined){
      newMessgaeBody.author = author;
    }
    await transaction.set(newMessageRef, newMessgaeBody);
    await transaction.update(memberRef, {messageCount : messageCount + 1 }) // 글의 전체 카운트를 포스트 할때마다 인크리스
  })
}

async function listWithPage({uid , page = 1, size = 10} : {uid: string; page?:number; size?:number;}){
  const memberRef = FireStore.collection(MEMBER_COL).doc(uid);
  const listData = await FireStore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if(memberDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 사용자!'});
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?:number};
    const { messageCount = 0 } = memberInfo;  // 저장되있던 카운트를 가져 온다.
    const totalElements = messageCount !== 0 ?  messageCount - 1 :0; 
    const remains = totalElements % size; // 나머지를 구하고.
    const totalPages = (totalElements - remains) /size + (remains > 0 ? 1:0); // 빼묜 나머지 페이지. 만약 리메인 남았으면 1페이지 추가.
    const startAt = totalElements - (page - 1) * size;
    if(startAt < 0){
      return {
        totalElements,
        totalPages : 0,
        page,
        size,
        content:[], // 스타트가 0이니 아무데이터가 없다는 상태.
      }

    }
    const messageCol = memberRef.collection(MSG_COL).orderBy('messageNo', 'desc').startAt(startAt).limit(size);
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mv)=>{
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id:mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      }as InMessage;
      return returnData;
    });
    return {
      totalElements,
      totalPages,
      page,
      size,
      content: data
    };
  });
  return listData;
}

async function list({uid} : {uid: string;}){
  const memberRef = FireStore.collection(MEMBER_COL).doc(uid);
  const listData = await FireStore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if(memberDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 사용자!'});
    }
    const messageCol = memberRef.collection(MSG_COL).orderBy('createAt', 'desc');
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mv)=>{
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id:mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      }as InMessage;
      return returnData;
    });
    return data;
  });
  return listData;
}

async function get({uid, messageId}: {uid: string, messageId: string}){
  const memberRef = FireStore.collection(MEMBER_COL).doc(uid);
  const messageRef = FireStore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  const data = await FireStore.runTransaction(async (transaction) => { 
    const memberDoc = await transaction.get(memberRef);
    const messageDoc =  await transaction.get(messageRef);
    if(memberDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 사용자!'});
    }
    if(messageDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 문서!'});
    }
    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id : messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  
  });

  return data;
}

async function postReplay({uid, messageId, reply}: {uid: string, messageId: string, reply: string}){
  const memberRef = FireStore.collection(MEMBER_COL).doc(uid);
  const messageRef = FireStore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  await await FireStore.runTransaction(async (transaction) => { 
    const memberDoc = await transaction.get(memberRef);
    const messageDoc =  await transaction.get(messageRef);
    if(memberDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 사용자!'});
    }
    if(messageDoc.exists === false){
      throw new CustomServerError({statusCode:400, message: '존재하지않는 문서!'});
    }
    const messageData = messageDoc.data() as InMessageServer;
    if(messageData.reply !== undefined){
      throw new CustomServerError({statusCode:400, message: '이미 댓글을 입력 했습니다.'});
    }
    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp()});

  })
}

const MessageModel = {
  post,
  list,
  get,
  postReplay,
  listWithPage,
 
};

export default MessageModel;