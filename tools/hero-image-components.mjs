// Connected illustrated figures and facial skin regions; ignores isolated dust.
export const facePixel=(d,i)=>d[i+3]>160&&d[i]>170&&d[i+1]>80&&d[i+2]<160&&d[i]>d[i+1]*1.12;
export function imageComponents(data,width,height,predicate){
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height),out=[];
 for(let k=0;k<seen.length;k++){
  if(seen[k]||!predicate(data,k*4))continue;
  let n=0,end=1,start=0,x0=width,y0=height,x1=-1,y1=-1;queue[0]=k;seen[k]=1;
  while(start<end){
   const p=queue[start++],x=p%width,y=Math.floor(p/width);n++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const t of [p-1,p+1,p-width,p+width]){
    if(t<0||t>=seen.length||seen[t]||Math.abs(t%width-x)+Math.abs(Math.floor(t/width)-y)!==1||!predicate(data,t*4))continue;
    seen[t]=1;queue[end++]=t;
   }
  }
  if(n>20)out.push({n,x:x0,y:y0,width:x1-x0+1,height:y1-y0+1});
 }
 return out.sort((a,b)=>b.n-a.n);
}
