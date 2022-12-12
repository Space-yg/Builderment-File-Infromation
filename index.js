/**
 * Converts object to string
 * @param {object} object The object
 * @returns {String} The object as a string
 */
function objToString(object, space = "") {
    var obj = ""
    try {
        obj += object.constructor.name + " ";
    } catch {} finally {
        obj += "{\n";
    }
    for (const key in object) {
        obj += space + "  " + key + ": "
        switch (typeof object[key]) {
            case "string":
                obj += "\"" + object[key] + "\"";
                break;
            case "object":
                if (object[key] === null) obj += "null";
                else if (Array.isArray(object[key])) obj += arrToString(object[key], space + "  ");
                else if (space === "      ") obj += "[Object]";
                else if (Object.keys(object[key]).length > 10) obj += "[" + object[key].constructor.name + "]";
                else obj += objToString(object[key], space + "  ");
                break;
            default:
                obj += object[key];
                break;
        }
        obj += ",\n";
    }
    obj += space + "}";
    return obj;
}

// All list are in the order of Wood, Stone, Iron, Copper, Coal, Wolframite
const resourcesNames = ["Wood", "Stone", "Iron", "Copper", "Coal", "Wolframite"];
const ET = [7242, 5028, 7932, 5315, 6954, 3520];

// Other
const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

// HTML Tags
const dragNdropTag = document.getElementById("dragNdrop");
const uploadTag = document.getElementById("file");
const uploadErrorTag = document.getElementById("uploadError");
const fileNameTag = document.getElementById("fileName");
const seedTag = document.getElementById("seed");
const sizeTag = document.getElementById("size");
const qualityTag = document.getElementById("quality");
const ETTag = document.getElementById("ET");

/**
 * Gets amount of resource
 * @param {int[]} data An array of 60 integers
 * @returns {int[][]} Resources in the order of Wood, Stone, Iron, Copper, Coal, Wolframite
 */
function getResources(data) {
    const resources = [0, 0, 0, 0, 0, 0];
    // Puts resources in order
    for (let i = 6; i < data.length; i += 10) resources[data[i - 6] - 11] = parseInt(data[i + 1].toString(16) + data[i].toString(16), 16) / 8;
    return resources;
}

/**
 * Gets seed
 * @param {int[]} data An array of 4 integers
 * @returns {String} The seed
 */
function getSeed(data) {
    var d = "";
    // Reverse and convert ints to hex
    data.reverse().forEach((num) => d += num.toString(16));
    // Get int from hex
    d = parseInt(d, 16);
    // Get seed from int
    if (d === 0) return 0;
    let s = [];
    while (d > 0) {
        s = [base62[d % 62], ...s];
        d = Math.floor(d / 62);
    }
    return s.join("");
}

/**
 * Gets the maximum amount of ETs that can be made in the world per minute
 * @param {int[]} resources The resources amount in the order of Wood, Stone, Iron, Copper, Coal, Wolframite 
 * @returns {float} The maximum amount of ET that can be made in that seed
 */
function getMaxET(resources) {
    var lowest = resources[0] * 30 / ET[0];
    resources.forEach((resource, i) => (resource * 30 / ET[i] < lowest) ? lowest = resource * 30 / ET[i] : lowest);
    return lowest;
}

/**
 * Uploads the file to the website and updates the data in the website.
 * @param {File} file The file that has the world data
 * @returns {None}
 */
async function upload(file) {
    // Get file data
    const fileData = new Uint8Array(await file.arrayBuffer());
    if (fileData[0] != 11) return uploadErrorTag.innerHTML = "Not a Builderment file";
    uploadErrorTag.innerHTML = "";
    // Get world data
    const resources = getResources(fileData.slice(-221, -161));
    const seed = getSeed(fileData.slice(1, 5));
    const size = fileData.slice(-124, -123)[0];
    const quality = fileData.slice(-128, -127)[0];
    const maxET = Math.round(getMaxET(resources) * 1000) / 1000;

    // Set resources in table, seed, world size, and resource quality
    fileNameTag.innerHTML = file.name;
    seedTag.innerHTML = "Seed: " + seed;
    sizeTag.innerHTML = "World Size: " + size;
    qualityTag.innerHTML = "Resource Quality: " + quality;
    ETTag.innerHTML = `Max Earth Token: ${maxET} ET/min`;
    resourcesNames.forEach((resource, i) => document.getElementById("resources" + resource).innerHTML = resources[i]);
}

// Checks if file is changed
uploadTag.addEventListener("change", event => upload(event.target.files[0]));

// Show/hide drag and drop
function drop(event) {
    event.preventDefault();
    if (event.dataTransfer.items.length === 1) {
        uploadErrorTag.innerHTML = "";
        upload(event.dataTransfer.items[0].getAsFile());
    } else {
        uploadErrorTag.innerHTML = "You can only upload one file at a time";
    }
    dragNdropTag.style.visibility = "hidden";
}
function drag(event) {
    event.preventDefault();
    dragNdropTag.style.visibility = "visible";
}
function dragLeave(event) {
    event.preventDefault();
    dragNdropTag.style.visibility = "hidden";
}