// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import handleError from "@/controllers/error/handle_error";
import checkSupportMethod from "@/controllers/error/check_support_method";
import MessageController from "@/controllers/message.controller";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { method } = req;
  const supportMethods = ['POST'];

  try{
    checkSupportMethod(supportMethods, method);
    await MessageController.postReply(req, res);

  }catch(err) {
    console.error(err);

    handleError(err, res);
  };

}

  
 