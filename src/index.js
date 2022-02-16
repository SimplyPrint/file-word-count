import {WordCounter} from './WordCounter.js';
import {exec} from 'child_process';

let base = "C:/Users/alber/Dropbox/SimplyPrint/Websites/FULL NEW REWRITE/";

/*
 * Build translation files from what is actually used in JS
 */
let wordCounter = new WordCounter([
    //Directories to look in
    "projects/Main-Site/public/assets/js",
], [
    //Filetypes
    "js"
], base, true);

//Start counting!
wordCounter.countTranslations((data) => {
    console.log("Finished!");
    console.log(data);

    /*exec("php index.php " + JSON.stringify(data.tree), function (error, stdout, stderr) {
        //Done!
    });*/
}, true);

/*
 * Check total used translations
 */
wordCounter = new WordCounter([
    //Directories to look in
    "projects/Main-Site/app",
    "projects/Main-Site/functions",
    "projects/Main-Site/assets",
    "projects/Main-Site/public",
    "projects/Main-Site/routes",
], [
    //Filetypes
    "twig",
    "php",
    "js"
], base);

//Start counting!
wordCounter.countTranslations((data) => {
    console.log("Finished!");
    console.log(data);

    /*exec("php index.php " + JSON.stringify(data.tree), function (error, stdout, stderr) {
        //Done!
    });*/
}, true);
