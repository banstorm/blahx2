

import { NextApiRequest, NextApiResponse } from "next";
import MemberModel from "@/models/member/member.model";
import BadReqError from "./error/bad_request_error";


export async function add(req: NextApiRequest, res: NextApiResponse) {

  const{  uid, email, displayName, photoURL } = req.body;

  if(uid === undefined || uid === null){
    throw new BadReqError(" uid nono!");
  }
  if(email === undefined || email === null){
    throw new BadReqError(" email nono!");
  }

  const addResult = await MemberModel.add({uid, email, displayName, photoURL});

  if(addResult.result === true){
    return res.status(200).json(addResult);
  }
  res.status(500).json(addResult);
}

async function findByScreenname(req: NextApiRequest, res: NextApiResponse) {
  const { screeName } = req.query;

  console.log("screeName들어옴",screeName);
  if(screeName === undefined || screeName === null){
      throw new BadReqError(" screen 누락");
  }
  const extractScrrenName = Array.isArray(screeName) ?  screeName[0]: screeName;
  console.log("extractScrrenName 들어옴",extractScrrenName);
  const findResult = await MemberModel.findByScreenname(extractScrrenName);
  if(findResult === null){
    //존재 하지않음으로 404
    return res.status(404).end();
  }
  console.log("들어옴",findResult);
   res.status(200).json(findResult);
  
}

const MemberController = {
  add,
  findByScreenname,
};

export default MemberController;