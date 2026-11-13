// Route costumes keep the same physical soldier type and four full running poses.
export const SOLDIER_VARIANTS=Object.freeze({
 brasilia:Object.freeze({actor:'army-run',combatActor:'army',country:'Brasil',name:'Exército · Brasília'}),
 rio:Object.freeze({actor:'army-rio-run',combatActor:'army-rio-combat',country:'Brasil',name:'Selva · Rio de Janeiro'}),
 argentina:Object.freeze({actor:'army-argentina-run',combatActor:'army-argentina-combat',country:'Argentina',name:'Montanha · Argentina'}),
 paraguai:Object.freeze({actor:'army-paraguai-run',combatActor:'army-paraguai-combat',country:'Paraguai',name:'Patrulha · Paraguai'}),
 florida:Object.freeze({actor:'army-florida-run',combatActor:'army-florida-combat',country:'Estados Unidos',name:'Patrulha · Flórida'}),
 'casa-branca':Object.freeze({actor:'army-casa-branca-run',combatActor:'army-casa-branca-combat',country:'Estados Unidos',name:'Guarda · Casa Branca'})
});
export function soldierVariantFor(stageId='brasilia'){return SOLDIER_VARIANTS[stageId]||SOLDIER_VARIANTS.brasilia;}
