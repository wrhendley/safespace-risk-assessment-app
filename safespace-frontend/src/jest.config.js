module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transformIgnorePatterns: ["<rootDir>/node_modules/", "/node_modules/(?!bootstrap)/"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};