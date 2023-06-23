const config = {
    comments: {
        maxRecentComments: 10
    },
    authentication: {
        google: {
            client_id: 'TODO'
        }
    },
    session: {
        secret: 'TODO'
    },
    token: {
        secret: 'TODO',
        expire: '1h'
    },
    refreshToken: {
        secret: 'TODO',
        expire: '7d',
    },
    ssl: {
        certPath: "TODO",
        keyPath: "TODO"
    },
    host: "http://localhost",
    database: {
        conn: "",
        dbname: "",
        passwordSaltRounds: 10
    },
    filePath: "./public/files/"
};

export default config;