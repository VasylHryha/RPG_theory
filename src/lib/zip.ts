import { ContractError } from './errors.js';
import { safePath } from './urls.js';
function crc32(raw:Buffer) { let crc=0xffffffff;for(const b of raw){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0; }
// Small deterministic, UTF-8, uncompressed ZIPs; no dependency or external process.
export function makeZip(files:Map<string,Buffer>) {
  const chunks:Buffer[]=[],central:Buffer[]=[];let offset=0;
  for(const [path,raw] of [...files].sort(([a],[b])=>a.localeCompare(b))) {
    safePath('/'+path);const name=Buffer.from(path),crc=crc32(raw),local=Buffer.alloc(30),record=Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(raw.length,18);local.writeUInt32LE(raw.length,22);local.writeUInt16LE(name.length,26);
    record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(33,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(raw.length,20);record.writeUInt32LE(raw.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);
    chunks.push(local,name,raw);central.push(record,name);offset+=local.length+name.length+raw.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...chunks,directory,end]);
}
export function readZip(raw:Buffer) {
  const files=new Map<string,Buffer>();let offset=0;
  while(offset+4<=raw.length && raw.readUInt32LE(offset)===0x04034b50) {
    if(offset+30>raw.length || raw.readUInt16LE(offset+8)!==0)throw new ContractError('ARCHIVE_FORMAT_FAILURE','Expected stored ZIP');
    const size=raw.readUInt32LE(offset+18),nameSize=raw.readUInt16LE(offset+26),extra=raw.readUInt16LE(offset+28),path=raw.subarray(offset+30,offset+30+nameSize).toString();safePath('/'+path);
    const start=offset+30+nameSize+extra,body=raw.subarray(start,start+size);if(files.has(path) || body.length!==size || crc32(body)!==raw.readUInt32LE(offset+14))throw new ContractError('ARCHIVE_HASH_FAILURE',path);
    files.set(path,body);offset=start+size;
  }
  if(!files.size || raw.readUInt32LE(offset)!==0x02014b50)throw new ContractError('ARCHIVE_FORMAT_FAILURE','Missing directory');
  return files;
}
