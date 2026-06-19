const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const js = fs.readFileSync('script.js', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => console.log("JSDOM Error:", err));
virtualConsole.on("jsdomError", (err) => console.log("JSDOM jsdomError:", err));

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { runScripts: "dangerously", virtualConsole });

try {
  dom.window.eval(`
    window.localStorage = {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {}
    };
  ` + js);
  console.log("Script executed without throwing.");
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  console.log("DOMContentLoaded fired.");
  console.log("Is addToCart defined?", typeof dom.window.addToCart);
} catch (e) {
  console.log("Eval Error:", e);
}
