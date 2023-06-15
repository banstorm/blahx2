import { NextApiRequest, NextApiResponse } from "next";
import BadReqError from "./error/bad_request_error";
import MessageModel from "@/models/message/message.model";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author} = req.body;
  if(uid === undefined){
    throw new BadReqError('uid 누락!');
  }
  if(message === undefined){
    throw new BadReqError('message 누락!');
  }

  await MessageModel.post({uid, message, author});
  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid , page, size} = req.query;
  if(uid === undefined){
    throw new BadReqError('uid 누락!');
  }
  const convertPage = page === undefined ? '1' : page; // 쿼리파라메터에서 언디파인이 떨어질수 있기에 보전 작업
  const convertSize = size === undefined ? '10' : size;
  const uidStr = Array.isArray(uid) ? uid[0] : uid;
  const pageStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  const listResp = await MessageModel.listWithPage({uid : uidStr, page : parseInt(pageStr, 10), size : parseInt(sizeStr, 10)});
  return res.status(200).json(listResp);
}

async function get (req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId} = req.query;
  if(uid === undefined){
    throw new BadReqError('uid 누락!');
  }
  if(messageId === undefined){
    throw new BadReqError('messageId 누락!');
  }

  const uidStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdStr = Array.isArray(messageId) ? messageId[0] : messageId;


  const data = await MessageModel.get({uid:uidStr, messageId:messageIdStr});
  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply} = req.body;
  if(uid === undefined){
    throw new BadReqError('uid 누락!');
  }
  if(messageId === undefined){
    throw new BadReqError('messageId 누락!');
  }
  if(reply === undefined){
    throw new BadReqError('reply 누락!');
  }


  await MessageModel.postReplay({uid, messageId, reply});
  return res.status(201).end();
}

const MessageController = {
  post,
  list,
  get,
  postReply,
}

export default MessageController;