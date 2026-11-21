// 12 complete illustrated poses, registered on the same shoe baseline.
export {heroActionsDefinition} from './runner-hero-actions-data.mjs?v=6cd4d142b6b6';
import {heroActionLayout,crouchActionMuzzles,slideActionMuzzles} from './runner-hero-actions-data.mjs?v=6cd4d142b6b6';
export function heroActionMuzzleFor(state='release',facing=1,sliding=true){
 const p=(sliding?slideActionMuzzles:crouchActionMuzzles)[state==='recoil'?1:0];return {x:p.x*(facing<0?-1:1),y:p.y};
}

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
 // Mantém os primeiros instantes da silhueta de corrida para evitar
 // uma troca brusca de corpo; o tempo de agachar segue contínuo.
 if(crouchPose<.16)return null;
 if(reducedMotion)return 2;
 if(crouchPose<.40)return 0;
 if(crouchPose<.76)return 1;
 return crouchPose<.975?2:3;
}

export function drawHeroAction(context,image,frame,{x,y,scale,alpha,facing}){
 const {width:WIDTH,height:HEIGHT,density:DENSITY,x:X,ground:GROUND}=heroActionLayout;
 const factor=scale/(.95*DENSITY);
 context.save();context.globalAlpha*=alpha;context.translate(x,y);
 context.scale(facing===-1?-1:1,1);context.imageSmoothingEnabled=true;
 context.drawImage(image,frame.x,frame.y,WIDTH,HEIGHT,-X*factor,-GROUND*factor,WIDTH*factor,HEIGHT*factor);
 context.restore();
}
