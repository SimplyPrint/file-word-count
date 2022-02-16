import {createInterface} from "readline";
import * as fs from "fs";

/**
 * Base created by jvila6 on 11/17/16.
 * Forked & modified by Albert @ SimplyPrint, 02/10/22
 */
export class WordCounter {
    /**
     * Constructor
     * @param folders {Array}
     * @param extensions {Array}
     * @param filebased {Boolean}
     */
    constructor(folders, extensions, base_folder = null, filebased = false) {
        this.folders = folders;
        this.extensions = extensions;
        this.filebased = filebased;
        this.tree = {};
        this.base_folder = base_folder;

        this.total_translations = 0;
        this.files_read = 0;
        this.files_to_read = 0;
    }

    _done() {
        //Finished reading!
        if (this.callback) {
            this.callback({
                files: this.files_read,
                translations: this.total_translations,
                tree: this.tree
            });
        }
    }

    /**
     * Reads and processes file line by line
     */
    countTranslations(callback) {
        this.callback = callback;

        //Start loop!
        this.folders.forEach((dir) => {
            this._readFiles((this.base_folder ? this.base_folder : "") + dir);
        });
    }

    _readFiles(dirname) {
        let filenames = fs.readdirSync(dirname);

        filenames.forEach((filename) => {
            filename = dirname + "/" + filename; //add full dir to var

            if (fs.lstatSync(filename).isDirectory()) {
                //Is directory; loop it!
                this._readFiles(filename);
            } else {
                //Is file; check if file type is supported...
                let ext = filename.split(".").pop();
                if (this.extensions.includes(ext)) {
                    //Read!
                    try {
                        let reader = createInterface({
                            input: fs.createReadStream(filename)
                        });
                        this.files_to_read++;

                        reader.on("line", line => this._readLine(line, filename));
                        reader.on("close", () => {
                            this.files_read++;

                            if (this.files_read === this.files_to_read) {
                                //Done reading all files
                                this._done();
                            }
                        })
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });
    }

    /**
     * Updates tree with the words contained in line
     * @param line {String}
     * @param filename {String}
     * @private
     */
    _readLine(line, filename) {
        let check = line.indexOf("__([");
        if (check !== -1) {
            //Has translation in string
            let first = line.substring(check),
                end = line.substring(check).indexOf("]");

            if (end !== -1) {
                let split = first.substring(0, end),
                    trans = split.replace("__([", "").replace("]", ""),
                    prettyKey = trans.replace(/"/g, "").replace(/ /g, "");

                this.total_translations++;

                let key = this.filebased ? filename : prettyKey;

                //Add to list, or update count!
                if (typeof this.tree[key] !== "undefined") {
                    //Update
                    this.tree[key].count++;

                    if (this.filebased) {
                        if (!this.tree[key].translations.includes(prettyKey)) {
                            this.tree[key].translations.push(prettyKey);
                        }
                    } else {
                        if (!this.tree[key].files.includes(filename)) {
                            this.tree[key].files.push(filename);
                        }
                    }
                } else {
                    //Add
                    if (this.filebased) {
                        //Key is file
                        this.tree[key] = {
                            count: 1,
                            translations: [
                                prettyKey
                            ]
                        };
                    } else {
                        //Key is translation
                        this.tree[key] = {
                            count: 1,
                            files: [
                                filename
                            ]
                        };
                    }
                }

                //Check if there's more to read;
                this._readLine(line.substring(check).substring(end), filename);
            }
        }
    }
}
