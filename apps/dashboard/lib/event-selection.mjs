export const EVENT_STORAGE_KEY='idol-ekiden-admin-event';
export const EVENT_CHOICES=['practice','rehearsal','production'];
export function readEventSelection(storage){try{const v=storage.getItem(EVENT_STORAGE_KEY);return EVENT_CHOICES.includes(v)?v:'practice';}catch{return 'practice';}}
export function saveEventSelection(storage,value){if(!EVENT_CHOICES.includes(value))return false;try{storage.setItem(EVENT_STORAGE_KEY,value);return true;}catch{return false;}}
