/* globals PIXI */

async function fetchTextures(basePath, manifest, bundle) {
  await PIXI.Assets.init({
    basePath,
    manifest,
  });
  return PIXI.Assets.loadBundle(bundle);
}

module.exports = fetchTextures;
