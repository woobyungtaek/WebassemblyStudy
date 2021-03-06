const util = require('util');

const MAXIMUM_NAME_LENGTH = 50;
const VALID_CATEGORY_IDS = [100, 101];

const clientData = {
    name: "Women's Mid Rise Skinny Jeans",
    categoryId: "100",
}

let moduleMemory = null;
let moduleExports = null;

const fs = require('fs');
fs.readFile('validate.wasm', function(error, bytes){
    if(error) { throw error; }

    instantiateWebAssembly(bytes);
});

function instantiateWebAssembly(bytes)
{
    moduleMemory = new WebAssembly.Memory({ initial: 256 });

    const importObject = {
        env: {
            __memory_base: 0,
            __table_base: 0,
            'memory' : moduleMemory,
        }
    };

    // 모듈을 다운로드/인스턴스화 한다.
    WebAssembly.instantiate(bytes, importObject).then(result => { moduleExports = result.instance.exports; validateData(); });
}

function setErrorMessage(error) {
    console.log(error);
}

function validateData() {
    let errorMessage = "";
    const errorMessagePointer = moduleExports._Create_Buffer(256); // 모듈 메모리 확보 256바이트

    if (!validateName(clientData.name, errorMessagePointer) || !validateCategory(clientData.categoryId, errorMessagePointer)) {
        errorMessage = getStringFromMemory(errorMessagePointer);
    }

    moduleExports._free_buffer(errorMessagePointer);

    setErrorMessage(errorMessage);
    if (errorMessage === "") {}
}

function validateName(name, errorMessagePointer)
{
    const namePointer = moduleExports._Create_Buffer((name.length + 1));
    copyStringToMemory(name, namePointer);

    const isValid = moduleExports._ValidateName(namePointer, MAXIMUM_NAME_LENGTH, errorMessagePointer);

    moduleExports._free_buffer(namePointer);

    return (isValid === 1);
}

function validateCategory(categoryId, errorMessagePointer) {
    const categoryIdPointer = moduleExports._Create_Buffer((categoryId.length + 1));
    copyStringToMemory(categoryId, categoryIdPointer);

    const arrayLength = VALID_CATEGORY_IDS.length;
    const bytesPerElement = Int32Array.BYTES_PER_ELEMENT;
    const arrayPointer = moduleExports._Create_Buffer((arrayLength * bytesPerElement));

    const bytesForArray = new Int32Array(moduleMemory.buffer);
    bytesForArray.set(VALID_CATEGORY_IDS, (arrayPointer / bytesPerElement));

    const isValid = moduleExports._ValidateCategory(categoryIdPointer, arrayPointer, arrayLength, errorMessagePointer);

    moduleExports._free_buffer(arrayPointer);
    moduleExports._free_buffer(categoryIdPointer);

    return (isValid === 1);
}

function getStringFromMemory(memoryOffset)
{
    let returnValue = "";

    const size = 256;
    const bytes = new Uint8Array(moduleMemory.buffer, memoryOffset, size);

    let character = "";
    for (let i = 0; i < size; i++) {
        character = String.fromCharCode(bytes[i]);
        if (character === "\0") { break; }

        returnValue += character;
    }

    return returnValue;
}

function copyStringToMemory(value, memoryOffset)
{
    const bytes = new Uint8Array(moduleMemory.buffer);
    bytes.set(new util.TextEncoder().encode((value + "\0")), memoryOffset);
}