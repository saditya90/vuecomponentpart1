'use strict';

/********* Utility function(s) *********
* UUID generator function - time has been considered so that generated id should not collide.
*/

const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function getUniqueId() {
    let d = new Date().getTime();
    let r = Math.random() % 32;
    let v = Math.ceil(r * d);
    let result = v.toString("32");
    return !isNaN(result[0]) ? (randomChar() + result).toLowerCase() : result.toLowerCase();
}

function randomChar() {
    return s.charAt(Math.floor(Math.random() * s.length));
}
