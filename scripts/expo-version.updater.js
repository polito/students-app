module.exports.readVersion = contents => {
  return JSON.parse(contents).expo.version;
};

module.exports.writeVersion = (contents, version) => {
  const json = JSON.parse(contents);
  json.expo.version = version;
  return JSON.stringify(json, null, 2);
};
