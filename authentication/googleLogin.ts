import {GoogleOauth2} from "../model/authentication/GoogleOauth2";

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIEND_ID);



export class GoogleLogin {

    async verify(token: string | undefined) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIEND_ID
        });
        const payload = ticket.getPayload() as GoogleOauth2;
        if(payload.iss == 'https://accounts.google.com' || payload.iss == 'accounts.google.com') {
            if(payload.aud == process.env.GOOGLE_CLIEND_ID) {
                let secondsSinceEpoch = new Date().getTime() / 1000;
                if(payload.exp != undefined && payload.exp - secondsSinceEpoch > 0) {
                    return payload
                }
            }
        }
        return false
    }
}
