module.exports = {
    apps : [
        {
            name: "dailyart-1",
            script: "build/index.js",
            watch: true,
            env: {
                "PORT": 3001,
            }
        }
    ]
}