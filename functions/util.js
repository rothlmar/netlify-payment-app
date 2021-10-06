function sqStringify(data) {
  return JSON.stringify(data, (key, value) => {
    return typeof value === "bigint" ? parseInt(value) : value;
  })
}

module.exports = {
  sqStringify: sqStringify
}
