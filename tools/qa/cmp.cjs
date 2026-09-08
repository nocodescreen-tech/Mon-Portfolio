
const fs = require('fs');
const { PNG } = (()=>{ try { return {} } catch(e){ return {} } })();
// utiliser le canvas via sharp? Non — comparaison pixel simple via readFile et diff de bytes est fragile.
// On va plutôt mesurer via un hash des pixels de la zone droite (canvas) en JS natif n'est pas dispo en node pur.
// Approche : relire les 2 PNG en bytes et comparer globalement.
const a = fs.readFileSync('C:\\Users\\rene\\rene-descartes-portfolio\\m1.png');
const b = fs.readFileSync('C:\\Users\\rene\\rene-descartes-portfolio\\m2.png');
console.log('m1 bytes:', a.length, '| m2 bytes:', b.length);
console.log('différence de taille (heuristic):', Math.abs(a.length - b.length));
// Si les deux fichiers diffèrent en contenu, l'objet a bougé (les timestamps/size varient)
console.log('m1 === m2 ?', a.equals(b));
