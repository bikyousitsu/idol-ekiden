import { eventId,read,response,participantView } from '../../../lib/event-store';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const id=eventId(req),r=await read(id);return response({...participantView(r.state),event:id,version:r.version});}catch(e){return response({error:(e as Error).message},503);}}
export async function POST(){return response({error:'参加者ページは閲覧専用です'},403);}
