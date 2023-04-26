// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";

import MemberController from "@/controllers/member.controller";
import handleError from "@/controllers/error/handle_error";
import checkSupportMethod from "@/controllers/error/check_support_method";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { method } = req;
  const supportMethods = ['POST'];

  try{
    checkSupportMethod(supportMethods, method);
    await MemberController.add(req, res);

  }catch(err) {
    console.error(err);

    handleError(err, res);
  };

}

  
 