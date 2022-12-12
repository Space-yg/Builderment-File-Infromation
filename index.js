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
 * Gets the resources bytes from the file
 * @param {Uint8Array} fileData The file's data
 * @returns {Uint8Array} the resources bytes from the file
 */
function getResourcesData(fileData) {
    for (let i = fileData.length - 60; i > 0; i--) {
        const found = [];
        for (let j = 0; j < 6; j++) {
            const num = fileData[i + (j * 10)];
            if (11 <= num && num <= 16 && found.every(n => num !== n) && fileData[i + (j * 10) + 1] === 0) found.push(num);
            else break;
        }
        if (found.length === 6) {
            return fileData.slice(i, i + 60);
        }
    }
}

/**
 * Gets amount of resource
 * @param {Uint8Array} data An array of 60 integers
 * @returns {Uint8Array} Resources in the order of Wood, Stone, Iron, Copper, Coal, Wolframite
 */
function getResources(data) {
    const resources = [0, 0, 0, 0, 0, 0];
    // Puts resources in order
    for (let i = 6; i < data.length; i += 10) resources[data[i - 6] - 11] = parseInt(data[i + 1].toString(16) + data[i].toString(16), 16) / 8;
    return resources;
}

/**
 * Gets seed
 * @param {Uint8Array} data An array of 4 integers
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
 * @returns {void}
 */
async function upload(file) {
    // Get file data
    const fileData = new Uint8Array(await file.arrayBuffer());
    // if (fileData[0] != 11) return uploadErrorTag.innerHTML = "Not a Builderment file";
    uploadErrorTag.innerHTML = "";
    
    // Get world data
    const resourcesData = getResourcesData(fileData);
    const resources = getResources(resourcesData);
    const seed = getSeed(fileData.slice(1, 5));
    const size = (fileData[0] === 11) ? fileData[fileData.length - 124] : 100;
    const quality = (fileData[0] === 11) ? fileData[fileData.length - 128] : 100;
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
uploadTag.addEventListener("change", event => (event.target.files.length !== 0) ? upload(event.target.files[0]) : uploadErrorTag.innerHTML = "No file selected");

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