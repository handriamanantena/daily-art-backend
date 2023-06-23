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
    host: "http://localhost",
    database: {
        conn: "",
        dbname: "",
        passwordSaltRounds: 10
    }
}

export default config;