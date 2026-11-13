// Route costumes keep the same physical soldier type and four full running poses.
export const SOLDIER_VARIANTS=Object.freeze({
 brasilia:Object.freeze({actor:'army-run',country:'Brasil',name:'Exército · Brasília'}),
 rio:Object.freeze({actor:'army-rio-run',country:'Brasil',name:'Selva · Rio de Janeiro'}),
 argentina:Object.freeze({actor:'army-argentina-run',country:'Argentina',name:'Montanha · Argentina'}),
 florida:Object.freeze({actor:'army-florida-run',country:'Estados Unidos',name:'Patrulha · Flórida'}),
 'casa-branca':Object.freeze({actor:'army-casa-branca-run',country:'Estados Unidos',name:'Guarda · Casa Branca'})
});
export function soldierVariantFor(stageId='brasilia'){return SOLDIER_VARIANTS[stageId]||SOLDIER_VARIANTS.brasilia;}
