import FirebaseAdmin from "../firebase_admin";
import { InAuthUser } from "../in_auth_user";

const MEMBER_COL = 'member';
const SCR_NAME_COL = 'screen_names';

type AddResult = {result: true; id: string} | { result : false; message: string }

async function add({uid, displayName, email, photoURL  }:InAuthUser): Promise <AddResult>{

  try{
    
    const screenName = (email as String).replace('@gmail.com', '');
    const addResult = await FirebaseAdmin.getInstance()
    .Firebase.runTransaction(async (transaction)=>{
      const memberRef = FirebaseAdmin.getInstance()
      .Firebase.collection('members')
      .doc(uid)
      const screenRef = FirebaseAdmin.getInstance()
      .Firebase.collection('screen_name')
      .doc(screenName)

      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      }
      const memberDoc = await transaction.get(memberRef)
      if(memberDoc.exists){
        //이미 추가된 상태

        return false;

      }
      await transaction.set(memberRef, addData);
      await transaction.set(screenRef, addData);

      return true;
    });
    if(addResult === false){
      return {result: true, id : uid};
    }
    return { result : true, id : uid};

  }catch(err){
    console.error(err);  
    return {result:false , message:'Server error!'};
  }

    

}

const MemberModel = {
  add,
}

export default MemberModel;