let compiledModule = null;
let emscriptenModule = null;

//웹 워커 생성
const worker = new Worker("prefetch.worker.js");
worker.onmessage = function (e) {
    compiledModule = e.data;

    emscriptenModule = new Module({ instantiateWasm: onInstantiateWasm });
}

function onInstantiateWasm(importObject, successCallBack) {
    WebAssembly.instantiate(compiledModule, importObject).then(instance => successCallBack(instance));

    return {};
}