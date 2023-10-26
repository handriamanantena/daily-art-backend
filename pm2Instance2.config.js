module.exports = {
    apps : [
        {
            name: "dailyart-2",
            script: "build/index.js",
            watch: true,
            env: {
                "PORT": 3002,
            }
        }
    ]
}