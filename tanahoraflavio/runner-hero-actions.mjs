// 12 complete illustrated poses, registered on the same shoe baseline.
const WIDTH=336,HEIGHT=258,DENSITY=3,X=168,GROUND=246;
const sha256='bd4603c5f94cdf65a46f2b73b7a0a0a5855f2f751050f0c4e8cdd20e7c42e459';
export const heroActionsDefinition={
 url:new URL('./assets/flavio-acoes-v2.webp',import.meta.url).href+'?v='+sha256.slice(0,12),
 width:WIDTH*4,height:HEIGHT*3,sha256,
 frames:Array.from({length:12},(_,i)=>({x:i%4*WIDTH,y:Math.floor(i/4)*HEIGHT,width:WIDTH,height:HEIGHT}))
};

// Do not interpolate or mix drawings. Squat and skid each have their own
// sequence; release is a drawn retraction, not a reversed slide timeline.
export function heroActionFrameFor({type='flavio',airborne=false,hurt=false,landing=false,crouchPose=landing?1:0,
 sliding=false,slidePose=sliding?1:0,slidePhase=sliding?.45:0,slideShot,reducedMotion=false}={}){
 if(type!=='flavio'||airborne||hurt)return null;
 const leaving=!sliding&&slidePose>.12&&!reducedMotion;
 // The held shot can keep its pose while the heel is still extended. Once
 // the leg retracts, it must get its own frame even if recoil is still active.
 if(leaving&&!(slidePose>.72&&slidePhase>=.24&&slidePhase<.9))return 7;
 if(slideShot&&slideShot.state!=='recover')return (sliding||slidePose>.5?10:8)+(slideShot.state==='recoil'?1:0);
 if(sliding){
  if(reducedMotion)return 6;
  // O deslize precisa desenhar a entrada desde o primeiro frame físico.
  // Antes, a primeira fração exibia corrida/agachamento enquanto a hitbox
  // já deslizava por baixo da barreira.
  if(slidePose<=.18||slidePhase<.085)return 4;
  if(slidePhase>=.9)return 7;
  if(slidePhase<.24||slidePose<.68)return 5;
  return 6;
 }
 if(leaving)return 6;
 // Mostra o primeiro quadro baixo no mesmo comando físico de agachar.
 if(crouchPose<.16)return landing?0:null;
 if(reducedMotion)return 2;
 if(crouchPose<.40)return 0;
 if(crouchPose<.76)return 1;
 return crouchPose<.975?2:3;
}

export function drawHeroAction(context,image,frame,{x,y,scale,alpha,facing}){
 const factor=scale/(.95*DENSITY);
 context.save();context.globalAlpha*=alpha;context.translate(x,y);
 context.scale(facing===-1?-1:1,1);context.imageSmoothingEnabled=true;
 context.drawImage(image,frame.x,frame.y,WIDTH,HEIGHT,-X*factor,-GROUND*factor,WIDTH*factor,HEIGHT*factor);
 context.restore();
}
