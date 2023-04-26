import BadReqError from "./bad_request_error";

export default function checkSupportMethod(supportMethods : string[], method?:string){

  if(supportMethods.indexOf(method!) === -1){
    throw new BadReqError("Not Supported Method. ");
  }
  
}