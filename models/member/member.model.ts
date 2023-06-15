import FirebaseAdmin from "../firebase_admin";
import { InAuthUser } from "../in_auth_user";

const MEMBER_COL = 'member';
const SCR_NAME_COL = 'screen_name';

type AddResult = {result: true; id: string} | { result : false; message: string }

async function add({uid, displayName, email, photoURL  }:InAuthUser): Promise <AddResult>{

  try{
    
    const screenName = (email as String).replace('@gmail.com', '');
    const addResult = await FirebaseAdmin.getInstance()
    .FireStore.runTransaction(async (transaction)=>{
      const memberRef = FirebaseAdmin.getInstance()
      .FireStore.collection('members')
      .doc(uid)
      const screenRef = FirebaseAdmin.getInstance()
      .FireStore.collection('screen_name')
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

async function findByScreenname(screenName:string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().FireStore.collection(SCR_NAME_COL).doc(screenName);

  
  const memberDoc = await memberRef.get();

  
  console.log("findByScreenname  data ---",memberDoc.exists);
  if(memberDoc.exists === false){
    return null;
  }
  const data = memberDoc.data() as InAuthUser;
  console.log("findByScreenname  data ---",data);
  return data;

}
const MemberModel = {
  add,
  findByScreenname,
}

export default MemberModel;